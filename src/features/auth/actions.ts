'use server';

import { headers } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import type { VerifyPinResult } from './contracts';
import { setAdminSession } from './session';
import { clearAttemptRecord, getAttemptRecord, setAttemptRecord } from './rate-limit';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

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

  if (!/^\d{6}$/.test(cleanPin)) {
    return { success: false, error: 'PIN harus terdiri dari 6 angka' };
  }

  const expectedPin = process.env.ADMIN_PIN;
  if (!expectedPin || !/^\d{6}$/.test(expectedPin)) {
    console.error('ADMIN_PIN must be configured as exactly 6 digits.');
    return {
      success: false,
      error: 'Konfigurasi keamanan belum tersedia. Hubungi administrator.',
    };
  }

  const clientIp = await getClientIp();
  const now = Date.now();
  const record = getAttemptRecord(clientIp);

  if (record.lockedUntil && record.lockedUntil > now) {
    const secondsRemaining = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Terlalu banyak percobaan salah. Coba lagi dalam ${secondsRemaining} detik.`,
    };
  }

  const pinMatches = timingSafeEqual(Buffer.from(cleanPin), Buffer.from(expectedPin));
  if (!pinMatches) {
    const newCount = (record.count || 0) + 1;
    if (newCount >= MAX_ATTEMPTS) {
      setAttemptRecord(clientIp, {
        count: newCount,
        lockedUntil: now + LOCKOUT_DURATION_MS,
      });
      return {
        success: false,
        error: 'Terlalu banyak percobaan salah. Akses dikunci selama 60 detik.',
      };
    }

    setAttemptRecord(clientIp, { count: newCount, lockedUntil: null });
    const remaining = MAX_ATTEMPTS - newCount;
    return {
      success: false,
      error: `PIN salah. Sisa ${remaining} kesempatan.`,
      remainingAttempts: remaining,
    };
  }

  // PIN benar, reset rekor percobaan
  clearAttemptRecord(clientIp);
  try {
    await setAdminSession();
  } catch (error) {
    console.error('Unable to create the admin session.', error);
    return {
      success: false,
      error: 'Konfigurasi keamanan belum tersedia. Hubungi administrator.',
    };
  }

  return {
    success: true,
    redirectUrl: '/admin',
  };
}
