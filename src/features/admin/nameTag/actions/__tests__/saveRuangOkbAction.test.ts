import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  update: vi.fn(),
  saved: vi.fn(),
  filters: [] as Array<[string, unknown]>,
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: () => {
      const builder = {
        update: (values: unknown) => { mocks.update(values); return builder; },
        in: (column: string, values: unknown) => { mocks.filters.push([column, values]); return builder; },
        select: () => mocks.saved(),
      };
      return builder;
    },
  }),
}));

import { saveRuangOkbAction } from '../saveRuangOkbAction';

const first = '123e4567-e89b-12d3-a456-426614174000';
const second = '123e4567-e89b-12d3-a456-426614174001';
const third = '123e4567-e89b-12d3-a456-426614174002';
const savedRows = (...ids: string[]) => ({ data: ids.map(id => ({ id })), error: null });

describe('saveRuangOkbAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filters.length = 0;
    mocks.session.mockResolvedValue(true);
    mocks.saved.mockResolvedValue(savedRows(first));
  });

  it('saves the normalized room for one applicant and refreshes the admin pages', async () => {
    const result = await saveRuangOkbAction([first], '  Ruang   A ');

    expect(result).toEqual({ status: 'success', message: 'Ruang OKB disimpan untuk 1 Pendaftar.', updated: 1 });
    expect(mocks.update).toHaveBeenCalledWith({ ruang_okb: 'Ruang A' });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar/[id]', 'page');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb/name-tag');
  });

  it('saves one room for many applicants at once, counting each applicant once', async () => {
    mocks.saved.mockResolvedValue(savedRows(first, second));

    const result = await saveRuangOkbAction([first, second, first], 'Ruang A');

    expect(result).toEqual({ status: 'success', message: 'Ruang OKB disimpan untuk 2 Pendaftar.', updated: 2 });
    expect(mocks.filters).toContainEqual(['id', [first, second]]);
  });

  it('clears the room when the name is empty', async () => {
    const result = await saveRuangOkbAction([first], '   ');

    expect(result).toEqual({ status: 'success', message: 'Ruang OKB dikosongkan untuk 1 Pendaftar.', updated: 1 });
    expect(mocks.update).toHaveBeenCalledWith({ ruang_okb: null });
  });

  it('only changes applicants who are Terjadwal OKB or Sudah OKB', async () => {
    await saveRuangOkbAction([first], 'Ruang A');

    expect(mocks.filters).toContainEqual(['status', ['Terjadwal OKB', 'Sudah OKB']]);
  });

  it('reports how many changed and refreshes the page when some statuses already changed', async () => {
    mocks.saved.mockResolvedValue(savedRows(first));

    const result = await saveRuangOkbAction([first, second, third], 'Ruang A');

    expect(result).toEqual({ status: 'error', message: 'Ruang OKB disimpan untuk 1 dari 3 Pendaftar. Status 2 Pendaftar lainnya sudah berubah.', updated: 1 });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  });

  it('reports a stale status and refreshes the page when nobody could be changed', async () => {
    mocks.saved.mockResolvedValue(savedRows());

    const result = await saveRuangOkbAction([first], 'Ruang A');

    expect(result).toEqual({ status: 'error', message: 'Status pendaftar sudah berubah. Ruang OKB tidak disimpan.', updated: 0 });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar/[id]', 'page');
  });

  it('rejects a name longer than 30 characters after normalizing, without writing', async () => {
    const result = await saveRuangOkbAction([first], 'x'.repeat(31));

    expect(result).toEqual({ status: 'error', message: 'Nama ruangan maksimal 30 karakter.', updated: 0 });
    expect(mocks.update).not.toHaveBeenCalled();
    expect((await saveRuangOkbAction([first], `  ${'x'.repeat(30)}  `)).status).toBe('success');
  });

  it('rejects an invalid session without writing', async () => {
    mocks.session.mockResolvedValue(false);

    const result = await saveRuangOkbAction([first], 'Ruang A');

    expect(result).toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.', updated: 0 });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects an empty list and malformed applicant ids without writing', async () => {
    expect(await saveRuangOkbAction([], 'Ruang A')).toEqual({ status: 'error', message: 'Pilih Pendaftar terlebih dahulu.', updated: 0 });
    expect(await saveRuangOkbAction([first, 'bukan-uuid'], 'Ruang A')).toEqual({ status: 'error', message: 'Data pendaftar tidak valid.', updated: 0 });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('reports a database failure clearly and does not refresh', async () => {
    mocks.saved.mockResolvedValue({ data: null, error: { message: 'secret' } });

    const result = await saveRuangOkbAction([first], 'Ruang A');

    expect(result).toEqual({ status: 'error', message: 'Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.', updated: 0 });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('reports the same failure when the database client throws', async () => {
    mocks.saved.mockRejectedValue(new Error('secret'));

    const result = await saveRuangOkbAction([first], 'Ruang A');

    expect(result.message).toBe('Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.');
  });
});
