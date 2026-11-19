import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OkbPipeline } from '../components/OkbPipeline';
import type { OkbPipeline as Pipeline } from '../okbOverview';

const pipeline: Pipeline = { perluDijadwalkan: 5, terjadwal: 40, mendatang: 36, tidakHadir: 4, sudahOkb: 12, diterima: 38, ditolak: 6, belumDiumumkan: 3 };
const stage = (label: RegExp) => screen.getByRole('link', { name: label });

describe('OkbPipeline', () => {
  it('opens Data Pendaftar filtered to each stage, with the same count', () => {
    render(<OkbPipeline pipeline={pipeline} />);

    expect(stage(/Perlu dijadwalkan/).getAttribute('href')).toBe('/admin/pendaftar?status=Terverifikasi');
    expect(stage(/Perlu dijadwalkan/).textContent).toContain('5');
    expect(stage(/Terjadwal OKB/).getAttribute('href')).toBe('/admin/pendaftar?status=Terjadwal%20OKB');
    expect(stage(/Terjadwal OKB/).textContent).toContain('40');
    expect(stage(/Sudah OKB/).getAttribute('href')).toBe('/admin/pendaftar?status=Sudah%20OKB');
    expect(stage(/Sudah OKB/).textContent).toContain('Menunggu Keputusan Penerimaan');
  });

  it('opens Pengumuman for Hasil OKB, since Data Pendaftar cannot show Diterima and Ditolak together', () => {
    render(<OkbPipeline pipeline={pipeline} />);

    const results = stage(/Hasil OKB/);
    expect(results.getAttribute('href')).toBe('/admin/okb/pengumuman');
    expect(results.textContent).toContain('44');
    expect(results.textContent).toContain('38 Diterima · 6 Ditolak');
  });

  it('splits Terjadwal OKB into upcoming and past dates, and links to Tidak Hadir OKB', () => {
    render(<OkbPipeline pipeline={pipeline} />);

    expect(stage(/Terjadwal OKB/).textContent).toContain('36 mendatang · 4 sudah lewat');
    expect(screen.getByRole('link', { name: /4 Pendaftar Tidak Hadir OKB/ }).getAttribute('href')).toBe('/admin/pendaftar?okb=terlewat');
  });

  it('hides the Tidak Hadir OKB link when nobody missed their date', () => {
    render(<OkbPipeline pipeline={{ ...pipeline, terjadwal: 36, tidakHadir: 0 }} />);

    expect(stage(/Terjadwal OKB/).textContent).toContain('36 pada tanggal mendatang');
    expect(screen.queryByRole('link', { name: /Tidak Hadir OKB/ })).toBeNull();
  });
});
