'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { updateTotalCapacity } from '@/features/registration/server/classCapacityRepository';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export type SaveClassCapacitiesState = { status: 'idle' | 'success' | 'error'; message: string };

export async function saveClassCapacitiesAction(
  _previous: SaveClassCapacitiesState,
  formData: FormData,
): Promise<SaveClassCapacitiesState> {
  if (!await getAdminSession()) return { status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' };

  const raw = String(formData.get('kapasitasTotal') ?? formData.get('total') ?? '').trim();
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value <= 0) {
    return { status: 'error', message: 'Kapasitas total harus berupa bilangan bulat lebih dari 0.' };
  }

  try {
    const result = await updateTotalCapacity(getSupabaseAdmin(), value);
    if (result.status === 'below_used') {
      return { status: 'error', message: 'Kapasitas total tidak boleh lebih kecil dari kursi yang sudah terpakai.' };
    }
    if (result.status !== 'ok') {
      return { status: 'error', message: 'Kapasitas total tidak valid.' };
    }
  } catch {
    return { status: 'error', message: 'Kapasitas tidak dapat disimpan. Silakan coba lagi.' };
  }

  revalidatePath('/admin/pengaturan/kuota');
  revalidatePath('/admin/pendaftar');
  revalidatePath('/pendaftaran');
  revalidatePath('/');
  return { status: 'success', message: 'Kapasitas berhasil disimpan.' };
}
