import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearAdminSession: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));

vi.mock('../session', () => ({ clearAdminSession: mocks.clearAdminSession }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import { logoutAdminAction } from '../logout-action';

describe('logoutAdminAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears the admin session before redirecting to login', async () => {
    await expect(logoutAdminAction()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.clearAdminSession).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.clearAdminSession.mock.invocationCallOrder[0]).toBeLessThan(mocks.redirect.mock.invocationCallOrder[0]);
  });
});
