import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ParticipantList } from '../components/ParticipantList';
import { ParticipantFilters } from '../components/ParticipantFilters';
import { AdminShell } from '../../components/AdminShell';
import { parseParticipantListQuery } from '../query';
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router, usePathname: () => '/admin/pendaftar' }));
vi.mock('@/features/auth/logout-action', () => ({ logoutAdminAction: vi.fn() }));
const query = parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler&page=2'));
const row = { id: 'abc', nomorPendaftaran: 'OB-2027-007', namaLengkap: 'ANI PUTRI', asalSekolah: 'tK mELATI', pilihanKelas: 'Reguler', kelasPenempatan: null, kelasTujuan: null, jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Unggahan', jadwalGelombang: null, createdAt: '2026-10-10T01:00:00Z', attention: { nisnMismatch: false, missingDocuments: 0 } };

describe('Data Pendaftar UI', () => {
  it('shows Perlu Perhatian under the status only when something needs handling', () => {
    const attention = { nisnMismatch: true, missingDocuments: 2 };
    render(<ParticipantList query={query} result={{ items: [{ ...row, status: 'Terjadwal OKB', attention }, { ...row, id: 'b', status: 'Diterima' }], total: 2, page: 1, pageSize: 20, totalPages: 1 }} />);
    const notes = screen.getAllByText('NISN tidak sesuai · 2 berkas belum tersedia');
    expect(notes).toHaveLength(2);
    expect(notes[0].className).toContain('text-amber-700');
    expect(document.querySelectorAll('[data-attention]')).toHaveLength(2);
  });

  it('gives scheduled applicants their own blue status with the Gelombang name under it', () => {
    render(<ParticipantList query={query} result={{ items: [{ ...row, status: 'Terjadwal OKB', jadwalGelombang: 'Gelombang 2' }, { ...row, id: 'b', status: 'Sudah OKB' }], total: 2, page: 1, pageSize: 20, totalPages: 1 }} />);
    const scheduled = screen.getAllByText('Terjadwal OKB');
    expect(scheduled.every(element => element.className.includes('text-sky-700'))).toBe(true);
    expect(screen.getAllByText('Sudah OKB').every(element => element.className.includes('text-amber-700'))).toBe(true);
    // Desktop table and mobile card both name the Gelombang, without the date.
    expect(screen.getAllByText('Gelombang 2')).toHaveLength(2);
    expect(screen.queryByText(/Gelombang 1|Gelombang 3/)).toBeNull();
  });

  it('filters by Gelombang OKB and clears it with Reset', () => {
    render(<ParticipantFilters query={parseParticipantListQuery(new URLSearchParams('gelombang=3'))} statuses={['Terjadwal OKB']} />);
    expect(screen.getByLabelText('Gelombang').textContent).toContain('Gelombang 3');
    expect(screen.getByRole('link', { name: /Reset/ }).getAttribute('href')).toBe('/admin/pendaftar');
  });

  it('offers Perlu Perhatian as one checkbox and keeps the NISN link from the dashboard as a removable chip', () => {
    render(<ParticipantFilters query={parseParticipantListQuery(new URLSearchParams('perhatian=nisn'))} statuses={['Diterima']} />);
    expect((screen.getByRole('checkbox', { name: 'Perlu perhatian' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus filter NISN tidak sesuai' }));
    expect(router.replace).toHaveBeenLastCalledWith('/admin/pendaftar?perhatian=semua', { scroll: false });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Perlu perhatian' }));
    expect(router.replace).toHaveBeenLastCalledWith('/admin/pendaftar', { scroll: false });
  });

  it('shows the registration number under the name and status as colored text, not a badge', () => {
    render(<ParticipantList query={query} result={{ items: [{ ...row, status: 'Diterima' }], total: 1, page: 1, pageSize: 20, totalPages: 1 }} />);
    expect(screen.queryByRole('columnheader', { name: /pendaftaran/i })).toBeNull();
    const nameCell = screen.getAllByText('Ani Putri')[0].closest('td');
    expect(nameCell?.textContent).toContain('OB-2027-007');
    const statuses = screen.getAllByText('Diterima');
    expect(statuses.every((element) => element.className.includes('text-emerald-700'))).toBe(true);
    expect(statuses.every((element) => element.tagName === 'SPAN' && !/rounded|border/.test(element.className))).toBe(true);
  });

  it('renders desktop and mobile detail links preserving list query', () => {
    render(<ParticipantList query={query} result={{ items: [row], total: 21, page: 2, pageSize: 20, totalPages: 2 }} />);
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByRole('columnheader', { name: 'Asal TK' })).toBeDefined();
    expect(screen.getByRole('cell', { name: 'TK Melati' })).toBeDefined();
    const mobileCard = within(screen.getByRole('list', { name: 'Daftar pendaftar' })).getByRole('link', { name: 'Lihat detail Ani Putri' });
    expect(within(mobileCard).getByText('Asal TK').nextElementSibling?.textContent).toBe('TK Melati');
    expect(within(mobileCard).getByText('OB-2027-007')).toBeDefined();
    expect(screen.getAllByText('Ani Putri')).toHaveLength(2);
    const links = screen.getAllByRole('link', { name: /detail/i });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toContain('q=Ani');
    expect(screen.getByRole('link', { name: 'Sebelumnya' }).getAttribute('href')).toContain('q=Ani');
    expect(screen.queryByRole('link', { name: 'Berikutnya' })).toBeNull();
    expect(screen.getAllByText(/10 Okt 2026/).length).toBeGreaterThan(0);
  });
  it('numbers the pages with gaps and marks the current one', () => {
    render(<ParticipantList query={query} result={{ items: [row], total: 240, page: 6, pageSize: 20, totalPages: 12 }} />);
    const pages = screen.getAllByRole('link', { name: /^Halaman \d+$/ });
    expect(pages.map(link => link.textContent)).toEqual(['1', '5', '6', '7', '12']);
    expect(screen.getByRole('link', { name: 'Halaman 6' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Halaman 12' }).getAttribute('href')).toBe('/admin/pendaftar?q=Ani&kelas=Reguler&page=12');
    expect(within(screen.getByRole('navigation', { name: 'Halaman' })).getByText('6 / 12')).toBeDefined();
  });
  it('shows Kelas Penempatan once set and the target grade of a Pindahan', () => {
    render(<ParticipantList query={query} result={{ items: [{ ...row, pilihanKelas: 'Tahfizh', kelasPenempatan: 'Reguler', status: 'Diterima' }, { ...row, id: 'p', jenisPendaftaran: 'Pindahan', kelasTujuan: '3' }], total: 2, page: 1, pageSize: 20, totalPages: 1 }} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Reguler');
    expect(rows[1].textContent).not.toContain('Tahfizh');
    expect(rows[2].textContent).toContain('Pindahan · Kelas 3');
  });
  it('renders a resettable empty state, not an empty table', () => {
    render(<ParticipantList query={query} result={{ items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }} />);
    expect(screen.getByText(/Belum ada pendaftar/)).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByRole('link', { name: /Reset/ }).getAttribute('href')).toBe('/admin/pendaftar');
  });
  it('keeps only search, Status, Kelas, Gelombang and Perlu perhatian, applied without a submit button', () => {
    render(<ParticipantFilters query={query} statuses={['Menunggu Unggahan', 'Menunggu Verifikasi']} />);
    expect(screen.getByRole('searchbox', { name: 'Cari nama / nomor' }).getAttribute('maxlength')).toBe('100');
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Terapkan/ })).toBeNull();
    // Ekspor pindah ke header halaman, di luar card filter.
    expect(screen.queryByText(/Ekspor/)).toBeNull();
    expect(screen.getByRole('link', { name: /Reset/ }).getAttribute('href')).toBe('/admin/pendaftar');
  });
  it('hides Reset when nothing is filtered and searches after typing pauses', () => {
    vi.useFakeTimers();
    try {
      router.replace.mockClear();
      render(<ParticipantFilters query={parseParticipantListQuery(new URLSearchParams('page=3'))} statuses={[]} />);
      expect(screen.queryByRole('link', { name: /Reset/ })).toBeNull();
      fireEvent.change(screen.getByRole('searchbox', { name: 'Cari nama / nomor' }), { target: { value: 'Ani ' } });
      expect(router.replace).not.toHaveBeenCalled();
      act(() => { vi.advanceTimersByTime(400); });
      expect(router.replace).toHaveBeenCalledWith('/admin/pendaftar?q=Ani', { scroll: false });
    } finally {
      vi.useRealTimers();
    }
  });
  it('provides matching desktop/mobile navigation with Data Pendaftar active', () => {
    render(<AdminShell active="participants"><h1>Content</h1></AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Buka menu admin' }));
    expect(screen.getAllByRole('link', { name: 'Data Pendaftar' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Data Pendaftar' }).every(link => link.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Ringkasan' }).every(link => !link.hasAttribute('aria-current'))).toBe(true);
  });
});
