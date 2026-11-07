import Link from 'next/link';
import { CalendarX2, ChevronRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OkbScheduleList } from '@/features/admin/okbSchedule/components/OkbScheduleList';
import { fetchOkbSchedule } from '@/features/admin/okbSchedule/server/okbScheduleRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function OkbSchedulePage() {
  if (!await getAdminSession()) redirect('/login');

  const view = await fetchOkbSchedule(getSupabaseAdmin()).catch(() => null);

  return <>
    <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
      Tanggal OKB hari ini dan seterusnya, dengan jumlah Pendaftar per Gelombang OKB. Jadwal OKB ditetapkan di detail Pendaftar.
    </p>
    <div className="mt-4 space-y-3">
      {!view && <Alert variant="destructive"><AlertTitle>Jadwal OKB belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
      {view && view.missed > 0 && (
        <Link href="/admin/pendaftar?okb=terlewat" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <CalendarX2 aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{view.missed} Pendaftar Tidak Hadir OKB</span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      )}
      {view && <OkbScheduleList days={view.days} today={view.today} />}
    </div>
  </>;
}
