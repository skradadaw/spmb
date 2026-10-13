'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';
import { getTrustedDocumentType, validateStoredDocument } from '@/features/registration/server/documentValidation';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { isReplacementDocumentPath, isSafeDocumentPath, replacementDocumentPath } from '../server/participantDocumentService';

const BUCKET = 'dokumen_pendaftaran';
const MAX_FILE_SIZE = 5_242_880;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Failure = { success: false; error: string };
export type PrepareReplacementResult = { success: true; path: string; token: string } | Failure;
export type CommitReplacementResult = { success: true } | Failure;

const fail = (error: string): Failure => ({ success: false, error });

function definitionOf(documentId: string) {
  return DOCUMENT_DEFINITIONS.find(({ id }) => id === documentId);
}

async function loadDocumentRow(participantId: string, column: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('pendaftar')
    .select(`id,submission_id,${column}`)
    .eq('id', participantId)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

/** Step 1: issue a signed upload URL for a new, versioned path; nothing in the row changes yet. */
export async function prepareDocumentReplacementAction(
  participantId: string,
  documentId: RegistrationDocumentId,
  file: { size: number; type: string },
): Promise<PrepareReplacementResult> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');
  const definition = definitionOf(documentId);
  if (!UUID_PATTERN.test(participantId) || !definition) return fail('Data berkas tidak valid.');
  const fileType = getTrustedDocumentType(file.type);
  if (!fileType) return fail('Format berkas harus PDF, JPG, PNG, atau WebP.');
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_FILE_SIZE) return fail('Ukuran berkas maksimal 5 MB.');

  try {
    const row = await loadDocumentRow(participantId, definition.dbColumn);
    if (!row) return fail('Pendaftar tidak ditemukan.');
    if (typeof row.submission_id !== 'string') return fail('Berkas pendaftar ini tidak dapat diganti dari sistem.');

    const path = replacementDocumentPath(row.submission_id, documentId, fileType.extension);
    const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data?.token) throw error ?? new Error('missing token');
    return { success: true, path, token: data.token };
  } catch {
    return fail('Unggahan tidak dapat disiapkan. Silakan coba lagi.');
  }
}

/** Step 2: validate the uploaded file, point the row at it, reset its review, then delete the old file. */
export async function commitDocumentReplacementAction(
  participantId: string,
  documentId: RegistrationDocumentId,
  path: string,
): Promise<CommitReplacementResult> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');
  const definition = definitionOf(documentId);
  if (!UUID_PATTERN.test(participantId) || !definition) return fail('Data berkas tidak valid.');

  const supabase = getSupabaseAdmin();
  const storage = supabase.storage.from(BUCKET);
  try {
    const row = await loadDocumentRow(participantId, definition.dbColumn);
    if (!row) return fail('Pendaftar tidak ditemukan.');
    const submissionId = typeof row.submission_id === 'string' ? row.submission_id : undefined;
    const oldPath = typeof row[definition.dbColumn] === 'string' ? row[definition.dbColumn] as string : null;
    if (!submissionId || !isReplacementDocumentPath(path, submissionId, documentId) || path === oldPath) {
      return fail('Data berkas tidak valid.');
    }

    const { data: blob, error: downloadError } = await storage.download(path);
    if (downloadError || !blob || !await validateStoredDocument(blob)) {
      await storage.remove([path]);
      return fail(`${definition.title} tidak valid. Pastikan berkas PDF, JPG, PNG, atau WebP yang tidak rusak, maksimal 5 MB.`);
    }

    const { error: updateError } = await supabase.from('pendaftar').update({ [definition.dbColumn]: path }).eq('id', participantId);
    if (updateError) {
      await storage.remove([path]);
      throw updateError;
    }

    // The replacement starts unreviewed; the applicant's own status is left as is.
    const { error: reviewError } = await supabase.from('verifikasi_dokumen').delete().eq('pendaftar_id', participantId).eq('dokumen_id', documentId);
    if (reviewError) console.error(`[admin:${participantId}] review reset failed`);

    if (oldPath && isSafeDocumentPath(oldPath, submissionId, documentId)) {
      const { error: removeError } = await storage.remove([oldPath]);
      if (removeError) console.error(`[admin:${participantId}] old document cleanup failed`);
    }
  } catch {
    return fail('Berkas pengganti tidak dapat disimpan. Silakan coba lagi.');
  }

  revalidatePath(`/admin/pendaftar/${participantId}`);
  return { success: true };
}
