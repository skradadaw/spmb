'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { isValidRuangOkb, normalizeRuangOkb, RUANG_OKB_MAX_LENGTH, RUANG_OKB_STATUSES } from '../nameTag';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** updated: jumlah Pendaftar yang berhasil diubah. Status error dengan updated > 0 berarti sebagian Pendaftar statusnya sudah berubah. */
export type SaveRuangOkbResult = { status: 'idle' | 'success' | 'error'; message: string; updated: number };

const fail = (message: string, updated = 0): SaveRuangOkbResult => ({ status: 'error', message, updated });

/** Mengisi, mengubah, atau mengosongkan (nama kosong) Ruang OKB satu atau banyak Pendaftar. */
export async function saveRuangOkbAction(applicantIds: string[], rawRuang: string): Promise<SaveRuangOkbResult> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');

  const ids = [...new Set(applicantIds)];
  if (ids.length === 0) return fail('Pilih Pendaftar terlebih dahulu.');
  if (!ids.every(id => UUID_PATTERN.test(id))) return fail('Data pendaftar tidak valid.');

  const ruang = normalizeRuangOkb(String(rawRuang ?? ''));
  if (!isValidRuangOkb(ruang)) return fail(`Nama ruangan maksimal ${RUANG_OKB_MAX_LENGTH} karakter.`);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('pendaftar')
      .update({ ruang_okb: ruang || null })
      .in('id', ids)
      .in('status', RUANG_OKB_STATUSES)
      .select('id');
    if (error || !data) return fail('Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.');

    // Juga saat ada status yang sudah berubah, agar admin melihat data terbaru.
    revalidatePath('/admin/pendaftar');
    revalidatePath('/admin/pendaftar/[id]', 'page');
    revalidatePath('/admin/okb/name-tag');

    const updated = data.length;
    if (updated === 0) return fail('Status pendaftar sudah berubah. Ruang OKB tidak disimpan.');
    const verb = ruang ? 'disimpan' : 'dikosongkan';
    if (updated < ids.length) return fail(`Ruang OKB ${verb} untuk ${updated} dari ${ids.length} Pendaftar. Status ${ids.length - updated} Pendaftar lainnya sudah berubah.`, updated);
    return { status: 'success', message: `Ruang OKB ${verb} untuk ${updated} Pendaftar.`, updated };
  } catch {
    return fail('Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.');
  }
}
