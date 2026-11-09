import { redirect } from 'next/navigation';

/** Menu Pengaturan selalu terbuka di tab pertamanya, Kuota Kelas. */
export default function SettingsPage() {
  redirect('/admin/pengaturan/kuota');
}
