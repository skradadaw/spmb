import { beforeEach, describe, expect, it, vi } from 'vitest';

type Call = { table: string; op: string; args: unknown[] };

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  calls: [] as Call[],
  /** Hasil per tabel dan operasi, misalnya `ruang_okb.insert`. */
  results: new Map<string, unknown>(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      let op = '';
      const builder: Record<string, unknown> = {};
      for (const name of ['insert', 'update', 'delete', 'select', 'eq']) {
        builder[name] = (...args: unknown[]) => {
          mocks.calls.push({ table, op: name, args });
          if (['insert', 'update', 'delete'].includes(name) || (name === 'select' && !op)) op ||= name;
          return builder;
        };
      }
      builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => {
        const result = mocks.results.get(`${table}.${op}`) ?? { data: [{ id: 'x' }], error: null };
        return (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)).then(resolve, reject);
      };
      return builder;
    },
  }),
}));

import { createRuangOkbAction, deleteRuangOkbAction, renameRuangOkbAction } from '../ruangOkbActions';

const room = '223e4567-e89b-12d3-a456-426614174000';

const callsTo = (table: string, op: string) => mocks.calls.filter(call => call.table === table && call.op === op);
const expectPagesRefreshed = () => {
  expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengaturan/ruang-okb');
  expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb/name-tag');
  expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar/[id]', 'page');
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.calls.length = 0;
  mocks.results.clear();
  mocks.session.mockResolvedValue(true);
});

describe('createRuangOkbAction', () => {
  it('adds the room under its tidied name and refreshes the pages that list rooms', async () => {
    await expect(createRuangOkbAction('  Kelas   1A ')).resolves.toEqual({ status: 'success', message: 'Ruang OKB "Kelas 1A" ditambahkan.' });
    expect(callsTo('ruang_okb', 'insert')[0].args[0]).toEqual({ nama: 'Kelas 1A' });
    expectPagesRefreshed();
  });

  it('rejects an empty or over-long name without writing', async () => {
    await expect(createRuangOkbAction('   ')).resolves.toEqual({ status: 'error', message: 'Nama ruangan wajib diisi.' });
    await expect(createRuangOkbAction('x'.repeat(31))).resolves.toEqual({ status: 'error', message: 'Nama ruangan maksimal 30 karakter.' });
    expect(callsTo('ruang_okb', 'insert')).toHaveLength(0);
  });

  it('rejects a name already in the list, whatever its letter case', async () => {
    mocks.results.set('ruang_okb.insert', { data: null, error: { code: '23505', message: 'secret' } });

    await expect(createRuangOkbAction('kelas 1a')).resolves.toEqual({ status: 'error', message: 'Nama ruangan sudah ada.' });
  });

  it('rejects an invalid session without writing', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(createRuangOkbAction('Kelas 1A')).resolves.toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.calls).toHaveLength(0);
  });

  it('reports a database failure without its details', async () => {
    mocks.results.set('ruang_okb.insert', new Error('secret'));

    await expect(createRuangOkbAction('Kelas 1A')).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.' });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe('renameRuangOkbAction', () => {
  it('renames the room, which every Pendaftar in it then shows, and refreshes the pages', async () => {
    await expect(renameRuangOkbAction(room, ' Ruang  1A ')).resolves.toEqual({ status: 'success', message: 'Nama ruangan diganti menjadi "Ruang 1A".' });
    expect(callsTo('ruang_okb', 'update')[0].args[0]).toEqual({ nama: 'Ruang 1A' });
    expect(callsTo('ruang_okb', 'eq')[0].args).toEqual(['id', room]);
    expect(callsTo('pendaftar', 'update')).toHaveLength(0);
    expectPagesRefreshed();
  });

  it('applies the same name rules as adding', async () => {
    await expect(renameRuangOkbAction(room, '')).resolves.toEqual({ status: 'error', message: 'Nama ruangan wajib diisi.' });
    await expect(renameRuangOkbAction(room, 'x'.repeat(31))).resolves.toEqual({ status: 'error', message: 'Nama ruangan maksimal 30 karakter.' });
    mocks.results.set('ruang_okb.update', { data: null, error: { code: '23505', message: 'secret' } });
    await expect(renameRuangOkbAction(room, 'Kelas 2')).resolves.toEqual({ status: 'error', message: 'Nama ruangan sudah ada.' });
  });

  it('reports a room deleted meanwhile, or a malformed id, as not found', async () => {
    mocks.results.set('ruang_okb.update', { data: [], error: null });
    await expect(renameRuangOkbAction(room, 'Ruang 1A')).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak ditemukan. Muat ulang halaman.' });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengaturan/ruang-okb');

    await expect(renameRuangOkbAction('bukan-uuid', 'Ruang 1A')).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak ditemukan. Muat ulang halaman.' });
  });

  it('rejects an invalid session without writing', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(renameRuangOkbAction(room, 'Ruang 1A')).resolves.toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.calls).toHaveLength(0);
  });
});

describe('deleteRuangOkbAction', () => {
  it('deletes a room nobody uses and refreshes the pages', async () => {
    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'success', message: 'Ruang OKB dihapus.' });
    expect(callsTo('ruang_okb', 'delete')).toHaveLength(1);
    expect(callsTo('ruang_okb', 'eq')[0].args).toEqual(['id', room]);
    expectPagesRefreshed();
  });

  it('refuses a room still in use, saying how many Pendaftar use it', async () => {
    mocks.results.set('ruang_okb.delete', { data: null, error: { code: '23503', message: 'secret' } });
    mocks.results.set('pendaftar.select', { data: null, count: 5, error: null });

    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'error', message: 'Masih dipakai 5 Pendaftar. Pindahkan mereka ke ruangan lain terlebih dahulu.' });
    expect(callsTo('pendaftar', 'eq')[0].args).toEqual(['ruang_okb_id', room]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengaturan/ruang-okb');
  });

  it('still refuses a room in use when the count cannot be read', async () => {
    mocks.results.set('ruang_okb.delete', { data: null, error: { code: '23503', message: 'secret' } });
    mocks.results.set('pendaftar.select', { data: null, count: null, error: { message: 'secret' } });

    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'error', message: 'Ruangan masih dipakai Pendaftar. Pindahkan mereka ke ruangan lain terlebih dahulu.' });
  });

  it('reports a room already deleted, or a malformed id, as not found', async () => {
    mocks.results.set('ruang_okb.delete', { data: [], error: null });
    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak ditemukan. Muat ulang halaman.' });

    await expect(deleteRuangOkbAction('bukan-uuid')).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak ditemukan. Muat ulang halaman.' });
  });

  it('rejects an invalid session without writing', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.calls).toHaveLength(0);
  });

  it('reports a database failure without its details', async () => {
    mocks.results.set('ruang_okb.delete', { data: null, error: { code: 'XX000', message: 'secret' } });

    await expect(deleteRuangOkbAction(room)).resolves.toEqual({ status: 'error', message: 'Ruang OKB tidak dapat dihapus. Periksa koneksi lalu coba lagi.' });
  });
});
