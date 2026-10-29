import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { createTemplateRepository } from '@/features/announcement/server/templateRepository';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

/** Template Surat Penerimaan yang sedang aktif, untuk diperiksa ulang oleh admin. */
export async function GET() {
  if (!await getAdminSession()) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const repository = createTemplateRepository(getSupabaseAdmin());
    const active = await repository.getActive();
    if (!active) return Response.json({ error: 'Belum ada template aktif.' }, { status: 404, headers: PRIVATE_HEADERS });
    const bytes = await repository.download(active.path);
    return new Response(new Blob([bytes as BlobPart]), {
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="template-surat-penerimaan.pdf"' },
    });
  } catch {
    return Response.json({ error: 'Template belum dapat dibuka.' }, { status: 502, headers: PRIVATE_HEADERS });
  }
}
