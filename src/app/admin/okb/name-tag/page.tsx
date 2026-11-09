import { CalendarDays } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DownloadNameTagZip } from '@/features/admin/nameTag/components/DownloadNameTagZip';
import { NameTagGroupPicker } from '@/features/admin/nameTag/components/NameTagGroupPicker';
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
    <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
      Pilih tanggal dan Gelombang OKB, lalu centang Pendaftar untuk mengisi Ruang OKB mereka sekaligus. Name Tag diunduh untuk semua Pendaftar yang sudah punya Ruang OKB.
    </p>
    <div className="mt-4">
      {!view && <Alert variant="destructive"><AlertTitle>Data Name Tag belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
      {view && !view.selected && (
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-center">
          <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
          <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
        </div>
      )}
      {view?.selected && (
        <section aria-label="Pendaftar pada kelompok terpilih" className="space-y-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm">
          <NameTagGroupPicker groups={view.groups} selected={view.selected} />
          {/* key: pesan gagal, centang, dan isian tidak terbawa ke kelompok lain. */}
          <DownloadNameTagZip key={`zip/${nameTagGroupKey(view.selected)}`} selected={view.selected} members={view.members} />
          <RuangOkbBulkForm key={nameTagGroupKey(view.selected)} members={view.members} rooms={rooms} />
        </section>
      )}
    </div>
  </>;
}
