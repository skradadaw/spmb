'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { isValidRuangOkb, normalizeRuangOkb, RUANG_OKB_MAX_LENGTH } from '@/features/admin/nameTag/nameTag';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export type RuangOkbActionResult = { status: 'idle' | 'success' | 'error'; message: string };

/** Postgres unique_violation: indeks unik nama tanpa membedakan huruf besar-kecil. */
const UNIQUE_VIOLATION = '23505';
const SESSION_INVALID = 'Sesi admin tidak valid. Silakan masuk kembali.';
const SAVE_FAILED = 'Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.';
const NOT_FOUND = 'Ruang OKB tidak ditemukan. Muat ulang halaman.';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fail = (message: string): RuangOkbActionResult => ({ status: 'error', message });
const success = (message: string): RuangOkbActionResult => ({ status: 'success', message });

/** Semua halaman yang menampilkan nama atau pilihan ruangan. */
function revalidateRuangOkbPages() {
  revalidatePath('/admin/pengaturan/ruang-okb');
  revalidatePath('/admin/okb/name-tag');
  revalidatePath('/admin/pendaftar');
  revalidatePath('/admin/pendaftar/[id]', 'page');
}

function parseNama(raw: string): { nama: string } | { error: string } {
  const nama = normalizeRuangOkb(String(raw ?? ''));
  if (!nama) return { error: 'Nama ruangan wajib diisi.' };
  if (!isValidRuangOkb(nama)) return { error: `Nama ruangan maksimal ${RUANG_OKB_MAX_LENGTH} karakter.` };
  return { nama };
}

export async function createRuangOkbAction(rawNama: string): Promise<RuangOkbActionResult> {
  if (!await getAdminSession()) return fail(SESSION_INVALID);
  const parsed = parseNama(rawNama);
  if ('error' in parsed) return fail(parsed.error);

  try {
    const { error } = await getSupabaseAdmin().from('ruang_okb').insert({ nama: parsed.nama });
    if (error?.code === UNIQUE_VIOLATION) return fail('Nama ruangan sudah ada.');
    if (error) return fail(SAVE_FAILED);
  } catch {
    return fail(SAVE_FAILED);
  }
  revalidateRuangOkbPages();
  return success(`Ruang OKB "${parsed.nama}" ditambahkan.`);
}

/** Pendaftar merujuk ruangan lewat id, jadi nama baru langsung berlaku untuk mereka semua. */
export async function renameRuangOkbAction(id: string, rawNama: string): Promise<RuangOkbActionResult> {
  if (!await getAdminSession()) return fail(SESSION_INVALID);
  if (!UUID_PATTERN.test(String(id ?? ''))) return fail(NOT_FOUND);
  const parsed = parseNama(rawNama);
  if ('error' in parsed) return fail(parsed.error);

  try {
    const { data, error } = await getSupabaseAdmin().from('ruang_okb').update({ nama: parsed.nama }).eq('id', id).select('id');
    if (error?.code === UNIQUE_VIOLATION) return fail('Nama ruangan sudah ada.');
    if (error || !data) return fail(SAVE_FAILED);
    if (data.length === 0) {
      revalidateRuangOkbPages();
      return fail(NOT_FOUND);
    }
  } catch {
    return fail(SAVE_FAILED);
  }
  revalidateRuangOkbPages();
  return success(`Nama ruangan diganti menjadi "${parsed.nama}".`);
}

/** Postgres foreign_key_violation: masih ada Pendaftar yang merujuk ruangan ini (ON DELETE RESTRICT). */
const FOREIGN_KEY_VIOLATION = '23503';
const DELETE_FAILED = 'Ruang OKB tidak dapat dihapus. Periksa koneksi lalu coba lagi.';

/**
 * Langsung mencoba menghapus; database menolak bila ruangan masih dipakai, termasuk oleh Pendaftar
 * yang baru diberi ruangan ini di saat yang sama. Jumlahnya baru dihitung untuk pesan penolakan.
 */
export async function deleteRuangOkbAction(id: string): Promise<RuangOkbActionResult> {
  if (!await getAdminSession()) return fail(SESSION_INVALID);
  if (!UUID_PATTERN.test(String(id ?? ''))) return fail(NOT_FOUND);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('ruang_okb').delete().eq('id', id).select('id');
    if (error?.code === FOREIGN_KEY_VIOLATION) {
      revalidateRuangOkbPages();
      const { count, error: countError } = await supabase.from('pendaftar').select('id', { count: 'exact', head: true }).eq('ruang_okb_id', id);
      return fail(countError || !count
        ? 'Ruangan masih dipakai Pendaftar. Pindahkan mereka ke ruangan lain terlebih dahulu.'
        : `Masih dipakai ${count} Pendaftar. Pindahkan mereka ke ruangan lain terlebih dahulu.`);
    }
    if (error || !data) return fail(DELETE_FAILED);
    if (data.length === 0) {
      revalidateRuangOkbPages();
      return fail(NOT_FOUND);
    }
  } catch {
    return fail(DELETE_FAILED);
  }
  revalidateRuangOkbPages();
  return success('Ruang OKB dihapus.');
}
