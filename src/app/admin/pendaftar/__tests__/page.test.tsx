import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAdminSession: vi.fn(), getSupabaseAdmin: vi.fn(), redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }), createParticipantsRepository: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock('@/features/admin/participants/server/participantsRepository', () => ({ createParticipantsRepository: mocks.createParticipantsRepository }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import ParticipantsPage from '../page';

describe('ParticipantsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
    mocks.getSupabaseAdmin.mockReturnValue({});
  });

  it('renders the list with the fixed status filter options from a single repository call', async () => {
    const list = vi.fn().mockResolvedValue({ items: [{ id: 'one', nomorPendaftaran: 'OB-2027-001', namaLengkap: 'Alya', asalSekolah: 'TK Melati', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', createdAt: null, attention: { nisnMismatch: false, followUpDocuments: 0, missingDocuments: 0 } }], page: 1, pageSize: 20, total: 1, totalPages: 1 });
    mocks.createParticipantsRepository.mockReturnValue({ list });
    render(await ParticipantsPage({ searchParams: Promise.resolve({ status: 'Terjadwal OKB' }) }));
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getAllByText('Alya')).toHaveLength(2);
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ statusFilter: 'Terjadwal OKB' }));
  });

  it('ignores a status outside the fixed lifecycle', async () => {
    const list = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 1 });
    mocks.createParticipantsRepository.mockReturnValue({ list });
    render(await ParticipantsPage({ searchParams: Promise.resolve({ status: 'Status Lama' }) }));
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ statusFilter: null }));
  });

  it('shows an error instead of an empty list when the query fails', async () => {
    mocks.createParticipantsRepository.mockReturnValue({ list: vi.fn().mockRejectedValue(new Error('db down')) });
    render(await ParticipantsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Data peserta belum dapat dimuat')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
