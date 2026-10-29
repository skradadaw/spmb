import { headers } from 'next/headers';
import { getSourceAddress, getSupabaseAdmin, hashRegistrationSource } from '@/features/registration/server/supabaseAdmin';
import { authorizeAcceptanceLetter } from '@/features/announcement/resultCheck';
import { createResultCheckRepository } from '@/features/announcement/server/resultCheckRepository';
import { generateAcceptanceLetter, letterResponse } from '@/features/announcement/server/acceptanceLetterService';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });
}

/**
 * Unduh Surat Penerimaan oleh orang tua. Nomor Pendaftaran dan tanggal lahir dikirim lewat POST
 * (bukan URL) dan diperiksa ulang setiap kali, sehingga surat berhenti tersedia begitu
 * pendaftaran Dibatalkan, keputusan berubah, atau pengumuman ditarik.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('Permintaan tidak valid.', 400);
  }

  try {
    const supabase = getSupabaseAdmin();
    const source = getSourceAddress(await headers() as Headers) ?? 'unknown';
    const authorization = await authorizeAcceptanceLetter(
      { nomorPendaftaran: String(form.get('nomorPendaftaran') ?? ''), tanggalLahir: String(form.get('tanggalLahir') ?? '') },
      hashRegistrationSource(`cek-hasil:${source}`),
      createResultCheckRepository(supabase),
    );
    if (!authorization.allowed) {
      return authorization.view.kind === 'locked'
        ? errorResponse('Terlalu banyak percobaan. Silakan coba lagi nanti.', 429)
        : errorResponse('Surat Penerimaan tidak tersedia. Muat ulang halaman lalu cek kembali hasil Ananda.', 403);
    }
    const letter = await generateAcceptanceLetter(supabase, authorization.nomorPendaftaran, authorization.letter);
    if (!letter) return errorResponse('Surat Penerimaan sedang disiapkan panitia.', 503);
    return letterResponse(letter, PRIVATE_HEADERS);
  } catch {
    console.error('[announcement] acceptance letter download failed');
    return errorResponse('Surat Penerimaan belum dapat dibuat. Silakan coba beberapa saat lagi.', 502);
  }
}
