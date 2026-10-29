import { describe, expect, it } from 'vitest';
import { summarizeWaves } from '../waveSummary';

const row = (status: string, wave: number | null, announced = false, nomorVa: string | null = null) => ({
  status, jadwal_okb_gelombang: wave, diumumkan_pada: announced ? '2027-02-09T01:00:00Z' : null, nomor_va: nomorVa,
});

describe('Gelombang OKB summary', () => {
  it('counts decided results per Gelombang, split by announced, plus the undecided ones', () => {
    const [first, second, third] = summarizeWaves([
      row('Diterima', 1, true, '7456012627300120'),
      row('Diterima', 1, false, '7456012627300121'),
      row('Diterima', 1),
      row('Ditolak', 1),
      row('Ditolak', 1, true),
      row('Sudah OKB', 1),
      row('Diterima', 2, false, '7456012627300122'),
      row('Sudah OKB', 2),
    ]);
    expect(first).toEqual({ wave: 1, diterima: { announced: 1, pending: 2 }, ditolak: { announced: 1, pending: 1 }, undecided: 1, missingVa: 1 });
    expect(second).toEqual({ wave: 2, diterima: { announced: 0, pending: 1 }, ditolak: { announced: 0, pending: 0 }, undecided: 1, missingVa: 0 });
    expect(third).toEqual({ wave: 3, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 0 }, undecided: 0, missingVa: 0 });
  });

  it('ignores rows without a Gelombang OKB', () => {
    expect(summarizeWaves([row('Diterima', null)]).every(summary => summary.diterima.pending === 0)).toBe(true);
  });
});
