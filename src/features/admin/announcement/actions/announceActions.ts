'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { okbWaveLabel, parseOkbWave } from '@/features/admin/okbWave';
import { announceFail, announceOk, describeAnnounceFailure, type AnnounceRpcResult, type AnnounceState } from '../announceResult';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateAnnouncement(participantId?: string) {
  if (participantId) revalidatePath(`/admin/pendaftar/${participantId}`);
  revalidatePath('/admin/pendaftar');
  revalidatePath('/admin/pengumuman');
  revalidatePath('/admin');
}

/** Umumkan atau tarik Pengumuman Hasil OKB semua Pendaftar yang sudah diputuskan dalam satu Gelombang OKB. */
export async function announceWaveAction(_previous: AnnounceState, formData: FormData): Promise<AnnounceState> {
  if (!await getAdminSession()) return announceFail('Sesi admin tidak valid. Silakan masuk kembali.');
  const wave = parseOkbWave(formData.get('gelombang'));
  const intent = String(formData.get('intent') ?? '');
  if (!wave) return announceFail('Gelombang OKB tidak valid.');
  if (intent !== 'announce' && intent !== 'withdraw') return announceFail('Aksi tidak dikenal.');

  let message: string;
  try {
    const { data, error } = await getSupabaseAdmin().rpc('announce_results', {
      p_pendaftar_id: null,
      p_gelombang: wave,
      p_umumkan: intent === 'announce',
    });
    if (error || !data) throw error ?? new Error('empty result');
    const result = data as AnnounceRpcResult;
    const failure = describeAnnounceFailure(result);
    if (failure || result.status !== 'ok') return failure ?? announceFail('Pengumuman tidak dapat diproses. Silakan coba lagi.');
    const label = okbWaveLabel(wave);
    if (intent === 'withdraw') {
      message = `Pengumuman ${label} ditarik untuk ${result.ditarik ?? 0} pendaftar.`;
    } else {
      const skipped = result.dilewati ? ` ${result.dilewati} pendaftar belum diputuskan dan dilewati.` : '';
      message = (result.diterima ?? 0) + (result.ditolak ?? 0) > 0
        ? `${label} diumumkan: ${result.diterima ?? 0} Diterima dan ${result.ditolak ?? 0} Ditolak.${skipped}`
        : `Tidak ada hasil baru di ${label} untuk diumumkan.${skipped}`;
    }
  } catch {
    return announceFail('Pengumuman tidak dapat diproses. Silakan coba lagi.');
  }

  revalidateAnnouncement();
  return announceOk(message);
}

/** Umumkan atau tarik Pengumuman Hasil OKB seorang Pendaftar Diterima/Ditolak. */
export async function announceParticipantAction(_previous: AnnounceState, formData: FormData): Promise<AnnounceState> {
  if (!await getAdminSession()) return announceFail('Sesi admin tidak valid. Silakan masuk kembali.');
  const participantId = String(formData.get('participantId') ?? '');
  const intent = String(formData.get('intent') ?? '');
  if (!UUID_PATTERN.test(participantId)) return announceFail('Data pendaftar tidak valid.');
  if (intent !== 'announce' && intent !== 'withdraw') return announceFail('Aksi tidak dikenal.');

  try {
    const { data, error } = await getSupabaseAdmin().rpc('announce_results', {
      p_pendaftar_id: participantId,
      p_gelombang: null,
      p_umumkan: intent === 'announce',
    });
    if (error || !data) throw error ?? new Error('empty result');
    const result = data as AnnounceRpcResult;
    const failure = describeAnnounceFailure(result);
    if (failure) return failure;
    const changed = result.status === 'ok' && (result.diterima ?? 0) + (result.ditolak ?? 0) + (result.ditarik ?? 0) > 0;
    if (!changed) return announceFail('Status pengumuman sudah berubah. Muat ulang halaman lalu coba lagi.');
  } catch {
    return announceFail('Pengumuman tidak dapat diproses. Silakan coba lagi.');
  }

  revalidateAnnouncement(participantId);
  return intent === 'announce'
    ? announceOk('Hasil OKB diumumkan. Orang tua sudah dapat melihatnya di halaman Cek Hasil OKB.')
    : announceOk('Pengumuman ditarik. Orang tua kembali melihat "Hasil OKB belum diumumkan".');
}
