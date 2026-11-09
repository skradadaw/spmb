import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
  fetchRooms: vi.fn(),
}));

vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock('@/features/admin/ruangOkb/server/ruangOkbRepository', () => ({ fetchRuangOkbList: mocks.fetchRooms }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ host: 'spmb.example', 'x-forwarded-proto': 'https' }) }));

import ParticipantPage from '../page';

const id = '123e4567-e89b-12d3-a456-426614174000';

function clientWith(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    range: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  return { from: vi.fn(() => query), query };
}

describe('ParticipantPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
  });

  it('redirects unauthenticated requests before reading participant data', async () => {
    mocks.getAdminSession.mockResolvedValue(false);
    await expect(ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('renders participant data and preserves only supported list filters', async () => {
    const client = clientWith({ id, nama_lengkap: 'Alya', status: 'Menunggu Unggahan' });
    mocks.getSupabaseAdmin.mockReturnValue(client);
    const page = await ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({ q: 'Alya', kelas: 'Reguler', status: 'Status Lama', next: 'https://example.test' }) });
    render(page);
    expect(screen.getByRole('heading', { name: 'Alya' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Kembali ke Data Pendaftar/ }).getAttribute('href')).toBe('/admin/pendaftar?q=Alya&kelas=Reguler&status=Status+Lama');
    expect(client.query.select.mock.calls[0][0]).not.toContain('submission_secret_hash');
  });

  describe('Ruang OKB room list', () => {
    const scheduled = { id, nama_lengkap: 'Alya', status: 'Terjadwal OKB', ruang_okb: null };
    const openPage = () => ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    const roomOptions = () => {
      HTMLElement.prototype.scrollIntoView = vi.fn();
      fireEvent.keyDown(screen.getByRole('combobox', { name: 'Ruang OKB' }), { key: 'Enter' });
      return screen.getAllByRole('option').map(option => option.textContent);
    };

    it('offers the rooms from the list in the form', async () => {
      mocks.getSupabaseAdmin.mockReturnValue(clientWith(scheduled));
      mocks.fetchRooms.mockResolvedValue([{ id: 'r1', nama: 'Kelas 2' }, { id: 'r2', nama: 'Kelas 10' }]);

      render(await openPage());

      expect(roomOptions()).toEqual(['Kelas 2', 'Kelas 10']);
    });

    it('still opens the detail, saying the room list could not be loaded', async () => {
      mocks.getSupabaseAdmin.mockReturnValue(clientWith(scheduled));
      mocks.fetchRooms.mockRejectedValue(new Error('private database error'));

      render(await openPage());

      expect(screen.getByRole('heading', { name: 'Alya' })).toBeDefined();
      expect(screen.getByText('Daftar Ruang OKB belum dapat dimuat. Muat ulang halaman.')).toBeDefined();
      expect(screen.queryByText(/private database error/)).toBeNull();
    });

    it('does not read them when the Ruang OKB cannot be changed', async () => {
      mocks.getSupabaseAdmin.mockReturnValue(clientWith({ id, nama_lengkap: 'Alya', status: 'Menunggu Unggahan' }));

      await openPage();

      expect(mocks.fetchRooms).not.toHaveBeenCalled();
    });
  });

  it('returns not found for malformed IDs and missing participants', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientWith(null));
    await expect(ParticipantPage({ params: Promise.resolve({ id: 'not-a-uuid' }), searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('renders a safe error state for repository failures', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientWith(null, new Error('private database error')));
    const page = await ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByRole('alert').textContent).toContain('Detail pendaftar belum dapat dimuat');
    expect(document.body.textContent).not.toContain('private database error');
  });
});