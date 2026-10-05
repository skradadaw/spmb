'use server';

import { redirect } from 'next/navigation';
import { clearAdminSession } from './session';

export async function logoutAdminAction(): Promise<never> {
  await clearAdminSession();
  redirect('/login');
}
