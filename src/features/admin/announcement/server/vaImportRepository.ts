import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { VaImportApplicant } from '../vaImport';

const failure = () => new Error('Data Nomor VA tidak dapat dimuat.');
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null);
const BATCH = 200;

/** Data tersimpan yang dibutuhkan untuk mengelompokkan baris impor Nomor VA. */
export async function loadVaImportContext(supabase: SupabaseClient, nomorList: string[], vaList: string[]) {
  const applicants = new Map<string, VaImportApplicant>();
  const vaOwners = new Map<string, string>();
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

  const nomors = unique(nomorList);
  for (let offset = 0; offset < nomors.length; offset += BATCH) {
    const { data, error } = await supabase
      .from('pendaftar')
      .select('nomor_pendaftaran,nama_lengkap,status,nomor_va,diumumkan_pada')
      .in('nomor_pendaftaran', nomors.slice(offset, offset + BATCH));
    if (error || !data) throw failure();
    for (const row of data) {
      applicants.set(String(row.nomor_pendaftaran), {
        nomorPendaftaran: String(row.nomor_pendaftaran), namaLengkap: text(row.nama_lengkap), status: String(row.status ?? ''),
        nomorVa: text(row.nomor_va), diumumkanPada: text(row.diumumkan_pada),
      });
    }
  }

  const vas = unique(vaList);
  for (let offset = 0; offset < vas.length; offset += BATCH) {
    const { data, error } = await supabase.from('pendaftar').select('nomor_pendaftaran,nomor_va').in('nomor_va', vas.slice(offset, offset + BATCH));
    if (error || !data) throw failure();
    for (const row of data) vaOwners.set(String(row.nomor_va), String(row.nomor_pendaftaran));
  }
  return { applicants, vaOwners };
}
