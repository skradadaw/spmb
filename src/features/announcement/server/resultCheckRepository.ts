import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApplicantResultRecord } from '../contracts';
import { RESULT_CHECK_LIMIT, RESULT_CHECK_WINDOW_SECONDS, type ResultCheckRepository } from '../resultCheck';

/** Hanya kolom yang ditampilkan kepada orang tua; data pribadi lain tidak pernah dibaca. */
export const RESULT_CHECK_COLUMNS = 'nomor_pendaftaran,nama_lengkap,tempat_lahir,tanggal_lahir,status,jadwal_okb_tanggal,jadwal_okb_gelombang,diumumkan_pada,kelas_penempatan,jenis_pendaftaran,kelas_tujuan,nomor_va';

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null);
const failure = () => new Error('Cek Hasil OKB tidak dapat diproses.');

export function createResultCheckRepository(supabase: SupabaseClient): ResultCheckRepository {
  return {
    async findByNomorPendaftaran(nomorPendaftaran): Promise<ApplicantResultRecord | null> {
      const { data, error } = await supabase
        .from('pendaftar')
        .select(RESULT_CHECK_COLUMNS)
        .eq('nomor_pendaftaran', nomorPendaftaran)
        .maybeSingle();
      if (error) throw failure();
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return {
        nomorPendaftaran: String(row.nomor_pendaftaran),
        namaLengkap: text(row.nama_lengkap),
        tempatLahir: text(row.tempat_lahir),
        tanggalLahir: text(row.tanggal_lahir),
        status: text(row.status) ?? '',
        jadwalTanggal: text(row.jadwal_okb_tanggal),
        jadwalGelombang: row.jadwal_okb_gelombang,
        diumumkanPada: text(row.diumumkan_pada),
        kelasPenempatan: text(row.kelas_penempatan),
        jenisPendaftaran: text(row.jenis_pendaftaran),
        kelasTujuan: text(row.kelas_tujuan),
        nomorVa: text(row.nomor_va),
      };
    },
    async isLocked(clientKey) {
      const { data, error } = await supabase.rpc('is_result_check_locked', {
        p_identifier_hash: clientKey,
        p_limit: RESULT_CHECK_LIMIT,
        p_window_seconds: RESULT_CHECK_WINDOW_SECONDS,
      });
      if (error) throw failure();
      return data === true;
    },
    async recordFailure(clientKey) {
      const { error } = await supabase.rpc('record_result_check_failure', {
        p_identifier_hash: clientKey,
        p_window_seconds: RESULT_CHECK_WINDOW_SECONDS,
      });
      if (error) throw failure();
    },
  };
}
