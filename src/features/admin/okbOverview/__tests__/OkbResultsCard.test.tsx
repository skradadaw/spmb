import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import { OkbResultsCard } from '../components/OkbResultsCard';
import { noResults } from './overviewFixture';

const results: WaveSummary[] = [
  { wave: 1, diterima: { announced: 18, pending: 0 }, ditolak: { announced: 3, pending: 0 }, undecided: 4, missingVa: 0 },
  { wave: 2, diterima: { announced: 10, pending: 2 }, ditolak: { announced: 0, pending: 1 }, undecided: 0, missingVa: 2 },
  noResults[2],
];

describe('OkbResultsCard', () => {
  it('shows how many Keputusan Penerimaan each Gelombang has announced', () => {
    render(<OkbResultsCard results={results} />);

    const progress = within(screen.getByRole('list', { name: 'Pengumuman Hasil OKB per Gelombang' }));
    expect(progress.getByRole('progressbar', { name: 'Pengumuman Gelombang 1' }).getAttribute('aria-valuenow')).toBe('100');
    expect(progress.getByText(/dari 21 diumumkan/).textContent).toBe('21 dari 21 diumumkan');
    expect(progress.getByText(/dari 13 diumumkan/).textContent).toBe('10 dari 13 diumumkan');
    expect(progress.getByText('Belum ada keputusan')).toBeDefined();
  });

  it('offers the numbers per Gelombang as a table', () => {
    render(<OkbResultsCard results={results} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tabel' }));

    const rows = within(screen.getByRole('table', { name: 'Hasil OKB per Gelombang OKB' })).getAllByRole('row').slice(1);
    expect(rows.map(row => [...row.querySelectorAll('th, td')].map(cell => cell.textContent))).toEqual([
      ['Gelombang 1', '18', '3', '4', '21 dari 21'],
      ['Gelombang 2', '12', '1', '0', '10 dari 13'],
      ['Gelombang 3', '0', '0', '0', '0 dari 0'],
    ]);
  });

  it('says what is ready to announce and which Diterima still lack a Nomor VA, with a way to Pengumuman', () => {
    render(<OkbResultsCard results={results} />);

    expect(screen.getByText(/hasil siap diumumkan/).textContent).toBe('3 hasil siap diumumkan');
    expect(screen.getByText(/Diterima belum punya Nomor VA/).textContent).toBe('2 Diterima belum punya Nomor VA');
    expect(screen.getByRole('link', { name: /Buka Pengumuman/ }).getAttribute('href')).toBe('/admin/okb/pengumuman');
  });

  it('explains when nobody has taken OKB yet, without a chart to switch', () => {
    render(<OkbResultsCard results={noResults} />);

    expect(screen.getByText('Belum ada Pendaftar yang mengikuti OKB.')).toBeDefined();
    expect(screen.getByText('Tidak ada hasil baru untuk diumumkan')).toBeDefined();
    expect(screen.queryByRole('tab')).toBeNull();
  });
});
