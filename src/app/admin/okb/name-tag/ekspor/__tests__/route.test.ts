import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), getSupabaseAdmin: vi.fn(), fetchRows: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock('@/features/admin/nameTag/server/nameTagRepository', () => ({ fetchRuangOkbExportRows: mocks.fetchRows }));

import { GET } from '../route';

const request = (query = 'tanggal=2026-11-21&gelombang=1') => new Request(`https://example.test/admin/okb/name-tag/ekspor?${query}`);

describe('Ruang OKB Excel export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.getSupabaseAdmin.mockReturnValue({});
    mocks.fetchRows.mockResolvedValue([{ nomorPendaftaran: 'OB-2027-001', namaLengkap: 'Afiza', jenisKelamin: 'Perempuan', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', ruangOkb: 'Al-Bashir' }]);
  });

  it('requires an admin session before touching any data', async () => {
    mocks.session.mockResolvedValue(false);
    expect((await GET(request())).status).toBe(401);
    expect(mocks.fetchRows).not.toHaveBeenCalled();
  });

  it('rejects an unknown OKB group', async () => {
    expect((await GET(request('tanggal=besok&gelombang=1'))).status).toBe(400);
    expect(mocks.fetchRows).not.toHaveBeenCalled();
  });

  it('downloads the chosen group as a private Excel file', async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(mocks.fetchRows).toHaveBeenCalledWith({}, { tanggal: '2026-11-21', gelombang: 1 });
    expect(response.headers.get('content-type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="ruang-okb-2026-11-21-gelombang-1.xlsx"');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  it('answers with a safe message when the data cannot be read', async () => {
    mocks.fetchRows.mockRejectedValue(new Error('db down: secret detail'));
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain('secret');
  });
});
