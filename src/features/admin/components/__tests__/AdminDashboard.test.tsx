import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AdminDashboardSummary } from '../../contracts';
import { AdminDashboard } from '../AdminDashboard';

const summary: AdminDashboardSummary = {
  today: '2026-10-18',
  totalRegistrations: 60,
  tasks: { uploading: 4, awaiting: 12, verified: 5, absent: 2, decision: 0, unannounced: 3 },
  attention: { any: 5, nisn: 3 },
  capacity: [{ label: 'Reguler', kuota: 28, terpakai: 20 }, { label: 'Bilingual', kuota: 56, terpakai: 48 }, { label: 'Tahfizh', kuota: 28, terpakai: 28 }],
  seatsByGender: { male: 50, female: 46, unknown: 0 },
  transfers: 7,
  results: { accepted: 40, rejected: 6, withdrawn: 3 },
  acceptedByClass: [{ label: 'Reguler', count: 12 }, { label: 'Bilingual', count: 18 }, { label: 'Tahfizh', count: 8 }],
  schedule: [
    { date: '2026-10-18', total: 18, waves: [{ label: 'Gelombang 1', count: 10 }, { label: 'Gelombang 2', count: 8 }], rooms: [{ label: 'Ruang 2', count: 8 }, { label: 'Ruang 10', count: 6 }] },
    { date: '2026-10-25', total: 6, waves: [{ label: 'Gelombang 3', count: 6 }], rooms: [{ label: 'Lab Komputer', count: 6 }] },
  ],
};

const noTasks: AdminDashboardSummary['tasks'] = { uploading: 0, awaiting: 0, verified: 0, absent: 0, decision: 0, unannounced: 0 };

const tile = (label: string) => screen.getByText(label).closest('a')!;
const figures = () => screen.getByRole('region', { name: 'Angka utama' });
const capacityCard = () => screen.getByRole('heading', { name: 'Kuota Siswa Baru' }).closest('.rounded-2xl') as HTMLElement;

