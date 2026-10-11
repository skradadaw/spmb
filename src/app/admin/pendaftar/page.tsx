import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminShell } from '@/features/admin/components/AdminShell';
import { ParticipantFilters } from '@/features/admin/participants/components/ParticipantFilters';
import { ParticipantList } from '@/features/admin/participants/components/ParticipantList';
import { PARTICIPANT_DEFAULT_STATUSES, PARTICIPANT_PAGE_SIZE, type ParticipantListResult } from '@/features/admin/participants/contracts';
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

  let statuses: string[] = [...PARTICIPANT_DEFAULT_STATUSES];
  let statusOptionsUnavailable = false;
  let query = parseParticipantListQuery(params, statuses);
  let result: ParticipantListResult = { items: [], page: 1, pageSize: PARTICIPANT_PAGE_SIZE, total: 0, totalPages: 1 };
  let listUnavailable = false;

  try {
    const repository = createParticipantsRepository(getSupabaseAdmin());
    try {
      const actualStatuses = await repository.getStatuses();
      if (actualStatuses.length) statuses = actualStatuses;
    } catch {
      statusOptionsUnavailable = true;
      const requestedStatus = params.get('status')?.trim().slice(0, 50);
      if (requestedStatus && !statuses.includes(requestedStatus)) statuses.push(requestedStatus);
    }
    query = parseParticipantListQuery(params, statuses);
    result = await repository.list(query);
  } catch {
    listUnavailable = true;
  }

  return <AdminShell active="participants">
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Data Peserta</h1>
      <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">Cari dan lihat data peserta yang sudah masuk ke sistem pendaftaran.</p>
    </section>
    <div className="mt-6">
      {listUnavailable ? <Alert variant="destructive"><AlertTitle>Data peserta belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert> : <>
        {statusOptionsUnavailable && <Alert className="mb-4"><AlertTitle>Opsi status sementara belum tersedia</AlertTitle><AlertDescription>Daftar peserta tetap dimuat; filter status memakai pilihan standar.</AlertDescription></Alert>}
        <ParticipantFilters query={query} statuses={statuses} />
        <ParticipantList result={result} query={query} />
      </>}
    </div>
  </AdminShell>;
}