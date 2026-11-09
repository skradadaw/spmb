import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  fetchUsage: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/admin/ruangOkb/server/ruangOkbRepository', () => ({ fetchRuangOkbUsage: mocks.fetchUsage }));
vi.mock('@/features/admin/ruangOkb/actions/ruangOkbActions', () => ({ createRuangOkbAction: vi.fn(), renameRuangOkbAction: vi.fn(), deleteRuangOkbAction: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import RuangOkbSettingsPage from '../page';

describe('RuangOkbSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
    mocks.fetchUsage.mockResolvedValue([{ id: 'r1', nama: 'Kelas 2', dipakai: 3 }]);
  });

  it('sends anyone without an admin session to the login page before reading data', async () => {
    mocks.getAdminSession.mockResolvedValue(false);

    await expect(RuangOkbSettingsPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.fetchUsage).not.toHaveBeenCalled();
  });

  it('shows the room list with its usage', async () => {
    render(await RuangOkbSettingsPage());

    expect(screen.getByRole('list', { name: 'Daftar Ruang OKB' }).textContent).toContain('Kelas 2');
    expect(screen.getByText('3 Pendaftar')).toBeDefined();
  });

  it('shows an error instead of an empty list when the list cannot be loaded', async () => {
    mocks.fetchUsage.mockRejectedValue(new Error('db down'));
    render(await RuangOkbSettingsPage());

    expect(screen.getByText('Daftar Ruang OKB belum dapat dimuat')).toBeDefined();
    expect(screen.queryByText(/Belum ada ruangan/)).toBeNull();
    expect(screen.queryByText(/db down/)).toBeNull();
  });
});
