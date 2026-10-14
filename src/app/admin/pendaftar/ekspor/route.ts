import { participantExportXlsx } from '@/features/admin/participants/export';
import { parseExportStatuses, participantExportFilename } from '@/features/admin/participants/exportRequest';
import { createParticipantsRepository } from '@/features/admin/participants/server/participantsRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

export async function GET(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401, headers: PRIVATE_HEADERS });
  const statuses = parseExportStatuses(new URL(request.url).searchParams);
  if (!statuses) return Response.json({ error: 'Status ekspor tidak dikenal.' }, { status: 400, headers: PRIVATE_HEADERS });
  try {
    const items = await createParticipantsRepository(getSupabaseAdmin()).exportDetails(statuses);
    const filename = participantExportFilename(statuses, new Date().toISOString().slice(0, 10));
    return new Response(await participantExportXlsx(items), { status: 200, headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${filename}"` } });
  } catch {
    return Response.json({ error: 'Data pendaftar belum dapat diekspor.' }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
