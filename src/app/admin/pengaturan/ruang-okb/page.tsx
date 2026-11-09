import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RuangOkbManager } from '@/features/admin/ruangOkb/components/RuangOkbManager';
import { fetchRuangOkbUsage } from '@/features/admin/ruangOkb/server/ruangOkbRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function RuangOkbSettingsPage() {
  if (!await getAdminSession()) redirect('/login');

  const rooms = await fetchRuangOkbUsage(getSupabaseAdmin()).catch(() => null);

  return <>
    <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
      Siapkan ruangan tempat Pendaftar mengikuti OKB. Ruang OKB setiap Pendaftar dipilih dari daftar ini, untuk semua tanggal dan Gelombang OKB.
      Ruangan yang masih dipakai tidak dapat dihapus.
    </p>
    <div className="mt-5">
      {rooms
        ? <RuangOkbManager rooms={rooms} />
        : <Alert variant="destructive"><AlertTitle>Daftar Ruang OKB belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
    </div>
  </>;
}
