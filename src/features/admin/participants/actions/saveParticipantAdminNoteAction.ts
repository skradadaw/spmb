'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveParticipantAdminNoteAction(formData: FormData): Promise<void> {
  if (!await getAdminSession()) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const note = String(formData.get('adminNote') ?? '').trim();
  if (!UUID_PATTERN.test(participantId)) throw new Error('Data peserta tidak valid.');
  if (note.length > 1000) throw new Error('Catatan maksimal 1.000 karakter.');

  const { data, error } = await getSupabaseAdmin()
    .from('pendaftar')
    .update({ catatan_admin: note || null })
    .eq('id', participantId)
    .select('id')
    .maybeSingle();

  if (error || !data) throw new Error('Catatan admin tidak dapat disimpan.');
  revalidatePath(`/admin/pendaftar/${participantId}`);
}
