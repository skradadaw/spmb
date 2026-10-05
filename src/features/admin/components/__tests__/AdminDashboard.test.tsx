import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AdminDashboardSummary } from '../../contracts';
import { AdminDashboard } from '../AdminDashboard';

const summary: AdminDashboardSummary = {
  totalRegistrations: 32,
  awaitingVerification: 12,
  completedRegistrations: 28,
  incompleteUploads: 4,
  classDistribution: [
    { label: 'Reguler', count: 16, percentage: 50 },
    { label: 'Bilingual', count: 10, percentage: 31 },
    { label: 'Tahfizh', count: 6, percentage: 19 },
  ],
  typeDistribution: [
    { label: 'Siswa Baru', count: 26, percentage: 81 },
    { label: 'Pindahan', count: 6, percentage: 19 },
  ],
  recentApplicants: [
    { id: '1', namaLengkap: 'Nama Siswa Sangat Panjang Untuk Menguji Responsivitas Tampilan', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', createdAt: '2026-10-06T08:00:00Z' },
    { id: '2', namaLengkap: 'Bima Pratama', pilihanKelas: 'Tahfizh', jenisPendaftaran: 'Pindahan', status: 'Terverifikasi', createdAt: '2026-10-05T08:00:00Z' },
  ],
  updatedAt: '2026-10-06T10:30:00Z',
};

describe('AdminDashboard', () => {
  it('renders navigation, metrics, distributions, and recent applicants', () => {
    render(<AdminDashboard summary={summary} />);

    expect(screen.getAllByText('SD Plus 3 Al-Muhajirin').length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Navigasi admin' })).toBeDefined();
    expect(screen.getByText('Total pendaftar')).toBeDefined();
    expect(screen.getByText('Menunggu verifikasi')).toBeDefined();
    expect(screen.getByText('Pendaftaran selesai')).toBeDefined();
    expect(screen.getByText('Berkas belum lengkap')).toBeDefined();
    expect(screen.getAllByText('32').length).toBeGreaterThan(0);
    expect(screen.getByText('Distribusi pilihan kelas')).toBeDefined();
    expect(screen.getByText('Jenis pendaftaran')).toBeDefined();
    expect(screen.getAllByText('Bima Pratama')).toHaveLength(2);
    expect(screen.getAllByText('Terverifikasi')[0].className).toContain('text-emerald-700');
    expect(screen.getAllByRole('button', { name: 'Keluar dari panel admin' })).toHaveLength(2);
  });

  it('provides semantic progress values', () => {
    render(<AdminDashboard summary={summary} />);
    const regular = screen.getByRole('progressbar', { name: 'Reguler: 16 pendaftar' });
    expect(regular.getAttribute('aria-valuenow')).toBe('50');
  });

  it('protects long names in both desktop and mobile representations', () => {
    render(<AdminDashboard summary={summary} />);
    const longNames = screen.getAllByText(/Nama Siswa Sangat Panjang/);
    expect(longNames).toHaveLength(2);
    expect(longNames.every((element) => /truncate|break-words/.test(element.className))).toBe(true);
  });

  it('keeps malformed dates and long statuses safe on mobile', () => {
    const longStatus = 'Status administratif sangat panjang yang belum dikenali oleh sistem';
    render(<AdminDashboard summary={{
      ...summary,
      recentApplicants: [{ ...summary.recentApplicants[0], status: longStatus, createdAt: null }],
    }} />);

    expect(screen.getAllByText('Tanggal belum tersedia')).toHaveLength(2);
    const statuses = screen.getAllByText(longStatus);
    expect(statuses).toHaveLength(2);
    expect(statuses.every((element) => element.className.includes('break-words'))).toBe(true);
  });

  it('renders one shared empty state without list structures', () => {
    render(<AdminDashboard summary={{ ...summary, recentApplicants: [] }} />);
    expect(screen.getAllByText('Belum ada data pendaftar. Data akan muncul setelah formulir pendaftaran dikirim.')).toHaveLength(1);
    expect(screen.queryByRole('table')).toBeNull();
  });
});
