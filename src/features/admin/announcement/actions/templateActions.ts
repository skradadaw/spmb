'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { AcceptanceTemplateError, loadAcceptanceTemplate } from '@/features/announcement/acceptanceLetter';
import { createTemplateRepository, isTemplatePath, newTemplatePath, TEMPLATE_MAX_FILE_SIZE } from '@/features/announcement/server/templateRepository';

type Failure = { success: false; error: string };
export type PrepareTemplateResult = { success: true; path: string; token: string } | Failure;
export type TemplateResult = { success: true } | Failure;

const fail = (error: string): Failure => ({ success: false, error });
const SESSION_ERROR = 'Sesi admin tidak valid. Silakan masuk kembali.';
const INVALID_PATH = 'Template tidak valid.';

/** Langkah 1: URL unggah bertanda tangan untuk template baru; template aktif belum berubah. */
export async function prepareTemplateUploadAction(file: { size: number; type: string }): Promise<PrepareTemplateResult> {
  if (!await getAdminSession()) return fail(SESSION_ERROR);
  if (file.type !== 'application/pdf') return fail('Template harus berupa file PDF.');
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > TEMPLATE_MAX_FILE_SIZE) return fail('Ukuran template maksimal 5 MB.');
  try {
    const path = newTemplatePath();
    return { success: true, path, token: await createTemplateRepository(getSupabaseAdmin()).createUploadToken(path) };
  } catch {
    return fail('Unggahan tidak dapat disiapkan. Silakan coba lagi.');
  }
}

/** Langkah 2: memastikan file yang terunggah adalah PDF 2 halaman sebelum pratinjau ditampilkan. */
export async function checkTemplateAction(path: string): Promise<TemplateResult> {
  if (!await getAdminSession()) return fail(SESSION_ERROR);
  if (!isTemplatePath(path)) return fail(INVALID_PATH);
  const repository = createTemplateRepository(getSupabaseAdmin());
  try {
    await loadAcceptanceTemplate(await repository.download(path));
    return { success: true };
  } catch (error) {
    await repository.remove(path).catch(() => console.error('[admin:template] invalid upload cleanup failed'));
    return fail(error instanceof AcceptanceTemplateError ? error.message : 'Template tidak dapat dibaca. Silakan unggah ulang.');
  }
}

/** Langkah 3: setelah admin memeriksa pratinjau, template baru menggantikan template aktif. */
export async function activateTemplateAction(path: string): Promise<TemplateResult> {
  if (!await getAdminSession()) return fail(SESSION_ERROR);
  if (!isTemplatePath(path)) return fail(INVALID_PATH);
  const repository = createTemplateRepository(getSupabaseAdmin());
  try {
    await loadAcceptanceTemplate(await repository.download(path));
    const previous = await repository.activate(path);
    if (previous && isTemplatePath(previous)) {
      await repository.remove(previous).catch(() => console.error('[admin:template] old template cleanup failed'));
    }
  } catch (error) {
    return fail(error instanceof AcceptanceTemplateError ? error.message : 'Template tidak dapat diaktifkan. Silakan coba lagi.');
  }
  revalidatePath('/admin/pengumuman');
  return { success: true };
}

/** Membuang unggahan yang batal diaktifkan; template aktif tidak pernah ikut terhapus. */
export async function discardTemplateAction(path: string): Promise<TemplateResult> {
  if (!await getAdminSession()) return fail(SESSION_ERROR);
  if (!isTemplatePath(path)) return fail(INVALID_PATH);
  const repository = createTemplateRepository(getSupabaseAdmin());
  try {
    if ((await repository.getActive())?.path === path) return fail('Template aktif tidak dapat dibuang.');
    await repository.remove(path);
    return { success: true };
  } catch {
    return fail('Unggahan tidak dapat dibuang. Silakan coba lagi.');
  }
}
