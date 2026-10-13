'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { CLASS_OPTIONS, type ClassOption } from '@/features/registration/classCapacity';
import { updateClassCapacities } from '@/features/registration/server/classCapacityRepository';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { REGISTRATION_CAPACITY } from '@/lib/registrationConfig';

export type SaveClassCapacitiesState = { status: 'idle' | 'success' | 'error'; message: string };

export async function saveClassCapacitiesAction(
  _previous: SaveClassCapacitiesState,
  formData: FormData,
): Promise<SaveClassCapacitiesState> {
  if (!await getAdminSession()) return { status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' };

  const kuota = {} as Record<ClassOption, number>;
  for (const kelas of CLASS_OPTIONS) {
    const raw = String(formData.get(kelas) ?? '').trim();
    const value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value)) {
      return { status: 'error', message: `Kuota ${kelas} harus berupa bilangan bulat 0 atau lebih.` };
    }
    kuota[kelas] = value;
  }

  const total = CLASS_OPTIONS.reduce((sum, kelas) => sum + kuota[kelas], 0);
  if (total !== REGISTRATION_CAPACITY) {
    return { status: 'error', message: `Jumlah kuota harus tepat ${REGISTRATION_CAPACITY} kursi (saat ini ${total}).` };
  }

  try {
    const result = await updateClassCapacities(getSupabaseAdmin(), kuota, REGISTRATION_CAPACITY);
    if (result.status === 'below_used') {
      return { status: 'error', message: `Kuota ${result.pilihanKelas} tidak boleh lebih kecil dari kursi yang sudah terpakai.` };
    }
    if (result.status !== 'ok') {
      return { status: 'error', message: `Jumlah kuota harus tepat ${REGISTRATION_CAPACITY} kursi.` };
    }
  } catch {
    return { status: 'error', message: 'Kuota kelas tidak dapat disimpan. Silakan coba lagi.' };
  }

  revalidatePath('/admin/kuota');
  revalidatePath('/pendaftaran');
  revalidatePath('/');
  return { status: 'success', message: 'Kuota kelas berhasil disimpan.' };
}
