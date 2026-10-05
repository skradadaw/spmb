import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));

vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import AdminLayout from '../layout';

describe('AdminLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects an invalid session before rendering protected content', async () => {
    mocks.getAdminSession.mockResolvedValue(false);
    await expect(AdminLayout({ children: <div>Rahasia siswa</div> })).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
  });

  it('renders protected content for a valid session', async () => {
    mocks.getAdminSession.mockResolvedValue(true);
    render(await AdminLayout({ children: <div>Dashboard aman</div> }));
    expect(screen.getByText('Dashboard aman')).toBeDefined();
    expect(mocks.getAdminSession).toHaveBeenCalledTimes(1);
  });
});
