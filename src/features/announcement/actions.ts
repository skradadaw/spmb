'use server';

import { headers } from 'next/headers';
import { getSourceAddress, getSupabaseAdmin, hashRegistrationSource } from '@/features/registration/server/supabaseAdmin';
import type { ResultCheckState } from './contracts';
import { checkResult } from './resultCheck';
import { createResultCheckRepository } from './server/resultCheckRepository';

export async function checkResultAction(_previous: ResultCheckState, formData: FormData): Promise<ResultCheckState> {
  const nomorPendaftaran = String(formData.get('nomorPendaftaran') ?? '');
  const tanggalLahir = String(formData.get('tanggalLahir') ?? '');
  try {
    // Klien tanpa alamat berbagi satu kunci, sehingga tetap ikut dibatasi.
    const source = getSourceAddress(await headers() as Headers) ?? 'unknown';
    const view = await checkResult({ nomorPendaftaran, tanggalLahir }, hashRegistrationSource(`cek-hasil:${source}`), createResultCheckRepository(getSupabaseAdmin()));
    return { view, nomorPendaftaran, tanggalLahir };
  } catch {
    console.error('[announcement] result check failed');
    return { view: { kind: 'invalid', message: 'Layanan sedang bermasalah. Silakan coba beberapa saat lagi.' }, nomorPendaftaran, tanggalLahir };
  }
}
