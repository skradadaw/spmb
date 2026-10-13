import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ParticipantFilters } from '@/features/admin/participants/components/ParticipantFilters';
import { ParticipantList } from '@/features/admin/participants/components/ParticipantList';
import { PARTICIPANT_DEFAULT_STATUSES, type ParticipantListResult } from '@/features/admin/participants/contracts';
import { parseParticipantListQuery, participantListHref } from '@/features/admin/participants/query';
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
  let result: ParticipantListResult | null = null;
  try {
    result = await createParticipantsRepository(getSupabaseAdmin()).list(query);
  } catch {
    result = null;
  }

  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Data Peserta</h1>
      <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">Cari dan lihat data peserta yang sudah masuk ke sistem pendaftaran.</p>
    </section>
    <div className="mt-6">
      {result ? <>
        {/* Keyed by the active query so client-side navigation (e.g. Reset) remounts the uncontrolled inputs. */}
        <ParticipantFilters key={participantListHref(query)} query={query} statuses={PARTICIPANT_DEFAULT_STATUSES} />
        <ParticipantList result={result} query={query} />
      </> : <Alert variant="destructive"><AlertTitle>Data peserta belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>}
    </div>
  </>;
}
