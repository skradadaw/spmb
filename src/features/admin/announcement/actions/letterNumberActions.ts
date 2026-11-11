'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { parseLetterNumberSettings } from '@/features/announcement/letterNumber';
import { createLetterNumberRepository } from '@/features/announcement/server/letterNumberRepository';

export type LetterNumberState = { status: 'idle' | 'success' | 'error'; message: string };

const fail = (message: string): LetterNumberState => ({ status: 'error', message });

/** Menyimpan format nomor surat dan nomor urut awal; nomor yang sudah diberikan ke Pendaftar tidak berubah. */
export async function saveLetterNumberAction(_previous: LetterNumberState, formData: FormData): Promise<LetterNumberState> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');
  const parsed = parseLetterNumberSettings({ format: String(formData.get('format') ?? ''), nomorAwal: String(formData.get('nomorAwal') ?? '') });
  if (!parsed.ok) return fail(parsed.error);
  try {
    await createLetterNumberRepository(getSupabaseAdmin()).save(parsed.settings);
  } catch {
    return fail('Nomor surat tidak dapat disimpan. Silakan coba lagi.');
  }
  revalidatePath('/admin/okb/pengumuman');
  return { status: 'success', message: 'Nomor surat tersimpan.' };
}
