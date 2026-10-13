import { describe, expect, it, vi } from 'vitest';
import { AdminDashboardLoadError, createAdminDashboardRepository } from '../server/dashboardRepository';

const recent = [
  { id: '3', nama_lengkap: 'Citra', pilihan_kelas: 'Bilingual', jenis_pendaftaran: 'Siswa Baru', status: 'Terverifikasi', created_at: '2026-10-06T10:00:00Z' },
  { id: '2', nama_lengkap: 'Bima', pilihan_kelas: 'Tahfizh', jenis_pendaftaran: 'Pindahan', status: 'Menunggu Unggahan', created_at: '2026-10-06T09:00:00Z' },
  { id: '1', nama_lengkap: 'Alya Putri', pilihan_kelas: 'Reguler', jenis_pendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', created_at: '2026-10-06T08:00:00Z' },
];

const payload = {
  total: 3,
  awaiting: 1,
  incomplete: 1,
  classes: [{ label: 'Reguler', count: 1 }, { label: 'Bilingual', count: 1 }, { label: 'Tahfizh', count: 1 }],
  types: [{ label: 'Siswa Baru', count: 2 }, { label: 'Pindahan', count: 1 }],
  recent,
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
    expect(summary.totalRegistrations).toBe(3);
    expect(summary.awaitingVerification).toBe(1);
    expect(summary.completedRegistrations).toBe(2);
    expect(summary.incompleteUploads).toBe(1);
    expect(summary.classDistribution.map(({ label, count }) => ({ label, count }))).toEqual([
      { label: 'Reguler', count: 1 }, { label: 'Bilingual', count: 1 }, { label: 'Tahfizh', count: 1 },
    ]);
    expect(summary.typeDistribution.map(({ label, count }) => ({ label, count }))).toEqual([
      { label: 'Siswa Baru', count: 2 }, { label: 'Pindahan', count: 1 },
    ]);
    expect(summary.recentApplicants.map((item) => item.namaLengkap)).toEqual(['Citra', 'Bima', 'Alya Putri']);
  });

  it('returns a zero-safe empty summary', async () => {
    const { client } = clientReturning({ total: 0, awaiting: 0, incomplete: 0, classes: [], types: [], recent: [] });
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.totalRegistrations).toBe(0);
    expect(summary.classDistribution.every((item) => item.percentage === 0)).toBe(true);
    expect(summary.recentApplicants).toEqual([]);
  });

  it('groups unknown and null categories under Lainnya', async () => {
    const { client } = clientReturning({
      ...payload,
      total: 1,
      classes: [{ label: null, count: 1 }],
      types: [{ label: 'Lain', count: 1 }],
      recent: [{ ...recent[0], pilihan_kelas: null, jenis_pendaftaran: 'Lain', status: null }],
    });
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.classDistribution).toContainEqual({ label: 'Lainnya', count: 1, percentage: 100 });
    expect(summary.typeDistribution).toContainEqual({ label: 'Lainnya', count: 1, percentage: 100 });
    expect(summary.recentApplicants[0]).toMatchObject({ pilihanKelas: 'Lainnya', jenisPendaftaran: 'Lainnya', status: 'Belum diisi' });
  });

  it('normalizes missing or malformed registration dates', async () => {
    const { client } = clientReturning({
      ...payload,
      recent: [{ ...recent[0], id: '4', created_at: null }, { ...recent[0], id: '5', created_at: 'not-a-date' }],
    });
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.recentApplicants.map((item) => item.createdAt)).toEqual([null, null]);
  });

  it('returns only a safe error when Supabase fails or returns an unexpected shape', async () => {
    await expect(createAdminDashboardRepository(clientReturning(null, { message: 'secret database detail' }).client).getSummary())
      .rejects.toEqual(new AdminDashboardLoadError());
    await expect(createAdminDashboardRepository(clientReturning({ total: 1 }).client).getSummary())
      .rejects.toEqual(new AdminDashboardLoadError());
  });
});
