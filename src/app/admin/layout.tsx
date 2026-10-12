import { redirect } from 'next/navigation';
import { AdminShell } from '@/features/admin/components/AdminShell';
import { getAdminSession } from '@/features/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!await getAdminSession()) redirect('/login');
  return <AdminShell>{children}</AdminShell>;
}
