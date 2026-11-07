import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));

import { fetchOkbSchedule } from '../server/okbScheduleRepository';

type Result = { data?: unknown; error: unknown; count?: number | null };

/** The first query reads the Pendaftar rows; the second counts Tidak Hadir OKB. */
function clientReturning(rows: Result, missed: Result = { error: null, count: 0 }) {
  const rowFilters: Array<[string, string, unknown]> = [];
  const missedFilters: Array<[string, string, unknown]> = [];
  const rowsQuery = {
    in: (column: string, value: unknown) => { rowFilters.push(['in', column, value]); return rowsQuery; },
    gte: (column: string, value: unknown) => { rowFilters.push(['gte', column, value]); return rowsQuery; },
    range: () => Promise.resolve(rows),
  };
  const missedQuery = {
    eq: (column: string, value: unknown) => { missedFilters.push(['eq', column, value]); return missedQuery; },
    lt: (column: string, value: unknown) => { missedFilters.push(['lt', column, value]); return Promise.resolve(missed); },
  };
  const table = { select: (_columns: string, options?: { head?: boolean }) => options?.head ? missedQuery : rowsQuery };
  return { client: { from: () => table } as unknown as SupabaseClient, rowFilters, missedFilters };
}

describe('fetchOkbSchedule', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 17:30 UTC is already the 8th in Asia/Jakarta.
    vi.setSystemTime(new Date('2026-11-07T17:30:00Z'));
  });
  afterEach(() => { vi.useRealTimers(); });

  it('reads only Terjadwal OKB and Sudah OKB from today in Asia/Jakarta', async () => {
    const { client, rowFilters } = clientReturning({ data: [], error: null });

    const result = await fetchOkbSchedule(client);

    expect(rowFilters).toContainEqual(['in', 'status', ['Terjadwal OKB', 'Sudah OKB']]);
    expect(rowFilters).toContainEqual(['gte', 'jadwal_okb_tanggal', '2026-11-08']);
    expect(result.today).toBe('2026-11-08');
  });

  it('counts Tidak Hadir OKB as Terjadwal OKB before today', async () => {
    const { client, missedFilters } = clientReturning({ data: [], error: null }, { error: null, count: 4 });

    const { missed } = await fetchOkbSchedule(client);

    expect(missed).toBe(4);
    expect(missedFilters).toContainEqual(['eq', 'status', 'Terjadwal OKB']);
    expect(missedFilters).toContainEqual(['lt', 'jadwal_okb_tanggal', '2026-11-08']);
  });

  it('builds the days and skips a row without a valid Gelombang', async () => {
    const { client } = clientReturning({
      data: [
        { status: 'Sudah OKB', jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: 2 },
        { status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: null },
      ],
      error: null,
    });

    const { days } = await fetchOkbSchedule(client);

    expect(days).toEqual([{ tanggal: '2026-11-20', total: 1, hadir: 1, gelombang: [{ gelombang: 2, total: 1, hadir: 1, terjadwal: 0 }] }]);
  });

  it('fails when reading the rows fails, so the page does not show an empty schedule', async () => {
    const { client } = clientReturning({ data: null, error: new Error('db down') });

    await expect(fetchOkbSchedule(client)).rejects.toThrow('Jadwal OKB tidak dapat dimuat.');
  });

  it('fails when counting Tidak Hadir OKB fails', async () => {
    const { client } = clientReturning({ data: [], error: null }, { error: new Error('db down'), count: null });

    await expect(fetchOkbSchedule(client)).rejects.toThrow('Jadwal OKB tidak dapat dimuat.');
  });
});
