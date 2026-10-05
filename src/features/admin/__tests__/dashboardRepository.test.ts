import { describe, expect, it, vi } from 'vitest';
import { AdminDashboardLoadError, createAdminDashboardRepository } from '../server/dashboardRepository';

const rows = [
  { id: '1', nama_lengkap: 'Alya Putri', pilihan_kelas: 'Reguler', jenis_pendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', created_at: '2026-10-06T08:00:00Z' },
  { id: '2', nama_lengkap: 'Bima', pilihan_kelas: 'Tahfizh', jenis_pendaftaran: 'Pindahan', status: 'Menunggu Unggahan', created_at: '2026-10-06T09:00:00Z' },
  { id: '3', nama_lengkap: 'Citra', pilihan_kelas: 'Bilingual', jenis_pendaftaran: 'Siswa Baru', status: 'Terverifikasi', created_at: '2026-10-06T10:00:00Z' },
];

function clientReturning(data: unknown[] | null, error: unknown = null) {
  const select = vi.fn().mockResolvedValue({ data, error });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from }, from, select };
}

describe('admin dashboard repository', () => {
  it('builds summary metrics and recent applicants from minimal registration rows', async () => {
    const { client, from, select } = clientReturning(rows);
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(from).toHaveBeenCalledWith('pendaftar');
    expect(select).toHaveBeenCalledWith('id,nama_lengkap,pilihan_kelas,jenis_pendaftaran,status,created_at');
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
    const { client } = clientReturning([]);
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.totalRegistrations).toBe(0);
    expect(summary.classDistribution.every((item) => item.percentage === 0)).toBe(true);
    expect(summary.recentApplicants).toEqual([]);
  });

  it('groups unknown and null categories under Lainnya', async () => {
    const { client } = clientReturning([
      { ...rows[0], id: '4', pilihan_kelas: null, jenis_pendaftaran: 'Lain', status: null },
    ]);
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.classDistribution).toContainEqual({ label: 'Lainnya', count: 1, percentage: 100 });
    expect(summary.typeDistribution).toContainEqual({ label: 'Lainnya', count: 1, percentage: 100 });
  });

  it('limits recent applicants to the newest eight records', async () => {
    const manyRows = Array.from({ length: 10 }, (_, index) => ({
      ...rows[0], id: String(index), nama_lengkap: `Siswa ${index}`, created_at: `2026-10-${String(index + 1).padStart(2, '0')}T08:00:00Z`,
    }));
    const { client } = clientReturning(manyRows);
    const summary = await createAdminDashboardRepository(client).getSummary();

    expect(summary.recentApplicants).toHaveLength(8);
    expect(summary.recentApplicants[0].namaLengkap).toBe('Siswa 9');
  });

  it('returns only a safe error when Supabase fails', async () => {
    const { client } = clientReturning(null, { message: 'secret database detail' });

    await expect(createAdminDashboardRepository(client).getSummary()).rejects.toEqual(
      new AdminDashboardLoadError(),
    );
  });
});
