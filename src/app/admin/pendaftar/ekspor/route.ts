import { participantExportXlsx } from '@/features/admin/participants/export';
import { parseParticipantListQuery } from '@/features/admin/participants/query';
import { createParticipantsRepository } from '@/features/admin/participants/server/participantsRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

export async function GET(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const params = new URL(request.url).searchParams;
    const repository = createParticipantsRepository(getSupabaseAdmin());
    const query = parseParticipantListQuery(params);
    const items = await repository.exportDetails(query);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(await participantExportXlsx(items), { status: 200, headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="data-pendaftar-${date}.xlsx"` } });
  } catch {
    return Response.json({ error: 'Data pendaftar belum dapat diekspor.' }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
