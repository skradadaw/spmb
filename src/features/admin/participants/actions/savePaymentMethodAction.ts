'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { isPaymentMethod } from '../contracts';
import { saveDocumentReviewAction } from './saveDocumentReviewAction';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records Metode Pembayaran OKB (Cash or Transfer) read from the Bukti Pembayaran OKB. Choosing it is
 * how the admin verifies that Berkas, so an unverified one is verified in the same step.
 */
export async function savePaymentMethodAction(formData: FormData): Promise<void> {
  if (!await getAdminSession()) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const method = formData.get('method');
  if (!UUID_PATTERN.test(participantId)) throw new Error('Data pendaftar tidak valid.');
  if (!isPaymentMethod(method)) throw new Error('Metode pembayaran tidak valid.');

  const { data, error } = await getSupabaseAdmin()
    .from('pendaftar')
    .update({ metode_pembayaran_okb: method })
    .eq('id', participantId)
    .select('id')
    .maybeSingle();

  if (error || !data) throw new Error('Metode pembayaran tidak dapat disimpan.');

  if (formData.get('verify') === 'true') {
    const review = new FormData();
    review.set('participantId', participantId);
    review.set('documentId', 'buktiPembayaran');
    review.set('status', 'verified');
    await saveDocumentReviewAction(review);
  }
  revalidatePath(`/admin/pendaftar/${participantId}`);
}
