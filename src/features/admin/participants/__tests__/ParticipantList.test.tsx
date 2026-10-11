import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ParticipantList } from '../components/ParticipantList';
import { ParticipantFilters } from '../components/ParticipantFilters';
import { AdminShell } from '../../components/AdminShell';
import { parseParticipantListQuery } from '../query';
vi.mock('@/features/auth/logout-action', () => ({ logoutAdminAction: vi.fn() }));
const query = parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler&page=2'));
const row = { id: 'abc', namaLengkap: 'ANI PUTRI', asalSekolah: 'tK mELATI', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Unggahan', createdAt: '2026-10-10T01:00:00Z' };

describe('Data Peserta UI', () => {
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
    expect(screen.getByRole('searchbox', { name: 'Cari nama' })).toBeDefined();
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(document.querySelector('input[name="page"]')).toBeNull();
    expect(screen.getByRole('button', { name: /Terapkan/ })).toBeDefined();
    expect(screen.getByRole('searchbox', { name: 'Cari nama' }).getAttribute('maxlength')).toBe('100');
  });
  it('provides matching desktop/mobile navigation with Data Peserta active', () => {
    render(<AdminShell active="participants"><h1>Content</h1></AdminShell>);
    expect(screen.getAllByRole('link', { name: 'Data Peserta' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Data Peserta' }).every(link => link.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Ringkasan' }).every(link => !link.hasAttribute('aria-current'))).toBe(true);
  });
});
