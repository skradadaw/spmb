import { CalendarDays } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { NameTagGroupPicker } from '@/features/admin/nameTag/components/NameTagGroupPicker';
import { DownloadNameTagZip } from '@/features/admin/nameTag/components/DownloadNameTagZip';
import { NAME_TAG_CARD, NameTagCardHeader } from '@/features/admin/nameTag/components/NameTagCardHeader';
import { NameTagSummaryPanel } from '@/features/admin/nameTag/components/NameTagSummaryPanel';
import { RuangOkbBulkForm } from '@/features/admin/nameTag/components/RuangOkbBulkForm';
import { buildNameTagView, nameTagGroupKey } from '@/features/admin/nameTag/nameTagGroups';
import { fetchNameTagRows } from '@/features/admin/nameTag/server/nameTagRepository';
import { fetchRuangOkbList } from '@/features/admin/ruangOkb/server/ruangOkbRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NameTagPage({ searchParams }: Props) {
  if (!await getAdminSession()) redirect('/login');

  const { tanggal, gelombang } = await searchParams;
  const supabase = getSupabaseAdmin();
  const [rows, rooms] = await Promise.all([
    fetchNameTagRows(supabase).catch(() => null),
    // Tanpa daftar ruangan, Pendaftar dan unduhan Name Tag tetap tampil; formnya memberi tahu.
    fetchRuangOkbList(supabase).catch(() => null),
  ]);
  const view = rows && buildNameTagView(rows, { tanggal, gelombang });

  return <>
    <div>
      {!view && <Alert variant="destructive"><AlertTitle>Data Name Tag belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
      {view && !view.selected && (
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-center">
          <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
          <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
        </div>
      )}
      {view?.selected && (
        <div aria-label="Pendaftar pada kelompok terpilih" role="region" className="space-y-4">
          <Card role="region" aria-labelledby="pilih-kelompok-okb" className={`${NAME_TAG_CARD} space-y-4 p-5`}>
            <NameTagCardHeader id="pilih-kelompok-okb" step={1} title="Pilih kelompok OKB" />
            <div className="sm:pl-8.5"><NameTagGroupPicker groups={view.groups} selected={view.selected} /></div>
          </Card>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* key: centang, saringan, dan pesan tidak terbawa ke kelompok lain. */}
            <RuangOkbBulkForm key={nameTagGroupKey(view.selected)} members={view.members} rooms={rooms} />
            <div className="space-y-4 lg:sticky lg:top-4">
              <NameTagSummaryPanel members={view.members} />
              {/* key: pesan gagal tidak terbawa ke kelompok lain. */}
              <DownloadNameTagZip key={`zip/${nameTagGroupKey(view.selected)}`} selected={view.selected} members={view.members} />
            </div>
          </div>
        </div>
      )}
    </div>
  </>;
}
