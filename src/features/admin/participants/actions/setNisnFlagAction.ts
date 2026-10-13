'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Marks or clears NISN Tidak Sesuai; changing the NISN itself clears it in the database. */
export async function setNisnFlagAction(formData: FormData): Promise<void> {
  if (!await getAdminSession()) throw new Error('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const flagged = formData.get('flagged');
  if (!UUID_PATTERN.test(participantId)) throw new Error('Data pendaftar tidak valid.');
  if (flagged !== 'true' && flagged !== 'false') throw new Error('Penanda NISN tidak valid.');

  const { data, error } = await getSupabaseAdmin()
    .from('pendaftar')
    .update({ nisn_tidak_sesuai: flagged === 'true' })
    .eq('id', participantId)
    .select('id')
    .maybeSingle();

  if (error || !data) throw new Error('Penanda NISN tidak dapat disimpan.');
  revalidatePath(`/admin/pendaftar/${participantId}`);
  revalidatePath('/admin/pendaftar');
  revalidatePath('/admin');
}
