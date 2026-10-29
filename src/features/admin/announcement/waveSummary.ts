import { OKB_WAVES, parseOkbWave, type OkbWave } from '@/features/admin/okbWave';

type Count = { announced: number; pending: number };

/** Ringkasan Pengumuman Hasil OKB satu Gelombang OKB. */
export type WaveSummary = {
  wave: OkbWave;
  diterima: Count;
  ditolak: Count;
  /** Sudah OKB tetapi belum ada Keputusan Penerimaan; dilewati saat mengumumkan. */
  undecided: number;
  /** Diterima yang belum diumumkan dan belum punya Nomor VA. */
  missingVa: number;
};

export type WaveSummaryRow = { status: unknown; jadwal_okb_gelombang: unknown; diumumkan_pada: unknown; nomor_va: unknown };

export function summarizeWaves(rows: readonly WaveSummaryRow[]): WaveSummary[] {
  const summaries = new Map<OkbWave, WaveSummary>(OKB_WAVES.map(wave => [wave, {
    wave, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 0 }, undecided: 0, missingVa: 0,
  }]));
  for (const row of rows) {
    const summary = summaries.get(parseOkbWave(row.jadwal_okb_gelombang) as OkbWave);
    if (!summary) continue;
    const announced = Boolean(row.diumumkan_pada);
    if (row.status === 'Sudah OKB') summary.undecided += 1;
    else if (row.status === 'Diterima') {
      summary.diterima[announced ? 'announced' : 'pending'] += 1;
      if (!announced && !row.nomor_va) summary.missingVa += 1;
    } else if (row.status === 'Ditolak') summary.ditolak[announced ? 'announced' : 'pending'] += 1;
  }
  return [...summaries.values()];
}
