import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { buildAcceptanceLetter, PREVIEW_SAMPLES, type PreviewSample } from '@/features/announcement/acceptanceLetter';
import { createTemplateRepository, isTemplatePath } from '@/features/announcement/server/templateRepository';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });
}

/** Pratinjau template (yang baru diunggah atau yang aktif) yang diisi data contoh. */
export async function GET(request: Request) {
  if (!await getAdminSession()) return errorResponse('Sesi admin diperlukan.', 401);

  const searchParams = new URL(request.url).searchParams;
  const sample = searchParams.get('contoh') ?? 'biasa';
  if (!(sample in PREVIEW_SAMPLES)) return errorResponse('Data contoh tidak dikenal.', 400);

  try {
    const repository = createTemplateRepository(getSupabaseAdmin());
    const path = searchParams.get('path') ?? (await repository.getActive())?.path;
    if (!path || !isTemplatePath(path)) return errorResponse('Template tidak ditemukan.', 404);
    const letter = await buildAcceptanceLetter(await repository.download(path), PREVIEW_SAMPLES[sample as PreviewSample]);
    return new Response(new Blob([letter as BlobPart]), {
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="pratinjau-surat-penerimaan-${sample}.pdf"` },
    });
  } catch {
    return errorResponse('Pratinjau belum dapat dibuat.', 502);
  }
}
