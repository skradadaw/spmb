import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));

import { fetchRuangOkbList, fetchRuangOkbUsage } from '../server/ruangOkbRepository';

function clientReturning(result: { data: unknown; error: unknown }) {
  const tables: string[] = [];
  const columns: string[] = [];
  const builder = { select: (selected: string) => { columns.push(selected); return Promise.resolve(result); } };
  return { client: { from: (table: string) => { tables.push(table); return builder; } } as unknown as SupabaseClient, tables, columns };
}

describe('fetchRuangOkbList', () => {
  it('reads the room list in natural name order', async () => {
    const { client, tables } = clientReturning({
      data: [{ id: 'b', nama: 'Kelas 10' }, { id: 'a', nama: 'Kelas 2' }, { id: 'c', nama: 'Aula' }],
      error: null,
    });

    await expect(fetchRuangOkbList(client)).resolves.toEqual([
      { id: 'c', nama: 'Aula' },
      { id: 'a', nama: 'Kelas 2' },
      { id: 'b', nama: 'Kelas 10' },
    ]);
    expect(tables).toEqual(['ruang_okb']);
  });

  it('throws when the list cannot be read', async () => {
    const { client } = clientReturning({ data: null, error: { message: 'secret' } });

    await expect(fetchRuangOkbList(client)).rejects.toThrow('Daftar Ruang OKB tidak dapat dimuat.');
  });
});

describe('fetchRuangOkbUsage', () => {
  it('reads each room with how many Pendaftar use it, in natural name order', async () => {
    const { client, tables, columns } = clientReturning({
      data: [
        { id: 'b', nama: 'Kelas 10', pendaftar: [{ count: 0 }] },
        { id: 'a', nama: 'Kelas 2', pendaftar: [{ count: 12 }] },
      ],
      error: null,
    });

    await expect(fetchRuangOkbUsage(client)).resolves.toEqual([
      { id: 'a', nama: 'Kelas 2', dipakai: 12 },
      { id: 'b', nama: 'Kelas 10', dipakai: 0 },
    ]);
    expect(tables).toEqual(['ruang_okb']);
    expect(columns).toEqual(['id,nama,pendaftar(count)']);
  });

  it('throws when the list cannot be read', async () => {
    const { client } = clientReturning({ data: null, error: { message: 'secret' } });

    await expect(fetchRuangOkbUsage(client)).rejects.toThrow('Daftar Ruang OKB tidak dapat dimuat.');
  });
});
