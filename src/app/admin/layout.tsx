import { redirect } from 'next/navigation';
import { getAdminSession } from '@/features/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!await getAdminSession()) redirect('/login');
  return children;
}
