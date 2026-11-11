import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getAdminSession } from '@/features/auth/session';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

/**
 * Contoh template Surat Penerimaan: tata letak yang posisinya diukur sistem, dengan baris nomor surat,
 * nama anak, dan Nomor VA dikosongkan. Admin mengunduhnya sebagai acuan menyusun template sekolah.
 */
export async function GET() {
  if (!await getAdminSession()) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const bytes = await readFile(join(process.cwd(), 'docs', 'templates', 'surat-penerimaan.pdf'));
    return new Response(new Blob([bytes as BlobPart]), {
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="contoh-template-surat-penerimaan.pdf"' },
    });
  } catch {
    return Response.json({ error: 'Contoh template belum dapat diunduh.' }, { status: 502, headers: PRIVATE_HEADERS });
  }
}
