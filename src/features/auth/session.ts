import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'spmb_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return Boolean(session?.value);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
