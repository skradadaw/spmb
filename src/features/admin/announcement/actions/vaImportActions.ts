'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { normalizeNomorVa } from '@/features/admin/participants/nomorVa';
import { normalizeNomorPendaftaran } from '@/features/announcement/resultCheck';
import { classifyVaImport, type VaImportReport, type VaImportRow } from '../vaImport';
import { readVaImportFile, VaImportFileError } from '../server/vaImportFile';
import { loadVaImportContext } from '../server/vaImportRepository';

// Di bawah batas body Server Action Next.js (1 MB) beserta overhead form.
const MAX_FILE_SIZE = 800_000;
const SESSION_ERROR = 'Sesi admin tidak valid. Silakan masuk kembali.';

export type VaImportPreviewState = { status: 'idle' | 'success' | 'error'; message: string; report?: VaImportReport };
export type VaImportCommitResult = { success: true; saved: number } | { success: false; error: string };

async function classify(rows: VaImportRow[]) {
  const context = await loadVaImportContext(
    getSupabaseAdmin(),
    rows.map(row => normalizeNomorPendaftaran(row.nomorPendaftaran)),
    rows.map(row => normalizeNomorVa(row.nomorVa)),
  );
  return classifyVaImport(rows, context.applicants, context.vaOwners);
}

/** Langkah 1: baca file lalu laporkan setiap baris. Belum ada data yang tersimpan. */
export async function previewVaImportAction(_previous: VaImportPreviewState, formData: FormData): Promise<VaImportPreviewState> {
  if (!await getAdminSession()) return { status: 'error', message: SESSION_ERROR };
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Pilih file Excel atau CSV terlebih dahulu.' };
  if (file.size > MAX_FILE_SIZE) return { status: 'error', message: 'Ukuran file impor maksimal 800 KB.' };

  try {
    const report = await classify(readVaImportFile(file.name, new Uint8Array(await file.arrayBuffer())));
    const ready = report.toSave.length;
    return { status: 'success', message: ready ? `${ready} Nomor VA siap disimpan.` : 'Tidak ada Nomor VA baru yang dapat disimpan dari file ini.', report };
  } catch (error) {
    return { status: 'error', message: error instanceof VaImportFileError ? error.message : 'File tidak dapat diproses. Silakan coba lagi.' };
  }
}

/** Langkah 2: simpan baris "Siap disimpan" setelah dikonfirmasi; diperiksa ulang dan disimpan atomik. */
export async function commitVaImportAction(pairs: Array<{ nomorPendaftaran: string; nomorVa: string }>): Promise<VaImportCommitResult> {
  if (!await getAdminSession()) return { success: false, error: SESSION_ERROR };
  if (!Array.isArray(pairs) || pairs.length === 0 || pairs.length > 1000) return { success: false, error: 'Tidak ada Nomor VA untuk disimpan.' };

  try {
    const rows = pairs.map((pair, index) => ({ line: index + 1, nomorPendaftaran: String(pair?.nomorPendaftaran ?? ''), nomorVa: String(pair?.nomorVa ?? '') }));
    // Data bisa berubah sejak laporan dibuat; semuanya harus masih "Siap disimpan".
    const report = await classify(rows);
    if (report.toSave.length !== rows.length) return { success: false, error: 'Data pendaftar sudah berubah sejak file dibaca. Baca ulang file lalu coba lagi.' };

    const { data, error } = await getSupabaseAdmin().rpc('import_nomor_va', {
      p_pasangan: report.toSave.map(pair => ({ nomor: pair.nomorPendaftaran, va: pair.nomorVa })),
    });
    if (error || !data) throw error ?? new Error('empty result');
    const result = data as { status: string; disimpan?: number };
    if (result.status === 'duplicate') return { success: false, error: 'Ada Nomor VA yang sudah dipakai pendaftar lain. Baca ulang file lalu coba lagi.' };
    if (result.status !== 'ok') return { success: false, error: 'Data pendaftar sudah berubah sejak file dibaca. Baca ulang file lalu coba lagi.' };

    revalidatePath('/admin/pendaftar');
    revalidatePath('/admin/pengumuman');
    return { success: true, saved: result.disimpan ?? report.toSave.length };
  } catch {
    return { success: false, error: 'Nomor VA tidak dapat disimpan. Tidak ada perubahan yang tersimpan.' };
  }
}
