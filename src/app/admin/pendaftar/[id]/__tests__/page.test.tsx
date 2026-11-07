import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
}));

vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
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

  describe('Ruang OKB suggestions', () => {
    const scheduled = { id, nama_lengkap: 'Alya', status: 'Terjadwal OKB', ruang_okb: null };
    const suggestionOptions = () => {
      const list = document.getElementById(screen.getByLabelText('Ruang OKB').getAttribute('list') ?? '');
      return [...(list?.querySelectorAll('option') ?? [])].map(option => option.value);
    };
    const openPage = () => ParticipantPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    /** The detail also reads through `range`; only the query filtered by date is the suggestion query. */
    const clientWithSuggestionRows = (result: { data: unknown; error: unknown }) => {
      const client = clientWith(scheduled);
      client.query.range.mockImplementation(async () => client.query.gte.mock.calls.length ? result : { data: [], error: null });
      mocks.getSupabaseAdmin.mockReturnValue(client);
      return client;
    };

    it('loads them for the form, from upcoming Terjadwal OKB only', async () => {
      const client = clientWithSuggestionRows({
        data: [
          { id: 'b', nama_lengkap: 'Bilal', ruang_okb: 'Ruang B', jadwal_okb_tanggal: '2099-01-01', jadwal_okb_gelombang: 1 },
          { id: 'c', nama_lengkap: 'Citra', ruang_okb: 'Ruang A', jadwal_okb_tanggal: '2099-01-02', jadwal_okb_gelombang: 2 },
        ],
        error: null,
      });

      render(await openPage());

      expect(suggestionOptions()).toEqual(['Ruang A', 'Ruang B']);
      expect(client.query.eq).toHaveBeenCalledWith('status', 'Terjadwal OKB');
      expect(client.query.gte).toHaveBeenCalledWith('jadwal_okb_tanggal', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    });

    it('still opens the detail, without suggestions, when they cannot be loaded', async () => {
      clientWithSuggestionRows({ data: null, error: new Error('private database error') });

      render(await openPage());

      expect(screen.getByRole('heading', { name: 'Alya' })).toBeDefined();
      expect(suggestionOptions()).toEqual([]);
    });

    it('does not read them when the Ruang OKB cannot be changed', async () => {
      const client = clientWith({ id, nama_lengkap: 'Alya', status: 'Menunggu Unggahan' });
      mocks.getSupabaseAdmin.mockReturnValue(client);

      await openPage();

      expect(client.query.gte).not.toHaveBeenCalled();
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