import { describe, expect, it, vi } from 'vitest';
import { AdminDashboardLoadError, createAdminDashboardRepository } from '../server/dashboardRepository';

const payload = {
  today: '2026-10-18',
  total: 60,
  tasks: { uploading: 4, awaiting: 12, verified: 5, absent: 2, decision: 1, unannounced: 6 },
  attention: { any: 2, nisn: 1 },
  capacity: [{ label: 'Tahfizh', kuota: 28, terpakai: 28 }, { label: 'Reguler', kuota: 28, terpakai: 20 }, { label: 'Bilingual', kuota: 56, terpakai: 48 }],
  seatsByGender: { male: 50, female: 44, unknown: 2 },
  transfers: 7,
  results: { accepted: 40, rejected: 6, withdrawn: 3 },
  acceptedByClass: [{ label: 'Bilingual', count: 20 }, { label: 'Reguler', count: 12 }],
  schedule: [{ date: '2026-10-18', total: 3, waves: [{ wave: 1, count: 2 }, { wave: 3, count: 1 }] }],
};

function clientReturning(data: unknown, error: unknown = null) {
  const rpc = vi.fn().mockResolvedValue({ data, error });
  return { client: { rpc }, rpc };
}

describe('admin dashboard repository', () => {
  it('maps the database-aggregated summary in a single RPC call', async () => {
    const { client, rpc } = clientReturning(payload);
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('get_admin_dashboard_summary');
    expect(summary).toMatchObject({ today: '2026-10-18', totalRegistrations: 64, tasks: payload.tasks, attention: payload.attention, transfers: 7, results: payload.results, seatsByGender: payload.seatsByGender });
  });

  it('counts every Pendaftar whose data has come in, including those still uploading Berkas', async () => {
    const summary = await createAdminDashboardRepository(clientReturning({ ...payload, total: 70, tasks: { ...payload.tasks, uploading: 5 } }).client).getSummary();
    expect(summary.totalRegistrations).toBe(75);
  });

  it('keeps the three program classes in a fixed order, filling missing ones with zero', async () => {
    const summary = await createAdminDashboardRepository(clientReturning(payload).client).getSummary();
    expect(summary.capacity.map(row => row.label)).toEqual(['Reguler', 'Bilingual', 'Tahfizh']);
    expect(summary.capacity[2]).toEqual({ label: 'Tahfizh', kuota: 28, terpakai: 28 });
    expect(summary.acceptedByClass).toEqual([{ label: 'Reguler', count: 12 }, { label: 'Bilingual', count: 20 }, { label: 'Tahfizh', count: 0 }]);
  });

  it('maps Ruang OKB per OKB day in natural order, and null when the database does not report rooms yet', async () => {
    const withRooms = { ...payload, schedule: [{ ...payload.schedule[0], rooms: [{ room: 'Ruang 10', count: 1 }, { room: 'Ruang 2', count: 2 }, { room: null, count: 9 }] }] };
    const summary = await createAdminDashboardRepository(clientReturning(withRooms).client).getSummary();
    expect(summary.schedule[0].rooms).toEqual([{ label: 'Ruang 2', count: 2 }, { label: 'Ruang 10', count: 1 }]);

    const older = await createAdminDashboardRepository(clientReturning(payload).client).getSummary();
    expect(older.schedule[0].rooms).toBeNull();
  });

  it('names each Gelombang OKB counted on an OKB day', async () => {
    const summary = await createAdminDashboardRepository(clientReturning(payload).client).getSummary();
    expect(summary.schedule[0].waves).toEqual([{ label: 'Gelombang 1', count: 2 }, { label: 'Gelombang 3', count: 1 }]);
  });

  it('returns a zero-safe summary when counts are missing', async () => {
    const { client } = clientReturning({ today: '2026-10-18', total: null, capacity: [], acceptedByClass: [], schedule: [] });
    const summary = await createAdminDashboardRepository(client).getSummary();
    expect(summary.totalRegistrations).toBe(0);
    expect(summary.tasks).toEqual({ uploading: 0, awaiting: 0, verified: 0, absent: 0, decision: 0, unannounced: 0 });
    expect(summary.attention).toEqual({ any: 0, nisn: 0 });
    expect(summary.seatsByGender).toEqual({ male: 0, female: 0, unknown: 0 });
    expect(summary.capacity.every(row => row.kuota === 0 && row.terpakai === 0)).toBe(true);
  });

  it('returns only a safe error when Supabase fails or returns an unexpected shape', async () => {
    await expect(createAdminDashboardRepository(clientReturning(null, { message: 'secret database detail' }).client).getSummary())
      .rejects.toEqual(new AdminDashboardLoadError());
    // An older database function without the new fields is treated as a load error, not rendered as zeros.
    await expect(createAdminDashboardRepository(clientReturning({ total: 1, classes: [], types: [], recent: [] }).client).getSummary())
      .rejects.toEqual(new AdminDashboardLoadError());
  });
});
