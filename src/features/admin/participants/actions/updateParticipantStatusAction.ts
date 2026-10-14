'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { CLASS_OPTIONS } from '@/features/registration/classCapacity';
import { parseOkbWave } from '@/features/admin/okbWave';
import { CANCELLABLE_STATUSES } from '../contracts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ParticipantStatusIntent = 'schedule' | 'unschedule' | 'attend' | 'decide' | 'cancel' | 'restore';
export type UpdateParticipantStatusState = { status: 'idle' | 'success' | 'error'; message: string };

const ok = (message: string): UpdateParticipantStatusState => ({ status: 'success', message });
const fail = (message: string): UpdateParticipantStatusState => ({ status: 'error', message });
const STALE = 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.';

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export async function updateParticipantStatusAction(
  _previous: UpdateParticipantStatusState,
  formData: FormData,
): Promise<UpdateParticipantStatusState> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const intent = String(formData.get('intent') ?? '') as ParticipantStatusIntent;
  if (!UUID_PATTERN.test(participantId)) return fail('Data pendaftar tidak valid.');

  const supabase = getSupabaseAdmin();
  let result: UpdateParticipantStatusState;

  try {
    if (intent === 'schedule') {
      const tanggal = String(formData.get('jadwalTanggal') ?? '').trim();
      const gelombang = parseOkbWave(formData.get('jadwalGelombang'));
      if (!isValidDate(tanggal)) return fail('Tanggal OKB tidak valid.');
      if (!gelombang) return fail('Pilih Gelombang OKB.');

      const { data, error } = await supabase
        .from('pendaftar')
        .update({ status: 'Terjadwal OKB', jadwal_okb_tanggal: tanggal, jadwal_okb_gelombang: gelombang })
        .eq('id', participantId)
        .in('status', ['Terverifikasi', 'Terjadwal OKB'])
        .select('id')
        .maybeSingle();
      if (error) throw error;
      result = data ? ok('Jadwal OKB berhasil disimpan.') : fail(STALE);
    } else if (intent === 'unschedule') {
      // Hapus Jadwal OKB: still in process, so the seat stays taken.
      const { data, error } = await supabase
        .from('pendaftar')
        .update({ status: 'Terverifikasi', jadwal_okb_tanggal: null, jadwal_okb_gelombang: null })
        .eq('id', participantId)
        .eq('status', 'Terjadwal OKB')
        .select('id')
        .maybeSingle();
      if (error) throw error;
      result = data ? ok('Jadwal OKB dihapus. Pendaftar kembali Terverifikasi.') : fail(STALE);
    } else if (intent === 'attend') {
      const { data, error } = await supabase
        .from('pendaftar')
        .update({ status: 'Sudah OKB' })
        .eq('id', participantId)
        .eq('status', 'Terjadwal OKB')
        .select('id')
        .maybeSingle();
      if (error) throw error;
      result = data ? ok('Pendaftar tercatat hadir OKB.') : fail(STALE);
    } else if (intent === 'decide') {
      const keputusan = String(formData.get('keputusan') ?? '');
      const kelas = String(formData.get('kelasPenempatan') ?? '');
      if (keputusan !== 'Diterima' && keputusan !== 'Ditolak') return fail('Pilih keputusan Diterima atau Ditolak.');
      if (keputusan === 'Diterima' && !(CLASS_OPTIONS as readonly string[]).includes(kelas)) return fail('Kelas Penempatan wajib dipilih untuk pendaftar yang Diterima.');

      const { data, error } = await supabase.rpc('decide_admission', {
        p_pendaftar_id: participantId,
        p_keputusan: keputusan,
        p_kelas_penempatan: keputusan === 'Diterima' ? kelas : null,
      });
      if (error) throw error;
      result = data === 'ok'
        ? ok(`Keputusan Penerimaan disimpan: ${keputusan}.`)
        : data === 'full'
          ? fail('Kuota Pilihan Kelas pendaftar ini sudah penuh. Geser kuota di menu Kuota Kelas terlebih dahulu.')
          : fail(STALE);
    } else if (intent === 'cancel') {
      const { data: current, error: readError } = await supabase
        .from('pendaftar')
        .select('status')
        .eq('id', participantId)
        .maybeSingle();
      if (readError) throw readError;
      const status = typeof current?.status === 'string' ? current.status : '';
      if (!(CANCELLABLE_STATUSES as readonly string[]).includes(status)) return fail(STALE);

      const { data, error } = await supabase
        .from('pendaftar')
        .update({ status: 'Dibatalkan', status_sebelum_dibatalkan: status })
        .eq('id', participantId)
        .eq('status', status)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      result = data ? ok('Pendaftar dibatalkan. Kursinya kini tersedia untuk pendaftar lain.') : fail(STALE);
    } else if (intent === 'restore') {
      const { data, error } = await supabase.rpc('restore_cancelled_applicant', { p_pendaftar_id: participantId });
      if (error) throw error;
      result = data === 'ok'
        ? ok('Pendaftar berhasil dipulihkan.')
        : data === 'full'
          ? fail('Kuota Pilihan Kelas pendaftar ini sudah penuh. Geser kuota di menu Kuota Kelas terlebih dahulu.')
          : fail(STALE);
    } else {
      return fail('Aksi tidak dikenal.');
    }
  } catch {
    return fail('Status pendaftar tidak dapat diperbarui. Silakan coba lagi.');
  }

  if (result.status === 'success') {
    revalidatePath(`/admin/pendaftar/${participantId}`);
    revalidatePath('/admin/pendaftar');
    if (intent === 'decide' || intent === 'cancel' || intent === 'restore') {
      revalidatePath('/pendaftaran');
      revalidatePath('/');
    }
  }
  return result;
}
