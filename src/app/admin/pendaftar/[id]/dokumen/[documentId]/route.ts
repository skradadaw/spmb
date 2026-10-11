import { getAdminSession } from '@/features/auth/session';
import { createParticipantsRepository } from '@/features/admin/participants/server/participantsRepository';
import { createParticipantDocumentUrl } from '@/features/admin/participants/server/participantDocumentService';
import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DOCUMENT_IDS = new Set<string>(DOCUMENT_DEFINITIONS.map(document => document.id));
const MIME_TYPES: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

type Context = { params: Promise<{ id: string; documentId: string }> };

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: Request, { params }: Context) {
  if (!await getAdminSession()) return errorResponse('Sesi admin diperlukan.', 401);

  const { id, documentId } = await params;
  if (!UUID_PATTERN.test(id) || !DOCUMENT_IDS.has(documentId)) return errorResponse('Dokumen tidak ditemukan.', 404);

  try {
    const supabase = getSupabaseAdmin();
    const document = await createParticipantDocumentUrl(
      id,
      documentId as RegistrationDocumentId,
      createParticipantsRepository(supabase),
      { createSignedUrl: async (path, expiresIn) => supabase.storage.from('dokumen_pendaftaran').createSignedUrl(path, expiresIn) },
    );
    if (!document) return errorResponse('Dokumen tidak ditemukan.', 404);

    const upstream = await fetch(document.signedUrl, { cache: 'no-store', redirect: 'error' });
    if (!upstream.ok || !upstream.body) return errorResponse('Dokumen peserta belum dapat dibuka.', 502);

    const extension = document.path.match(/\.(pdf|jpg|png|webp)$/i)?.[1]?.toLowerCase();
    if (!extension || !MIME_TYPES[extension]) return errorResponse('Dokumen tidak ditemukan.', 404);

    const download = new URL(request.url).searchParams.get('download') === '1';
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': MIME_TYPES[extension],
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${id}-${documentId}.${extension}"`,
      },
    });
  } catch {
    return errorResponse('Dokumen peserta belum dapat dibuka.', 502);
  }
}
