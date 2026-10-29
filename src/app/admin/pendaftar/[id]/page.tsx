import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ParticipantDetail } from '@/features/admin/participants/components/ParticipantDetail';
import { createParticipantsRepository } from '@/features/admin/participants/server/participantsRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { PARTICIPANT_DEFAULT_STATUSES } from '@/features/admin/participants/contracts';
import { parseParticipantListQuery, participantListHref } from '@/features/admin/participants/query';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ParticipantPage({ params, searchParams }: Props) {
  if (!await getAdminSession()) redirect('/login');

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const rawSearchParams = await searchParams;
  const listParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === 'string') listParams.set(key, value);
  }
  const requestedStatus = listParams.get('status')?.trim().slice(0, 50);
  const backStatuses = requestedStatus ? [...new Set([...PARTICIPANT_DEFAULT_STATUSES, requestedStatus])] : undefined;
  const backHref = participantListHref(parseParticipantListQuery(listParams, backStatuses));

  let participant;
  try {
    participant = await createParticipantsRepository(getSupabaseAdmin()).getById(id);
  } catch {
    return <Alert variant="destructive"><AlertTitle>Detail pendaftar belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau kembali ke daftar pendaftar.</AlertDescription></Alert>;
  }

  if (!participant) notFound();

  // Alamat situs yang sedang dibuka admin, untuk tautan Cek Hasil OKB di pesan WhatsApp.
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  const siteOrigin = host ? `${protocol}://${host}` : undefined;

  return <ParticipantDetail participant={participant} backHref={backHref} siteOrigin={siteOrigin} />;
}
