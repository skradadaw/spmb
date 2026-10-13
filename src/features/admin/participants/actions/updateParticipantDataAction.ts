'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { formSchema, type FormData as RegistrationData } from '@/features/registration/schema';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { toPendaftarRow } from '@/features/registration/server/supabaseRegistrationRepository';
import { EDIT_SOURCE_COLUMNS, GROUP_COLUMNS, fromPendaftarRow, groupKeys, isEditGroup, type FormKey } from '../editing';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNUSED_DOCUMENTS = { aktaKelahiran: '', kartuKeluarga: '', pasFoto: '', buktiPembayaran: '' };

export type UpdateParticipantDataState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<FormKey, string>>;
};

const fail = (message: string, fieldErrors?: UpdateParticipantDataState['fieldErrors']): UpdateParticipantDataState => ({ status: 'error', message, fieldErrors });

export async function updateParticipantDataAction(
  _previous: UpdateParticipantDataState,
  formData: FormData,
): Promise<UpdateParticipantDataState> {
  if (!await getAdminSession()) return fail('Sesi admin tidak valid. Silakan masuk kembali.');

  const participantId = String(formData.get('participantId') ?? '');
  const group = String(formData.get('group') ?? '');
  if (!UUID_PATTERN.test(participantId) || !isEditGroup(group)) return fail('Data pendaftar tidak valid.');

  const supabase = getSupabaseAdmin();
  try {
    const { data: row, error: readError } = await supabase
      .from('pendaftar')
      .select(`id,${EDIT_SOURCE_COLUMNS}`)
      .eq('id', participantId)
      .maybeSingle();
    if (readError) throw readError;
    if (!row) return fail('Pendaftar tidak ditemukan.');

    const current = fromPendaftarRow(row as unknown as Record<string, unknown>);
    const keys = groupKeys(group);
    // Values are trimmed here because the schema trims too; merged data then maps to the same row the form would produce.
    const submitted = Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? '').trim()]));
    const merged = { ...current, ...submitted } as RegistrationData;

    // Validate with the registration schema, but only block on this group so older incomplete data elsewhere does not lock editing.
    const parsed = formSchema.safeParse(merged);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FormKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FormKey;
        if (keys.includes(key) && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      if (Object.keys(fieldErrors).length) return fail('Periksa kembali isian yang ditandai.', fieldErrors);
    }

    if (group === 'identity' && merged.nik !== current.nik) {
      const { data: owner, error: ownerError } = await supabase
        .from('pendaftar')
        .select('nomor_pendaftaran')
        .eq('nik', merged.nik)
        .neq('id', participantId)
        .neq('status', 'Menunggu Unggahan')
        .limit(1)
        .maybeSingle();
      if (ownerError) throw ownerError;
      if (owner) return fail('NIK sudah dipakai pendaftar lain.', { nik: `NIK ini sudah dipakai oleh ${owner.nomor_pendaftaran ?? 'pendaftar lain'}.` });
    }

    if (group === 'registration') {
      const { data: result, error } = await supabase.rpc('update_applicant_registration', {
        p_pendaftar_id: participantId,
        p_jenis: merged.jenisPendaftaran,
        p_kelas: merged.pilihanKelas,
        p_kelas_tujuan: merged.jenisPendaftaran === 'Pindahan' ? merged.kelasTujuan || null : null,
      });
      if (error) throw error;
      if (result === 'full') {
        return fail(`Kuota ${merged.pilihanKelas} sudah penuh. Geser kuota di menu Kuota Kelas terlebih dahulu.`, { pilihanKelas: 'Kuota kelas ini sudah penuh.' });
      }
      if (result !== 'ok') return fail('Data pendaftaran tidak valid.');
    } else {
      const fullRow = toPendaftarRow(merged, UNUSED_DOCUMENTS) as Record<string, unknown>;
      const update = Object.fromEntries(GROUP_COLUMNS[group].map((column) => [column, fullRow[column] ?? null]));
      const { error } = await supabase.from('pendaftar').update(update).eq('id', participantId);
      if (error?.code === '23505' && error.message?.includes('uq_pendaftar_nik')) {
        return fail('NIK sudah dipakai pendaftar lain.', { nik: 'NIK ini sudah dipakai oleh pendaftar lain.' });
      }
      if (error) throw error;
    }
  } catch {
    return fail('Data tidak dapat disimpan. Silakan coba lagi.');
  }

  revalidatePath(`/admin/pendaftar/${participantId}`);
  revalidatePath('/admin/pendaftar');
  if (group === 'registration') {
    revalidatePath('/pendaftaran');
    revalidatePath('/');
  }
  return { status: 'success', message: 'Perubahan tersimpan.' };
}
