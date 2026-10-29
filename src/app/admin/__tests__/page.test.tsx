import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseConfigurationError } from '@/features/registration/server/supabaseAdmin';

const mocks = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  getAdminSession: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));
vi.mock('@/features/registration/server/supabaseAdmin', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/registration/server/supabaseAdmin')>(),
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import AdminPage from '../page';

function clientReturning(awaiting: number, error: unknown = null) {
  const data = {
    today: '2026-10-18', total: awaiting, tasks: { awaiting }, attention: { any: 0, nisn: 0 },
    capacity: [], transfers: 0, results: {}, acceptedByClass: [], schedule: [],
  };
  return { rpc: vi.fn().mockResolvedValue({ data: error ? null : data, error }) };
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
  });

  it('redirects before accessing Supabase when the session is invalid', async () => {
    mocks.getAdminSession.mockResolvedValue(false);

    await expect(AdminPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('renders live registration metrics from Supabase', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning(3));
    render(await AdminPage());

    expect(screen.getByText('Dashboard Pendaftaran')).toBeDefined();
    expect(screen.getByText('Perlu diverifikasi').closest('a')?.textContent).toContain('3');
  });

  it('renders a calm dashboard for zero registrations', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning(0));
    render(await AdminPage());
    expect(screen.getAllByText('Tidak ada yang perlu dikerjakan')).toHaveLength(7);
    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
  });

  it('renders a safe alert when configuration is unavailable', async () => {
    mocks.getSupabaseAdmin.mockImplementation(() => { throw new SupabaseConfigurationError(); });
    render(await AdminPage());

    expect(screen.getByRole('alert').textContent).toContain('Dashboard belum dapat dimuat');
    expect(screen.queryByRole('main')).toBeNull();
    expect(document.body.textContent).not.toContain('service role');
    expect(screen.getByRole('button', { name: 'Muat ulang halaman' }).closest('form')?.getAttribute('action')).toBe('/admin');
  });

  it('does not expose raw Supabase errors', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning(0, { message: 'secret database detail' }));
    render(await AdminPage());

    expect(screen.getByRole('alert').textContent).toContain('Dashboard belum dapat dimuat');
    expect(document.body.textContent).not.toContain('secret database detail');
  });
});
