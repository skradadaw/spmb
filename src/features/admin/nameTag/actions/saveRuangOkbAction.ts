'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { RUANG_OKB_STATUSES } from '../nameTag';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Postgres foreign_key_violation: ruangan tidak ada di daftar, misalnya baru saja dihapus. */
const FOREIGN_KEY_VIOLATION = '23503';

/** updated: jumlah Pendaftar yang berhasil diubah. Status error dengan updated > 0 berarti sebagian Pendaftar statusnya sudah berubah. */
export type SaveRuangOkbResult = { status: 'idle' | 'success' | 'error'; message: string; updated: number };

const fail = (message: string, updated = 0): SaveRuangOkbResult => ({ status: 'error', message, updated });
const ROOM_NOT_FOUND = 'Ruang OKB tidak ditemukan. Muat ulang halaman lalu pilih lagi.';

function revalidateRuangOkbPages() {
  revalidatePath('/admin/pendaftar');
  revalidatePath('/admin/pendaftar/[id]', 'page');
  revalidatePath('/admin/okb/name-tag');
}

/** Menetapkan satu ruangan dari daftar Ruang OKB, atau mengosongkannya (id kosong), untuk satu atau banyak Pendaftar. */
export async function saveRuangOkbAction(applicantIds: string[], rawRuangOkbId: string): Promise<SaveRuangOkbResult> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');

  const ids = [...new Set(applicantIds)];
  if (ids.length === 0) return fail('Pilih Pendaftar terlebih dahulu.');
  if (!ids.every(id => UUID_PATTERN.test(id))) return fail('Data pendaftar tidak valid.');

  const ruangOkbId = String(rawRuangOkbId ?? '').trim();
  if (ruangOkbId && !UUID_PATTERN.test(ruangOkbId)) return fail(ROOM_NOT_FOUND);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('pendaftar')
      .update({ ruang_okb_id: ruangOkbId || null })
      .in('id', ids)
      .in('status', RUANG_OKB_STATUSES)
      .select('id');
    if (error?.code === FOREIGN_KEY_VIOLATION) {
      revalidateRuangOkbPages();
      return fail(ROOM_NOT_FOUND);
    }
    if (error || !data) return fail('Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.');

    // Juga saat ada status yang sudah berubah, agar admin melihat data terbaru.
    revalidateRuangOkbPages();

    const updated = data.length;
    if (updated === 0) return fail('Status pendaftar sudah berubah. Ruang OKB tidak disimpan.');
    const verb = ruangOkbId ? 'disimpan' : 'dikosongkan';
    if (updated < ids.length) return fail(`Ruang OKB ${verb} untuk ${updated} dari ${ids.length} Pendaftar. Status ${ids.length - updated} Pendaftar lainnya sudah berubah.`, updated);
    return { status: 'success', message: `Ruang OKB ${verb} untuk ${updated} Pendaftar.`, updated };
  } catch {
    return fail('Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.');
  }
}
