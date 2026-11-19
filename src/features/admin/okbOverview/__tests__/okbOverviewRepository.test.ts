import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));

import { fetchOkbOverview } from '../server/okbOverviewRepository';

type Result = { data: unknown; error: unknown };

function clientReturning(result: Result) {
  const calls: { table?: string; columns?: string; filters: Array<[string, string, unknown]>; range?: [number, number] } = { filters: [] };
  const query = {
    in: (column: string, value: unknown) => { calls.filters.push(['in', column, value]); return query; },
    range: (from: number, to: number) => { calls.range = [from, to]; return Promise.resolve(result); },
  };
  const client = {
    from: (table: string) => {
      calls.table = table;
      return { select: (columns: string) => { calls.columns = columns; return query; } };
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}

const pendaftar = (overrides: Record<string, unknown>) => ({
  status: 'Terjadwal OKB', jadwal_okb_tanggal: null, jadwal_okb_gelombang: null, ruang_okb: null,
  pilihan_kelas: 'Reguler', jenis_kelamin: 'Perempuan', jenis_pendaftaran: 'Siswa Baru', diumumkan_pada: null, nomor_va: null,
  ...overrides,
});

describe('fetchOkbOverview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 17:30 UTC is already the 8th in Asia/Jakarta.
    vi.setSystemTime(new Date('2026-11-07T17:30:00Z'));
  });
  afterEach(() => { vi.useRealTimers(); });

  it('reads Pendaftar from Terverifikasi to the Keputusan Penerimaan in one query, without personal data', async () => {
    const { client, calls } = clientReturning({ data: [], error: null });

    const overview = await fetchOkbOverview(client);

    expect(calls.table).toBe('pendaftar');
    expect(calls.filters).toEqual([['in', 'status', ['Terverifikasi', 'Terjadwal OKB', 'Sudah OKB', 'Diterima', 'Ditolak']]]);
    expect(calls.columns).not.toMatch(/nama|nik|nisn|telepon|alamat/);
    expect(calls.range).toEqual([0, 4999]);
    expect(overview.today).toBe('2026-11-08');
  });

  it('builds the dates from today in Asia/Jakarta, with Ruang OKB names tidied and invalid Gelombang skipped', async () => {
    const { client } = clientReturning({
      data: [
        pendaftar({ jadwal_okb_tanggal: '2026-11-08', jadwal_okb_gelombang: 2, ruang_okb: ' Ruang 1 ' }),
        pendaftar({ jadwal_okb_tanggal: '2026-11-08', jadwal_okb_gelombang: 7 }),
        pendaftar({ jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 1 }),
      ],
      error: null,
    });

    const { days, pipeline } = await fetchOkbOverview(client);

    expect(days).toHaveLength(1);
    expect(days[0]).toMatchObject({ tanggal: '2026-11-08', hariLagi: 0, pendaftar: 1, rooms: [{ nama: 'Ruang 1', total: 1 }] });
    expect(pipeline).toMatchObject({ terjadwal: 3, mendatang: 2, tidakHadir: 1 });
  });

  it('summarizes Hasil OKB per Gelombang exactly like the Pengumuman tab', async () => {
    const { client } = clientReturning({
      data: [
        pendaftar({ status: 'Diterima', jadwal_okb_gelombang: 1, diumumkan_pada: '2026-11-01T00:00:00Z', nomor_va: '1234567890123456' }),
        pendaftar({ status: 'Diterima', jadwal_okb_gelombang: 1 }),
        pendaftar({ status: 'Ditolak', jadwal_okb_gelombang: 2 }),
        pendaftar({ status: 'Sudah OKB', jadwal_okb_gelombang: 2, jadwal_okb_tanggal: '2026-11-01' }),
      ],
      error: null,
    });

    const { results, pipeline } = await fetchOkbOverview(client);

    expect(results).toEqual([
      { wave: 1, diterima: { announced: 1, pending: 1 }, ditolak: { announced: 0, pending: 0 }, undecided: 0, missingVa: 1 },
      { wave: 2, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 1 }, undecided: 1, missingVa: 0 },
      { wave: 3, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 0 }, undecided: 0, missingVa: 0 },
    ]);
    expect(pipeline).toMatchObject({ diterima: 2, ditolak: 1, sudahOkb: 1, belumDiumumkan: 2 });
  });

  it('fails when the database fails, so the page does not show an empty overview', async () => {
    const { client } = clientReturning({ data: null, error: new Error('db down') });

    await expect(fetchOkbOverview(client)).rejects.toThrow('Ringkasan OKB tidak dapat dimuat.');
  });
});
