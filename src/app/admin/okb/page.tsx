import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OkbOverview } from '@/features/admin/okbOverview/components/OkbOverview';
import { fetchOkbOverview } from '@/features/admin/okbOverview/server/okbOverviewRepository';
import { fetchRuangOkbList } from '@/features/admin/ruangOkb/server/ruangOkbRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function OkbOverviewPage() {
  if (!await getAdminSession()) redirect('/login');

  const supabase = getSupabaseAdmin();
  const [overview, rooms] = await Promise.all([
    fetchOkbOverview(supabase).catch(() => null),
    // Daftar ruangan hanya pelengkap Pembagian Ruang OKB; tanpanya ringkasan tetap tampil.
    fetchRuangOkbList(supabase).catch(() => null),
  ]);

  return <>
    <p className="max-w-3xl text-sm leading-6 text-[var(--admin-muted)]">
      Gambaran kegiatan OKB: tahap Pendaftar, Jadwal OKB beserta pembagian Ruang OKB, dan Hasil OKB per Gelombang. Jadwal OKB ditetapkan di detail Pendaftar.
    </p>
    <div className="mt-5">
      {overview
        ? <OkbOverview overview={overview} roomNames={rooms?.map(room => room.nama) ?? null} />
        : <Alert variant="destructive"><AlertTitle>Ringkasan OKB belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
    </div>
  </>;
}
