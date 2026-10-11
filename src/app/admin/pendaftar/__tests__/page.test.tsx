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

  it('keeps rendering the participant list when status options cannot load', async () => {
    mocks.createParticipantsRepository.mockReturnValue({
      getStatuses: vi.fn().mockRejectedValue(new Error('status query failed')),
      list: vi.fn().mockResolvedValue({ items: [{ id: 'one', namaLengkap: 'Alya', asalSekolah: 'TK Melati', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', createdAt: null }], page: 1, pageSize: 20, total: 1, totalPages: 1 }),
    });
    render(await ParticipantsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getAllByText('Alya')).toHaveLength(2);
    expect(screen.getByRole('alert').textContent).toContain('filter status');
  });

  it('preserves an explicitly requested status if the status query is unavailable', async () => {
    const list = vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 1 });
    mocks.createParticipantsRepository.mockReturnValue({ getStatuses: vi.fn().mockRejectedValue(new Error('status query failed')), list });
    render(await ParticipantsPage({ searchParams: Promise.resolve({ status: 'Status Lama' }) }));
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ statusFilter: 'Status Lama' }));
  });});