describe('AdminDashboard', () => {
  it('shows the three headline figures, linking those that have a matching list', () => {
    render(<AdminDashboard summary={summary} />);
    const region = within(figures());
    const total = region.getByText('Total pendaftar').closest('a')!;
    expect(total.getAttribute('href')).toBe('/admin/pendaftar');
    expect(total.textContent).toContain('60');
    expect(total.textContent).toContain('/ 112');
    expect(total.textContent).toContain('Termasuk 4 belum lengkap Berkas');
    expect(within(total).getByRole('progressbar', { name: 'Total pendaftar: 60 dibanding Kuota 112' }).getAttribute('aria-valuenow')).toBe('54');
    // The seat count lives on the Kuota card only, so the page never shows two different "sisa kursi".
    expect(region.queryByText('Kursi Siswa Baru terisi')).toBeNull();
    expect(region.queryByText(/Sisa \d+ kursi/)).toBeNull();

    const accepted = region.getByText('Diterima').closest('a')!;
    expect(accepted.getAttribute('href')).toBe('/admin/pendaftar?status=Diterima');
    expect(accepted.textContent).toContain('40');
    expect(accepted.textContent).toContain('38 Siswa Baru · 2 Pindahan');
  });

  it('explains Pindahan instead of linking it, since Data Pendaftar cannot filter by Jenis Pendaftaran', () => {
    render(<AdminDashboard summary={summary} />);
    const transfers = within(figures()).getByText('Pindahan', { selector: 'span.text-xs' }).closest('[tabindex]')!;
    expect(transfers.tagName).toBe('DIV');
    expect(transfers.textContent).toContain('7');
    expect(transfers.textContent).toContain('Di luar Kuota');
    expect(transfers.closest('a')).toBeNull();
  });

  it('keeps Ditolak and Dibatalkan as a quiet line of links under the headline figures', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.getByRole('link', { name: /Ditolak\s*6/ }).getAttribute('href')).toBe('/admin/pendaftar?status=Ditolak');
    expect(screen.getByRole('link', { name: /Dibatalkan\s*3/ }).getAttribute('href')).toBe('/admin/pendaftar?status=Dibatalkan');
    expect(screen.queryByText('Rekap pendaftaran')).toBeNull();
  });

  it('links every waiting admin task to Data Pendaftar filtered to exactly that work', () => {
    render(<AdminDashboard summary={summary} />);
    expect(tile('Perlu diverifikasi').getAttribute('href')).toBe('/admin/pendaftar?status=Menunggu%20Verifikasi');
    expect(tile('Perlu diverifikasi').textContent).toContain('12');
    expect(tile('Perlu dijadwalkan OKB').getAttribute('href')).toBe('/admin/pendaftar?status=Terverifikasi');
    expect(tile('Tidak hadir OKB').getAttribute('href')).toBe('/admin/pendaftar?okb=terlewat');
    expect(tile('Belum selesai unggah').getAttribute('href')).toBe('/admin/pendaftar?status=Menunggu%20Unggahan');
    expect(tile('Belum diumumkan').getAttribute('href')).toBe('/admin/pendaftar?pengumuman=belum');
    expect(tile('Belum diumumkan').textContent).toContain('3');
    expect(tile('Perlu perhatian').getAttribute('href')).toBe('/admin/pendaftar?perhatian=semua');
    expect(screen.getByRole('link', { name: /3\s*NISN tidak sesuai/ }).getAttribute('href')).toBe('/admin/pendaftar?perhatian=nisn');
  });

  it('counts kinds of waiting work, not Pendaftar, since one Pendaftar can sit in several tasks', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.getByText('6 jenis tugas menunggu')).toBeDefined();
  });

  it('collapses finished tasks into one quiet line instead of a tile', () => {
    render(<AdminDashboard summary={summary} />);
    const finished = screen.getByLabelText('Tugas yang sudah beres');
    expect(within(finished).getByText('Menunggu keputusan')).toBeDefined();
    expect(within(finished).queryByRole('link')).toBeNull();
    expect(within(finished).queryByText('Perlu diverifikasi')).toBeNull();
  });

  it('shows a single all-done card when no task is waiting', () => {
    render(<AdminDashboard summary={{ ...summary, tasks: noTasks, attention: { any: 0, nisn: 0 } }} />);
    expect(screen.getByText('Semua tugas beres')).toBeDefined();
    expect(screen.queryByText(/jenis tugas menunggu/)).toBeNull();
    expect(screen.queryByLabelText('Tugas yang sudah beres')).toBeNull();
  });

  it('shows the total Kuota as a donut with interest per Pilihan Kelas and the empty seats, without per-class limits', () => {
    render(<AdminDashboard summary={summary} />);
    const card = within(capacityCard());
    expect(card.getByRole('img', { name: 'Kuota Siswa Baru: 96 dari 112 kursi terisi' })).toBeDefined();
    const legend = within(card.getByRole('list', { name: 'Peminat per Pilihan Kelas' }));
    const row = (label: string) => legend.getByText(label).closest('li')!.textContent;
    expect(row('Reguler')).toContain('20');
    expect(row('Bilingual')).toContain('48');
    expect(row('Tahfizh')).toContain('28');
    expect(row('Sisa kursi')).toContain('16');
    // Counts only: the legend carries no percentages.
    expect(card.getByRole('list', { name: 'Peminat per Pilihan Kelas' }).textContent).not.toContain('%');
    expect(card.getByText('Sisa 16 kursi')).toBeDefined();
    expect(card.queryByText('Kuota penuh')).toBeNull();
    expect(card.getByRole('link', { name: 'Atur kuota' }).getAttribute('href')).toBe('/admin/pengaturan/kuota');
  });

  it('does not link the donut legend, because Data Pendaftar counts by Kelas Penempatan and every status', () => {
    render(<AdminDashboard summary={summary} />);
    const legend = within(capacityCard()).getByRole('list', { name: 'Peminat per Pilihan Kelas' });
    expect(within(legend).queryByRole('link')).toBeNull();
  });

  it('marks a full Kuota', () => {
    const full = summary.capacity.map(row => ({ ...row, terpakai: row.kuota }));
    render(<AdminDashboard summary={{ ...summary, capacity: full }} />);
    expect(within(capacityCard()).getByText('Kuota penuh')).toBeDefined();
  });

  it('splits the seated Siswa Baru by jenis kelamin inside the Kuota card, in place of Diterima per kelas', () => {
    render(<AdminDashboard summary={summary} />);
    const card = within(capacityCard());
    expect(card.getByRole('img', { name: 'Siswa Baru per jenis kelamin: Laki-laki 50, Perempuan 46' })).toBeDefined();
    // Each block names itself, so there is no separate list of counts underneath.
    expect(card.getByLabelText('Laki-laki: 50 Siswa Baru').textContent).toBe('Laki-laki50');
    expect(card.getByLabelText('Perempuan: 46 Siswa Baru').textContent).toBe('Perempuan46');
    expect(card.queryByRole('list', { name: 'Jenis kelamin Siswa Baru' })).toBeNull();
    expect(card.getByText('96', { selector: 'span.font-bold' }).parentElement!.textContent).toBe('96 siswa');
    expect(card.queryByText(/belum diisi/i)).toBeNull();
    expect(card.getByRole('img', { name: /jenis kelamin/ }).textContent).not.toContain('%');
    expect(card.queryByText(/diterima per kelas/i)).toBeNull();
  });

  it('keeps a small block to its count and leaves the rest to its tooltip', () => {
    render(<AdminDashboard summary={{ ...summary, seatsByGender: { male: 80, female: 16, unknown: 0 } }} />);
    expect(screen.getByLabelText('Perempuan: 16 Siswa Baru').textContent).toBe('16');
  });

  it('notes old rows without jenis kelamin under the bar', () => {
    render(<AdminDashboard summary={{ ...summary, seatsByGender: { male: 50, female: 44, unknown: 2 } }} />);
    expect(screen.getByLabelText('Belum diisi: 2 Siswa Baru')).toBeDefined();
    expect(screen.getByText(/data lama belum diisi jenis kelaminnya/).textContent).toBe('2 data lama belum diisi jenis kelaminnya');
  });

  it('shows an empty gender bar when no Siswa Baru holds a seat', () => {
    render(<AdminDashboard summary={{ ...summary, seatsByGender: { male: 0, female: 0, unknown: 0 } }} />);
    expect(screen.getByText('Data jenis kelamin belum tersedia')).toBeDefined();
  });

  it('shows the nearest OKB day first as a tab, with its Gelombang OKB and the attendance scan', () => {
    render(<AdminDashboard summary={summary} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(tab => tab.getAttribute('aria-label'))).toEqual(['Minggu, 18 Oktober 2026, 18 pendaftar', 'Minggu, 25 Oktober 2026, 6 pendaftar']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByText('Hari ini').length).toBeGreaterThan(0);
    expect(screen.getByText('Gelombang 1 · 10 pendaftar')).toBeDefined();
    expect(screen.getByText('Gelombang 2 · 8 pendaftar')).toBeDefined();
    expect(screen.getByRole('link', { name: /Scan Kehadiran/ }).getAttribute('href')).toBe('/admin/scan');
  });

  it('spreads the selected day over its Ruang OKB in natural order and counts who has no room yet', () => {
    render(<AdminDashboard summary={summary} />);
    const rooms = within(screen.getByRole('list', { name: 'Pembagian Ruang OKB' }));
    expect(rooms.getAllByRole('listitem').map(item => item.textContent)).toEqual(['Ruang 28', 'Ruang 106']);
    expect(screen.getByText('Belum mendapat Ruang OKB').parentElement!.textContent).toContain('4');
  });

  it('offers no date switcher when only one OKB day is coming', () => {
    render(<AdminDashboard summary={{ ...summary, schedule: [summary.schedule[1]] }} />);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByText('Minggu, 25 Oktober 2026')).toBeDefined();
    expect(screen.getByText('Lab Komputer')).toBeDefined();
  });

  it('switches to another OKB day when its tab is picked', () => {
    render(<AdminDashboard summary={summary} />);
    fireEvent.click(screen.getByRole('tab', { name: /25 Oktober 2026/ }));
    // A single Gelombang needs no count of its own; the day total already gives it.
    expect(screen.getByText('Gelombang 3')).toBeDefined();
    expect(within(screen.getByRole('list', { name: 'Pembagian Ruang OKB' })).getByText('Lab Komputer')).toBeDefined();
    expect(screen.getByText('Semua Pendaftar sudah mendapat Ruang OKB.')).toBeDefined();
    expect(screen.queryByText('Belum mendapat Ruang OKB')).toBeNull();
  });

  it('says Ruang OKB data is unavailable instead of counting everyone as roomless', () => {
    render(<AdminDashboard summary={{ ...summary, schedule: summary.schedule.map(day => ({ ...day, rooms: null })) }} />);
    expect(screen.getByText('Data Ruang OKB belum tersedia.')).toBeDefined();
    expect(screen.queryByText('Belum mendapat Ruang OKB')).toBeNull();
  });

  it('no longer links to the Name Tag page from the dashboard', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.queryByRole('link', { name: /Name Tag/ })).toBeNull();
  });

  it('opens the Jadwal tab to see the full schedule', () => {
    render(<AdminDashboard summary={summary} />);
    expect(screen.getByRole('link', { name: 'Lihat semua jadwal' }).getAttribute('href')).toBe('/admin/okb');
  });

  it('hides the scan shortcut and shows an empty state without upcoming OKB', () => {
    render(<AdminDashboard summary={{ ...summary, schedule: [] }} />);
    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.queryByRole('link', { name: /Scan Kehadiran/ })).toBeNull();
  });
});
