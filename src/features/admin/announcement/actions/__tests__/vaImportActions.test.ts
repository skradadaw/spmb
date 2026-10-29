import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VaImportApplicant } from '../../vaImport';

const mocks = vi.hoisted(() => ({ session: vi.fn(), rpc: vi.fn(), revalidatePath: vi.fn(), loadContext: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));
vi.mock('../../server/vaImportRepository', () => ({ loadVaImportContext: mocks.loadContext }));

import { commitVaImportAction, previewVaImportAction } from '../vaImportActions';

const idle = { status: 'idle' as const, message: '' };
const accepted = (nomor: string, overrides: Partial<VaImportApplicant> = {}): [string, VaImportApplicant] => [nomor, { nomorPendaftaran: nomor, namaLengkap: 'SITI', status: 'Diterima', nomorVa: null, diumumkanPada: null, ...overrides }];

function upload(content: string, name = 'va.csv') {
  const data = new FormData();
  data.set('file', new File([content], name, { type: 'text/csv' }));
  return data;
}

describe('Nomor VA import actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.loadContext.mockResolvedValue({ applicants: new Map([accepted('OB-2027-001'), accepted('OB-2027-002', { status: 'Ditolak' })]), vaOwners: new Map() });
    mocks.rpc.mockResolvedValue({ data: { status: 'ok', disimpan: 1 }, error: null });
  });

  it('reports every row without saving anything', async () => {
    const result = await previewVaImportAction(idle, upload('Nomor Pendaftaran,Nomor VA\nOB-2027-001,7456012627300120\nOB-2027-002,7456012627300121\n'));
    expect(result.status).toBe('success');
    expect(result.message).toBe('1 Nomor VA siap disimpan.');
    expect(result.report?.groups.map(group => [group.key, group.rows.length])).toEqual([['cocok', 1], ['bukan-diterima', 1]]);
    expect(result.report?.toSave).toEqual([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('explains an unusable file', async () => {
    expect((await previewVaImportAction(idle, upload('Nama,VA\nSiti,1\n'))).message).toBe('Kolom "Nomor Pendaftaran" dan "Nomor VA" tidak ditemukan di file.');
    expect((await previewVaImportAction(idle, new FormData())).message).toBe('Pilih file Excel atau CSV terlebih dahulu.');
  });

  it('saves the confirmed rows atomically after checking them again', async () => {
    const result = await commitVaImportAction([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }]);
    expect(result).toEqual({ success: true, saved: 1 });
    expect(mocks.rpc).toHaveBeenCalledWith('import_nomor_va', { p_pasangan: [{ nomor: 'OB-2027-001', va: '7456012627300120' }] });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  });

  it('saves nothing when any confirmed row is no longer ready', async () => {
    const result = await commitVaImportAction([
      { nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' },
      { nomorPendaftaran: 'OB-2027-002', nomorVa: '7456012627300121' },
    ]);
    expect(result).toEqual({ success: false, error: 'Data pendaftar sudah berubah sejak file dibaca. Baca ulang file lalu coba lagi.' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('reports what the database refused, without partial saves', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: 'duplicate' }, error: null });
    expect(await commitVaImportAction([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }])).toMatchObject({ success: false, error: expect.stringContaining('sudah dipakai pendaftar lain') });
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'x' } });
    expect(await commitVaImportAction([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }])).toEqual({ success: false, error: 'Nomor VA tidak dapat disimpan. Tidak ada perubahan yang tersimpan.' });
  });

  it('rejects both steps without an admin session', async () => {
    mocks.session.mockResolvedValue(false);
    expect((await previewVaImportAction(idle, upload('x'))).message).toContain('Sesi admin tidak valid');
    expect(await commitVaImportAction([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }])).toMatchObject({ success: false });
    expect(mocks.loadContext).not.toHaveBeenCalled();
  });
});
