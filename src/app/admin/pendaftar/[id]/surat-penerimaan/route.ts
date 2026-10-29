import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { findAdminLetterData, generateAcceptanceLetter, letterResponse } from '@/features/announcement/server/acceptanceLetterService';

export const dynamic = 'force-dynamic';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

type Context = { params: Promise<{ id: string }> };

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });
}

/** Surat Penerimaan seorang Pendaftar Diterima untuk admin, termasuk sebelum diumumkan agar dapat diperiksa. */
export async function GET(_request: Request, { params }: Context) {
  if (!await getAdminSession()) return errorResponse('Sesi admin diperlukan.', 401);
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return errorResponse('Pendaftar tidak ditemukan.', 404);

  try {
    const supabase = getSupabaseAdmin();
    const data = await findAdminLetterData(supabase, id);
    if (!data) return errorResponse('Surat Penerimaan hanya tersedia untuk pendaftar Diterima yang Nomor VA-nya sudah diisi.', 404);
    const letter = await generateAcceptanceLetter(supabase, data.nomorPendaftaran, data.letter);
    if (!letter) return errorResponse('Belum ada template Surat Penerimaan yang aktif.', 409);
    return letterResponse(letter, PRIVATE_HEADERS);
  } catch {
    return errorResponse('Surat Penerimaan belum dapat dibuat.', 502);
  }
}
