import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookieStore: {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mocks.cookieStore),
}));

import { getAdminSession, setAdminSession } from '../session';

describe('admin session', () => {
  const originalSecret = process.env.ADMIN_SESSION_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SESSION_SECRET = 'a-secure-test-secret-that-is-at-least-32-characters';
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = originalSecret;
  });

  it('rejects a forged cookie value', async () => {
    mocks.cookieStore.get.mockReturnValue({ value: 'anything-an-attacker-sets' });

    await expect(getAdminSession()).resolves.toBe(false);
  });

  it('accepts only a session token created by the server', async () => {
    await setAdminSession();
    const token = mocks.cookieStore.set.mock.calls[0][1] as string;
    mocks.cookieStore.get.mockReturnValue({ value: token });

    await expect(getAdminSession()).resolves.toBe(true);
  });

  it('does not create a session without a strong secret', async () => {
    delete process.env.ADMIN_SESSION_SECRET;

    await expect(setAdminSession()).rejects.toThrow('ADMIN_SESSION_SECRET');
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
  });
});
