import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ParticipantList } from '../components/ParticipantList';
import { ParticipantFilters } from '../components/ParticipantFilters';
import { AdminShell } from '../../components/AdminShell';
import { parseParticipantListQuery } from '../query';
vi.mock('@/features/auth/logout-action', () => ({ logoutAdminAction: vi.fn() }));
const query = parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler&page=2'));
const row = { id: 'abc', nomorPendaftaran: 'OB-2027-007', namaLengkap: 'ANI PUTRI', asalSekolah: 'tK mELATI', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Unggahan', createdAt: '2026-10-10T01:00:00Z', attention: { nisnMismatch: false, followUpDocuments: 0, missingDocuments: 0 } };

describe('Data Peserta UI', () => {
  it('shows Perlu Perhatian under the status only when something needs handling', () => {
    const attention = { nisnMismatch: true, followUpDocuments: 1, missingDocuments: 2 };
    render(<ParticipantList query={query} result={{ items: [{ ...row, status: 'Terjadwal OKB', attention }, { ...row, id: 'b', status: 'Diterima' }], total: 2, page: 1, pageSize: 20, totalPages: 1 }} />);
    const notes = screen.getAllByText('NISN tidak sesuai · 1 berkas perlu tindak lanjut · 2 berkas belum tersedia');
    expect(notes).toHaveLength(2);
    expect(notes[0].className).toContain('text-amber-700');
    expect(document.querySelectorAll('[data-attention]')).toHaveLength(2);
  });

  it('offers the Perlu Perhatian filter', () => {
    render(<ParticipantFilters query={parseParticipantListQuery(new URLSearchParams('perhatian=nisn'))} statuses={['Diterima']} />);
    expect(screen.getByLabelText('Perlu perhatian').textContent).toContain('NISN tidak sesuai');
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
    expect(screen.getByText('Asal TK: TK Melati')).toBeDefined();
    expect(screen.getAllByText('Ani Putri')).toHaveLength(2);
    const links = screen.getAllByRole('link', { name: /detail/i });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toContain('q=Ani');
    expect(screen.getByRole('link', { name: /Sebelumnya/ }).getAttribute('href')).toContain('q=Ani');
    expect(screen.queryByRole('link', { name: /Berikutnya/ })).toBeNull();
    expect(screen.getAllByText(/10 Okt 2026/).length).toBeGreaterThan(0);
  });
  it('renders a resettable empty state, not an empty table', () => {
    render(<ParticipantList query={query} result={{ items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }} />);
    expect(screen.getByText(/Belum ada peserta/)).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByRole('link', { name: /Reset/ }).getAttribute('href')).toBe('/admin/pendaftar');
  });
  it('provides labeled shadcn filters with real status options and no page input', () => {
    render(<ParticipantFilters query={query} statuses={['Menunggu Unggahan', 'Menunggu Verifikasi']} />);
    expect(screen.getByRole('searchbox', { name: 'Cari nama / nomor' })).toBeDefined();
    expect(screen.getAllByRole('combobox')).toHaveLength(4);
    expect(document.querySelector('input[name="page"]')).toBeNull();
    expect(screen.getByRole('button', { name: /Terapkan/ })).toBeDefined();
    expect(screen.getByRole('searchbox', { name: 'Cari nama / nomor' }).getAttribute('maxlength')).toBe('100');
  });
  it('provides matching desktop/mobile navigation with Data Peserta active', () => {
    render(<AdminShell active="participants"><h1>Content</h1></AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Buka menu admin' }));
    expect(screen.getAllByRole('link', { name: 'Data Peserta' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Data Peserta' }).every(link => link.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Ringkasan' }).every(link => !link.hasAttribute('aria-current'))).toBe(true);
  });
});
