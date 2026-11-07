import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));

import { fetchNameTagRows } from '../server/nameTagRepository';

function clientReturning(result: { data: unknown; error: unknown }) {
  const filters: Array<[string, string, unknown]> = [];
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => { filters.push(['eq', column, value]); return builder; },
    gte: (column: string, value: unknown) => { filters.push(['gte', column, value]); return builder; },
    range: () => Promise.resolve(result),
  };
  return { client: { from: () => builder } as unknown as SupabaseClient, filters };
}

describe('fetchNameTagRows', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 17:30 UTC is already the 8th in Asia/Jakarta.
    vi.setSystemTime(new Date('2026-11-07T17:30:00Z'));
  });
  afterEach(() => { vi.useRealTimers(); });

  it('reads only Pendaftar Terjadwal OKB scheduled today or later in Asia/Jakarta', async () => {
    const { client, filters } = clientReturning({ data: [], error: null });

    await fetchNameTagRows(client);

    expect(filters).toContainEqual(['eq', 'status', 'Terjadwal OKB']);
    expect(filters).toContainEqual(['gte', 'jadwal_okb_tanggal', '2026-11-08']);
  });

  it('maps the columns and treats a blank room as empty', async () => {
    const { client } = clientReturning({
      data: [
        { id: 'a', nama_lengkap: 'Aisyah', ruang_okb: 'Ruang A', jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: 2 },
        { id: 'b', nama_lengkap: 'Bilal', ruang_okb: '  ', jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: 1 },
      ],
      error: null,
    });

    expect(await fetchNameTagRows(client)).toEqual([
      { id: 'a', namaLengkap: 'Aisyah', ruangOkb: 'Ruang A', tanggal: '2026-11-20', gelombang: 2 },
      { id: 'b', namaLengkap: 'Bilal', ruangOkb: null, tanggal: '2026-11-20', gelombang: 1 },
    ]);
  });

  it('skips a row without a valid Gelombang rather than inventing a group', async () => {
    const { client } = clientReturning({
      data: [{ id: 'a', nama_lengkap: 'Aisyah', ruang_okb: null, jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: null }],
      error: null,
    });

    expect(await fetchNameTagRows(client)).toEqual([]);
  });

  it('fails when the query fails, so the page does not show an empty schedule', async () => {
    const { client } = clientReturning({ data: null, error: new Error('db down') });

    await expect(fetchNameTagRows(client)).rejects.toThrow('Data Name Tag tidak dapat dimuat.');
  });
});
