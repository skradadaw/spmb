'use server';

import { revalidatePath } from 'next/cache';
import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { getAdminSession } from '@/features/auth/session';
import { createParticipantsRepository } from '../server/participantsRepository';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** "unverified" removes the review, returning the Berkas to belum diperiksa. */
const REVIEW_STATUSES = new Set(['verified', 'unverified']);

export async function saveDocumentReviewAction(formData: FormData): Promise<void> {
  if (!await getAdminSession()) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const documentId = String(formData.get('documentId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!UUID_PATTERN.test(participantId)) throw new Error('Data pendaftar tidak valid.');
  if (!DOCUMENT_DEFINITIONS.some(document => document.id === documentId)) throw new Error('Jenis dokumen tidak valid.');
  if (!REVIEW_STATUSES.has(status)) throw new Error('Status pemeriksaan tidak valid.');

  const supabase = getSupabaseAdmin();
  const participant = await createParticipantsRepository(supabase).getDocumentRow(participantId);
  const definition = DOCUMENT_DEFINITIONS.find(document => document.id === documentId as RegistrationDocumentId);
  if (!participant || !definition || typeof participant[definition.dbColumn] !== 'string') {
    throw new Error('Berkas tidak ditemukan atau belum diunggah.');
  }

  if (status === 'unverified') {
    // Undoing a verification never moves the applicant's status back (see CONTEXT.md: Berkas).
    const { error } = await supabase.from('verifikasi_dokumen').delete().eq('pendaftar_id', participantId).eq('dokumen_id', documentId);
    if (error) throw new Error('Verifikasi tidak dapat dibatalkan.');
    revalidatePath(`/admin/pendaftar/${participantId}`);
    return;
  }

  const { error } = await supabase.from('verifikasi_dokumen').upsert({
    pendaftar_id: participantId,
    dokumen_id: documentId,
    status,
    catatan: null,
    diperiksa_oleh: 'Admin',
    diperiksa_pada: new Date().toISOString(),
  }, { onConflict: 'pendaftar_id,dokumen_id' });
  if (error) throw new Error('Status verifikasi tidak dapat disimpan.');

  const allDocumentsUploaded = DOCUMENT_DEFINITIONS.every(document => typeof participant[document.dbColumn] === 'string' && (participant[document.dbColumn] as string).trim().length > 0);
  if (allDocumentsUploaded) {
    const { data: reviews, error: reviewError } = await supabase.from('verifikasi_dokumen').select('dokumen_id,status').eq('pendaftar_id', participantId);
    if (reviewError || !reviews) throw new Error('Status verifikasi dokumen tidak dapat diperiksa.');
    const verifiedIds = new Set(reviews.filter(review => review.status === 'verified').map(review => review.dokumen_id));
    const allDocumentsVerified = DOCUMENT_DEFINITIONS.every(document => verifiedIds.has(document.id));
    if (allDocumentsVerified) {
      const { error: statusError } = await supabase.from('pendaftar').update({ status: 'Terverifikasi' }).eq('id', participantId).eq('status', 'Menunggu Verifikasi');
      if (statusError) throw new Error('Status pendaftar tidak dapat diperbarui.');
      revalidatePath('/admin/pendaftar');
    }
  }

  revalidatePath(`/admin/pendaftar/${participantId}`);
}
