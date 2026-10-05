import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const cookieStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };
  return {
    cookieStore,
    getCookies: vi.fn().mockResolvedValue(cookieStore),
    getHeaders: vi.fn().mockResolvedValue(new Headers({ 'x-forwarded-for': '127.0.0.1' })),
  };
});

vi.mock('next/headers', () => ({
  cookies: mocks.getCookies,
  headers: mocks.getHeaders,
}));

import { verifyAdminPinAction, resetRateLimitForTesting } from '@/features/auth/actions';

describe('Admin PIN verification server action', () => {
  const originalEnv = process.env.ADMIN_PIN;

  afterEach(() => {
    process.env.ADMIN_PIN = originalEnv;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.ADMIN_PIN = '123456';
    await resetRateLimitForTesting();
  });

  it("declares the module-level 'use server' directive", () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/auth/actions.ts'), 'utf8');
    expect(source).toMatch(/^'use server';/);
  });

  it('rejects empty or non-numeric PIN', async () => {
    const res1 = await verifyAdminPinAction('');
    expect(res1).toEqual({ success: false, error: 'PIN tidak boleh kosong' });

    const res2 = await verifyAdminPinAction('abc123');
    expect(res2).toEqual({ success: false, error: 'PIN harus berupa angka' });
  });

  it('verifies correct PIN, sets session cookie, and returns redirectUrl', async () => {
    const res = await verifyAdminPinAction('123456');
    expect(res).toEqual({ success: true, redirectUrl: '/admin' });
    expect(mocks.cookieStore.set).toHaveBeenCalledWith(
      'spmb_admin_session',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      })
    );
  });

  it('rejects incorrect PIN and reports remaining attempts', async () => {
    const res = await verifyAdminPinAction('999999');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain('PIN salah');
      expect(res.remainingAttempts).toBe(4);
    }
  });

  it('locks out after 5 consecutive incorrect attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await verifyAdminPinAction('000000');
    }
    const res = await verifyAdminPinAction('123456');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain('Terlalu banyak percobaan');
    }
  });
});
