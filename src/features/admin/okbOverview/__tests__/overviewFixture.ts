import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import { OKB_WAVES, type OkbWave } from '@/features/admin/okbWave';
import { buildOkbOverview, type OkbOverviewRow, type OkbOverviewView } from '../okbOverview';

/** Jumat; tanggal lain di tes: Rabu, 25 November 2026. */
export const TODAY = '2026-11-20';
export const LATER = '2026-11-25';

export function pendaftar(status: OkbOverviewRow['status'], extra: Partial<OkbOverviewRow> = {}): OkbOverviewRow {
  return {
    status, tanggal: null, gelombang: null, ruangOkb: null,
    pilihanKelas: 'Reguler', jenisKelamin: 'Laki-laki', jenisPendaftaran: 'Siswa Baru', diumumkan: false,
    ...extra,
  };
}

export const on = (tanggal: string, gelombang: OkbWave, extra: Partial<OkbOverviewRow> = {}) => ({ tanggal, gelombang, ...extra });

export const repeat = (count: number, make: (index: number) => OkbOverviewRow) => Array.from({ length: count }, (_, index) => make(index));

/**
 * Hari ini 30 Pendaftar: Gelombang 1 12 hadir dari 20, Gelombang 2 0 hadir dari 10 (dua belum punya Ruang OKB).
 * Rabu 25 November: 6 Pendaftar Gelombang 3 tanpa Ruang OKB.
 */
export function sampleRows(): OkbOverviewRow[] {
  return [
    ...repeat(12, index => pendaftar('Sudah OKB', on(TODAY, 1, { ruangOkb: index < 6 ? 'Ruang 2' : 'Ruang 10' }))),
    ...repeat(8, () => pendaftar('Terjadwal OKB', on(TODAY, 1, { ruangOkb: 'Ruang 2' }))),
    ...repeat(10, index => pendaftar('Terjadwal OKB', on(TODAY, 2, { ruangOkb: index < 8 ? 'Ruang 10' : null }))),
    ...repeat(6, () => pendaftar('Terjadwal OKB', on(LATER, 3))),
  ];
}

export const noResults: WaveSummary[] = OKB_WAVES.map(wave => ({
  wave, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 0 }, undecided: 0, missingVa: 0,
}));

export function overviewFrom(rows: OkbOverviewRow[] = sampleRows(), results: WaveSummary[] = noResults): OkbOverviewView {
  return { ...buildOkbOverview(rows, TODAY), results };
}
