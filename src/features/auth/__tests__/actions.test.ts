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

import { verifyAdminPinAction } from '../actions';
import { resetRateLimitForTesting } from '../rate-limit';

describe('Admin PIN verification server action', () => {
  const originalEnv = process.env.ADMIN_PIN;
  const originalSessionSecret = process.env.ADMIN_SESSION_SECRET;

  afterEach(() => {
    process.env.ADMIN_PIN = originalEnv;
    process.env.ADMIN_SESSION_SECRET = originalSessionSecret;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.ADMIN_PIN = '123456';
    process.env.ADMIN_SESSION_SECRET = 'a-secure-test-secret-that-is-at-least-32-characters';
    await resetRateLimitForTesting();
  });

  it('rejects empty, non-numeric, or incorrectly sized PIN', async () => {
    const res1 = await verifyAdminPinAction('');
    expect(res1).toEqual({ success: false, error: 'PIN tidak boleh kosong' });

    const res2 = await verifyAdminPinAction('abc123');
    expect(res2).toEqual({ success: false, error: 'PIN harus berupa angka' });

    const res3 = await verifyAdminPinAction('12345');
    expect(res3).toEqual({ success: false, error: 'PIN harus terdiri dari 6 angka' });
  });

  it('fails closed when ADMIN_PIN is not configured', async () => {
    delete process.env.ADMIN_PIN;

    const res = await verifyAdminPinAction('123456');

    expect(res).toEqual({
      success: false,
      error: 'Konfigurasi keamanan belum tersedia. Hubungi administrator.',
    });
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
  });

  it('fails closed when the session secret is not configured', async () => {
    delete process.env.ADMIN_SESSION_SECRET;

    const res = await verifyAdminPinAction('123456');

    expect(res).toEqual({
      success: false,
      error: 'Konfigurasi keamanan belum tersedia. Hubungi administrator.',
    });
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
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
