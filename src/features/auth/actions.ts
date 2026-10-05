'use server';

import { headers } from 'next/headers';
import type { VerifyPinResult } from './contracts';
import { setAdminSession } from './session';

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const attempts = new Map<string, AttemptRecord>();

export async function resetRateLimitForTesting() {
  attempts.clear();
}

async function getClientIp(): Promise<string> {
  const reqHeaders = await headers();
  const forwarded = reqHeaders.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return reqHeaders.get('x-real-ip') || '127.0.0.1';
}

export async function verifyAdminPinAction(pin: string): Promise<VerifyPinResult> {
  if (!pin || pin.trim().length === 0) {
    return { success: false, error: 'PIN tidak boleh kosong' };
  }

  const cleanPin = pin.trim();
  if (!/^\d+$/.test(cleanPin)) {
    return { success: false, error: 'PIN harus berupa angka' };
  }

  const clientIp = await getClientIp();
  const now = Date.now();
  const record = attempts.get(clientIp) || { count: 0, lockedUntil: null };

  if (record.lockedUntil && record.lockedUntil > now) {
    const secondsRemaining = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Terlalu banyak percobaan salah. Coba lagi dalam ${secondsRemaining} detik.`,
    };
  }

  const expectedPin = process.env.ADMIN_PIN || '123456';

  if (cleanPin !== expectedPin) {
    const newCount = (record.count || 0) + 1;
    if (newCount >= MAX_ATTEMPTS) {
      attempts.set(clientIp, {
        count: newCount,
        lockedUntil: now + LOCKOUT_DURATION_MS,
      });
      return {
        success: false,
        error: 'Terlalu banyak percobaan salah. Akses dikunci selama 60 detik.',
      };
    }

    attempts.set(clientIp, { count: newCount, lockedUntil: null });
    const remaining = MAX_ATTEMPTS - newCount;
    return {
      success: false,
      error: `PIN salah. Sisa ${remaining} kesempatan.`,
      remainingAttempts: remaining,
    };
  }

  // PIN benar, reset rekor percobaan
  attempts.delete(clientIp);
  await setAdminSession();

  return {
    success: true,
    redirectUrl: '/admin',
  };
}
