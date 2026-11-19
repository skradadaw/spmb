import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('server-only', () => ({}));

import { fetchNameTagRows, fetchRuangOkbExportRows } from '../server/nameTagRepository';

function clientReturning(result: { data: unknown; error: unknown }) {
  const filters: Array<[string, string, unknown]> = [];
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => { filters.push(['eq', column, value]); return builder; },
    gte: (column: string, value: unknown) => { filters.push(['gte', column, value]); return builder; },
    not: (column: string, operator: string, value: unknown) => { filters.push(['not', column, [operator, value]]); return builder; },
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

  it('maps the columns, including Pilihan Kelas, and treats a blank room as empty', async () => {
    const { client } = clientReturning({
      data: [
        { id: 'a', nama_lengkap: 'Aisyah', ruang_okb: 'Ruang A', pilihan_kelas: 'Tahfizh', jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: 2 },
        { id: 'b', nama_lengkap: 'Bilal', ruang_okb: '  ', pilihan_kelas: null, jadwal_okb_tanggal: '2026-11-20', jadwal_okb_gelombang: 1 },
      ],
      error: null,
    });

    expect(await fetchNameTagRows(client)).toEqual([
      { id: 'a', namaLengkap: 'Aisyah', ruangOkb: 'Ruang A', pilihanKelas: 'Tahfizh', tanggal: '2026-11-20', gelombang: 2 },
      { id: 'b', namaLengkap: 'Bilal', ruangOkb: null, pilihanKelas: null, tanggal: '2026-11-20', gelombang: 1 },
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

describe('fetchRuangOkbExportRows', () => {
  const selection = { tanggal: '2026-11-21', gelombang: 2 as const };

  it('reads only Pendaftar Terjadwal OKB of the chosen group who already have a Ruang OKB', async () => {
    const { client, filters } = clientReturning({ data: [], error: null });

    await fetchRuangOkbExportRows(client, selection);

    expect(filters).toEqual([
      ['eq', 'status', 'Terjadwal OKB'],
      ['eq', 'jadwal_okb_tanggal', '2026-11-21'],
      ['eq', 'jadwal_okb_gelombang', 2],
      ['not', 'ruang_okb_id', ['is', null]],
    ]);
  });

  it('maps the columns and drops a row whose room name is blank', async () => {
    const { client } = clientReturning({
      data: [
        { nomor_pendaftaran: 'OB-2027-001', nama_lengkap: 'Aisyah', jenis_kelamin: 'Perempuan', pilihan_kelas: 'Tahfizh', jenis_pendaftaran: 'Siswa Baru', ruang_okb: ' Ruang A ' },
        { nomor_pendaftaran: 'OB-2027-002', nama_lengkap: 'Bilal', jenis_kelamin: 'Laki-laki', pilihan_kelas: 'Reguler', jenis_pendaftaran: 'Siswa Baru', ruang_okb: '  ' },
      ],
      error: null,
    });

    expect(await fetchRuangOkbExportRows(client, selection)).toEqual([
      { nomorPendaftaran: 'OB-2027-001', namaLengkap: 'Aisyah', jenisKelamin: 'Perempuan', pilihanKelas: 'Tahfizh', jenisPendaftaran: 'Siswa Baru', ruangOkb: 'Ruang A' },
    ]);
  });

  it('fails when the query fails, so the export never comes out empty by mistake', async () => {
    const { client } = clientReturning({ data: null, error: new Error('db down') });

    await expect(fetchRuangOkbExportRows(client, selection)).rejects.toThrow('Data Ruang OKB tidak dapat dimuat.');
  });
});
