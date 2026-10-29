import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  current: vi.fn(),
  owner: vi.fn(),
  saved: vi.fn(),
  update: vi.fn(),
  filters: [] as Array<[string, unknown]>,
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: () => {
      // Tiga baca/tulis dibedakan dari kolom yang dipilih: status Pendaftar, pemilik Nomor VA, dan hasil update.
      let columns = '';
      const builder = {
        select: (selected: string) => { columns = selected; return builder; },
        update: (values: unknown) => { mocks.update(values); return builder; },
        eq: (column: string, value: unknown) => { mocks.filters.push([column, value]); return builder; },
        neq: (column: string, value: unknown) => { mocks.filters.push([`not ${column}`, value]); return builder; },
        is: (column: string, value: unknown) => { mocks.filters.push([`is ${column}`, value]); return builder; },
        maybeSingle: () => (columns === 'status,diumumkan_pada' ? mocks.current() : columns === 'id' ? mocks.saved() : mocks.owner()),
      };
      return builder;
    },
  }),
}));

import { saveNomorVaAction } from '../saveNomorVaAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const idle = { status: 'idle' as const, message: '' };

function form(values: Record<string, string>) {
  const data = new FormData();
  data.set('participantId', participantId);
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe('saveNomorVaAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filters.length = 0;
    mocks.session.mockResolvedValue(true);
    mocks.current.mockResolvedValue({ data: { status: 'Diterima', diumumkan_pada: null }, error: null });
    mocks.owner.mockResolvedValue({ data: null, error: null });
    mocks.saved.mockResolvedValue({ data: { id: participantId }, error: null });
  });

  it('saves a 16-digit Nomor VA for a Pendaftar Diterima and refreshes the detail and list', async () => {
    const result = await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120' }));
    expect(result).toEqual({ status: 'success', message: 'Nomor VA disimpan.' });
    expect(mocks.update).toHaveBeenCalledWith({ nomor_va: '7456012627300120' });
    expect(mocks.filters).toContainEqual(['status', 'Diterima']);
    expect(mocks.filters).toContainEqual(['is diumumkan_pada', null]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  });

  it('strips spaces and dashes pasted from the bank list', async () => {
    await saveNomorVaAction(idle, form({ nomorVa: ' 7456-0126 2730 0120 ' }));
    expect(mocks.update).toHaveBeenCalledWith({ nomor_va: '7456012627300120' });
  });

  it('rejects a Nomor VA that is not exactly 16 digits', async () => {
    for (const nomorVa of ['745601262730012', '74560126273001201', '7456O12627300120']) {
      const result = await saveNomorVaAction(idle, form({ nomorVa }));
      expect(result).toEqual({ status: 'error', message: 'Nomor VA harus 16 digit angka.' });
    }
    expect(await saveNomorVaAction(idle, form({ nomorVa: '  ' }))).toEqual({ status: 'error', message: 'Isi Nomor VA terlebih dahulu.' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects a Nomor VA already used by another Pendaftar and names that Pendaftar', async () => {
    mocks.owner.mockResolvedValue({ data: { nama_lengkap: 'SITI AMINAH', nomor_pendaftaran: 'OB-2027-004' }, error: null });
    const result = await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120' }));
    expect(result).toEqual({ status: 'error', message: 'Nomor VA sudah dipakai Siti Aminah (OB-2027-004).' });
    expect(mocks.filters).toContainEqual(['nomor_va', '7456012627300120']);
    expect(mocks.filters).toContainEqual(['not id', participantId]);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('reports a duplicate caught by the database unique index', async () => {
    mocks.saved.mockResolvedValue({ data: null, error: { code: '23505' } });
    const result = await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120' }));
    expect(result).toEqual({ status: 'error', message: 'Nomor VA sudah dipakai pendaftar lain.' });
  });

  it('clears the Nomor VA', async () => {
    const result = await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120', clear: '1' }));
    expect(result).toEqual({ status: 'success', message: 'Nomor VA dikosongkan.' });
    expect(mocks.update).toHaveBeenCalledWith({ nomor_va: null });
    expect(mocks.owner).not.toHaveBeenCalled();
  });

  it('refuses a Pendaftar that is not Diterima', async () => {
    mocks.current.mockResolvedValue({ data: { status: 'Ditolak', diumumkan_pada: null }, error: null });
    const result = await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120' }));
    expect(result.status).toBe('error');
    expect(result.message).toContain('hanya dapat diisi untuk pendaftar Diterima');
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('locks the Nomor VA once the Diterima result is announced, for changing and clearing alike', async () => {
    mocks.current.mockResolvedValue({ data: { status: 'Diterima', diumumkan_pada: '2027-02-09T01:00:00Z' }, error: null });
    for (const values of [{ nomorVa: '7456012627300121' }, { clear: '1' }] as Array<Record<string, string>>) {
      expect(await saveNomorVaAction(idle, form(values))).toEqual({
        status: 'error', message: 'Nomor VA tidak dapat diubah setelah hasil diumumkan. Tarik pengumuman terlebih dahulu.',
      });
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects missing sessions and invalid participants', async () => {
    mocks.session.mockResolvedValue(false);
    expect((await saveNomorVaAction(idle, form({ nomorVa: '7456012627300120' }))).message).toContain('Sesi admin tidak valid');
    mocks.session.mockResolvedValue(true);
    const data = form({ nomorVa: '7456012627300120' });
    data.set('participantId', 'bukan-uuid');
    expect((await saveNomorVaAction(idle, data)).message).toBe('Data pendaftar tidak valid.');
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
