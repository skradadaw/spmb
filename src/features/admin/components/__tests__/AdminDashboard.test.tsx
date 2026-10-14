import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AdminDashboardSummary } from '../../contracts';
import { AdminDashboard } from '../AdminDashboard';

const summary: AdminDashboardSummary = {
  today: '2026-10-18',
  totalRegistrations: 60,
  tasks: { uploading: 4, awaiting: 12, verified: 5, absent: 2, decision: 0 },
  attention: { any: 5, nisn: 3 },
  capacity: [{ label: 'Reguler', kuota: 28, terpakai: 20 }, { label: 'Bilingual', kuota: 56, terpakai: 48 }, { label: 'Tahfizh', kuota: 28, terpakai: 28 }],
  transfers: 7,
  results: { accepted: 40, rejected: 6, withdrawn: 3 },
  acceptedByClass: [{ label: 'Reguler', count: 12 }, { label: 'Bilingual', count: 20 }, { label: 'Tahfizh', count: 8 }],
  schedule: [
    { date: '2026-10-18', total: 18, waves: [{ label: 'Gelombang 1', count: 10 }, { label: 'Gelombang 2', count: 8 }] },
    { date: '2026-10-25', total: 6, waves: [{ label: 'Gelombang 3', count: 6 }] },
  ],
};

const tile = (label: string) => screen.getByText(label).closest('a')!;

describe('AdminDashboard', () => {
  it('links every admin task to Data Pendaftar filtered to exactly that work', () => {
    render(<AdminDashboard summary={summary} />);
    expect(tile('Perlu diverifikasi').getAttribute('href')).toBe('/admin/pendaftar?status=Menunggu%20Verifikasi');
    expect(tile('Perlu dijadwalkan OKB').getAttribute('href')).toBe('/admin/pendaftar?status=Terverifikasi');
    expect(tile('Tidak hadir OKB').getAttribute('href')).toBe('/admin/pendaftar?okb=terlewat');
    expect(tile('Menunggu keputusan').getAttribute('href')).toBe('/admin/pendaftar?status=Sudah%20OKB');
    expect(tile('Belum selesai unggah').getAttribute('href')).toBe('/admin/pendaftar?status=Menunggu%20Unggahan');
    expect(tile('Perlu perhatian').getAttribute('href')).toBe('/admin/pendaftar?perhatian=semua');
    expect(screen.getByRole('link', { name: /3\s*NISN tidak sesuai/ }).getAttribute('href')).toBe('/admin/pendaftar?perhatian=nisn');
    expect(tile('Perlu diverifikasi').textContent).toContain('12');
  });

  it('dims a finished task instead of hiding it', () => {
    render(<AdminDashboard summary={summary} />);
    expect(tile('Menunggu keputusan').textContent).toContain('Tidak ada yang perlu dikerjakan');
    expect(tile('Perlu diverifikasi').textContent).not.toContain('Tidak ada yang perlu dikerjakan');
  });

  it('shows Kuota usage per class with full classes marked, and Pindahan outside the quota', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.getByText('96')).toBeDefined();
    expect(screen.getByRole('progressbar', { name: 'Bilingual: 48 dari 56 kursi' }).getAttribute('aria-valuenow')).toBe('86');
    expect(screen.getByText('Penuh')).toBeDefined();
    expect(screen.getAllByText('sisa 8')).toHaveLength(2);
    expect(screen.getByText(/Pindahan, di luar kuota/).textContent).toContain('7');
  });

  it('lists upcoming OKB days, marks today and offers the attendance scan', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.getByText('Hari ini')).toBeDefined();
    expect(screen.getByText('Gelombang 1: 10 · Gelombang 2: 8')).toBeDefined();
    expect(screen.getByRole('link', { name: /Scan Kehadiran/ }).getAttribute('href')).toBe('/admin/scan');
  });

  it('hides the scan shortcut and shows an empty state without upcoming OKB', () => {
    render(<AdminDashboard summary={{ ...summary, schedule: [] }} />);
    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.queryByRole('link', { name: /Scan Kehadiran/ })).toBeNull();
  });

  it('reports totals and Siswa Baru accepted per class, without the old distribution and recent lists', () => {
    render(<AdminDashboard summary={summary} />);
    expect(tile('Total pendaftar').textContent).toContain('60');
    expect(tile('Diterima').getAttribute('href')).toBe('/admin/pendaftar?status=Diterima');
    expect(screen.getByText(/Siswa Baru diterima per kelas/).textContent).toContain('Bilingual 20');
    expect(screen.queryByText('Pendaftar terbaru')).toBeNull();
    expect(screen.queryByText('Distribusi pilihan kelas')).toBeNull();
    expect(screen.queryByText(/Diperbarui/)).toBeNull();
  });
});
