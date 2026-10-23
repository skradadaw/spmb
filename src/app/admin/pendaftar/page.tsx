import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ParticipantExportDialog } from '@/features/admin/participants/components/ParticipantExportDialog';
import { ParticipantFilters } from '@/features/admin/participants/components/ParticipantFilters';
import { ParticipantList } from '@/features/admin/participants/components/ParticipantList';
import { PARTICIPANT_FILTER_STATUSES, type ParticipantListResult } from '@/features/admin/participants/contracts';
import { PARTICIPANT_EXPORT_STATUSES } from '@/features/admin/participants/exportRequest';
import { parseParticipantListQuery } from '@/features/admin/participants/query';
import { createParticipantsRepository } from '@/features/admin/participants/server/participantsRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ParticipantsPage({ searchParams }: Props) {
  if (!await getAdminSession()) redirect('/login');

  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') params.set(key, value);
  }

  // Status options are the fixed lifecycle (see CONTEXT.md), so no table scan is needed to build the filter.
  const query = parseParticipantListQuery(params);
  const load = async <T,>(read: (repository: ReturnType<typeof createParticipantsRepository>) => Promise<T>) => {
    try { return await read(createParticipantsRepository(getSupabaseAdmin())); } catch { return null; }
  };
  // Jumlah per status hanya pelengkap modal ekspor; bila gagal, ekspor tetap bisa dipakai tanpa angka.
  const [result, exportCounts] = await Promise.all([
    load((repository): Promise<ParticipantListResult> => repository.list(query)),
    load(repository => repository.countByStatus(PARTICIPANT_EXPORT_STATUSES)),
  ]);

  return <>
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
        <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Data Pendaftar</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">Cari pendaftar, lalu buka detailnya untuk memeriksa berkas dan mengatur jadwal OKB.</p>
      </div>
      <ParticipantExportDialog counts={exportCounts} />
    </section>
    <div className="mt-6">
      {result ? <>
        <ParticipantFilters query={query} statuses={PARTICIPANT_FILTER_STATUSES} />
        <ParticipantList result={result} query={query} />
      </> : <Alert variant="destructive"><AlertTitle>Data pendaftar belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
    </div>
  </>;
}
