'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { formatProperName } from '@/lib/properName';
import { isValidNomorVa, NOMOR_VA_LENGTH, normalizeNomorVa } from '../nomorVa';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIQUE_VIOLATION = '23505';
const NOT_ACCEPTED = 'Nomor VA hanya dapat diisi untuk pendaftar Diterima yang hasilnya belum diumumkan.';
const LOCKED = 'Nomor VA tidak dapat diubah setelah hasil diumumkan. Tarik pengumuman terlebih dahulu.';

export type SaveNomorVaState = { status: 'idle' | 'success' | 'error'; message: string };

const ok = (message: string): SaveNomorVaState => ({ status: 'success', message });
const fail = (message: string): SaveNomorVaState => ({ status: 'error', message });

/** Mengisi, mengubah, atau mengosongkan (clear=1) Nomor VA seorang Pendaftar Diterima. */
export async function saveNomorVaAction(_previous: SaveNomorVaState, formData: FormData): Promise<SaveNomorVaState> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  if (!UUID_PATTERN.test(participantId)) return fail('Data pendaftar tidak valid.');

  const nomorVa = formData.get('clear') === '1' ? '' : normalizeNomorVa(String(formData.get('nomorVa') ?? ''));
  if (formData.get('clear') !== '1' && !nomorVa) return fail('Isi Nomor VA terlebih dahulu.');
  if (nomorVa && !isValidNomorVa(nomorVa)) return fail(`Nomor VA harus ${NOMOR_VA_LENGTH} digit angka.`);

  const supabase = getSupabaseAdmin();
  const { data: current, error: readError } = await supabase
    .from('pendaftar')
    .select('status,diumumkan_pada')
    .eq('id', participantId)
    .maybeSingle();
  if (readError) return fail('Nomor VA tidak dapat disimpan.');
  if (current?.status !== 'Diterima') return fail(NOT_ACCEPTED);
  // Orang tua mungkin sudah menyalin Nomor VA dari Surat Penerimaan.
  if (current.diumumkan_pada) return fail(LOCKED);

  if (nomorVa) {
    const { data: owner, error } = await supabase
      .from('pendaftar')
      .select('nama_lengkap,nomor_pendaftaran')
      .eq('nomor_va', nomorVa)
      .neq('id', participantId)
      .maybeSingle();
    if (error) return fail('Nomor VA tidak dapat disimpan.');
    if (owner) {
      const name = typeof owner.nama_lengkap === 'string' ? formatProperName(owner.nama_lengkap) : 'pendaftar lain';
      return fail(`Nomor VA sudah dipakai ${name}${owner.nomor_pendaftaran ? ` (${owner.nomor_pendaftaran})` : ''}.`);
    }
  }

  const { data, error } = await supabase
    .from('pendaftar')
    .update({ nomor_va: nomorVa || null })
    .eq('id', participantId)
    .eq('status', 'Diterima')
    .is('diumumkan_pada', null)
    .select('id')
    .maybeSingle();

  // Pemeriksaan di atas dapat kalah cepat dari penyimpanan lain; indeks unik tetap menjaganya.
  if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) return fail('Nomor VA sudah dipakai pendaftar lain.');
  if (error) return fail('Nomor VA tidak dapat disimpan.');
  if (!data) return fail(`${NOT_ACCEPTED} Muat ulang halaman lalu coba lagi.`);

  revalidatePath(`/admin/pendaftar/${participantId}`);
  revalidatePath('/admin/pendaftar');
  return ok(nomorVa ? 'Nomor VA disimpan.' : 'Nomor VA dikosongkan.');
}
