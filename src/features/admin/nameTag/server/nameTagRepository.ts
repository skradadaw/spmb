import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOkbWave } from '@/features/admin/okbWave';
import { jakartaToday } from '@/features/admin/participants/server/participantsRepository';
import type { NameTagRow, NameTagSelection } from '../nameTagGroups';
import type { RuangOkbExportRow } from '../ruangOkbExport';

type Row = { id: string; nama_lengkap: string | null; ruang_okb: string | null; pilihan_kelas: string | null; jadwal_okb_tanggal: string; jadwal_okb_gelombang: number | null };

/** Pendaftar Terjadwal OKB dengan tanggal hari ini atau setelahnya, sama seperti kartu Jadwal OKB terdekat. */
export async function fetchNameTagRows(supabase: SupabaseClient): Promise<NameTagRow[]> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('id,nama_lengkap,ruang_okb,pilihan_kelas,jadwal_okb_tanggal,jadwal_okb_gelombang')
    .eq('status', 'Terjadwal OKB')
    .gte('jadwal_okb_tanggal', jakartaToday())
    .range(0, 4999);
  if (error || !data) throw new Error('Data Name Tag tidak dapat dimuat.');
  return (data as Row[]).flatMap(row => {
    const gelombang = parseOkbWave(row.jadwal_okb_gelombang);
    return gelombang ? [{ id: row.id, namaLengkap: row.nama_lengkap ?? '', ruangOkb: row.ruang_okb?.trim() || null, pilihanKelas: row.pilihan_kelas?.trim() || null, tanggal: row.jadwal_okb_tanggal, gelombang }] : [];
  });
}

type ExportRow = {
  nomor_pendaftaran: string | null; nama_lengkap: string | null; jenis_kelamin: string | null; pilihan_kelas: string | null;
  jenis_pendaftaran: string | null; ruang_okb: string | null;
};

/** Pendaftar satu kelompok OKB yang sudah mendapat Ruang OKB, untuk ekspor Excel pembagian ruangan. */
export async function fetchRuangOkbExportRows(supabase: SupabaseClient, { tanggal, gelombang }: NameTagSelection): Promise<RuangOkbExportRow[]> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('nomor_pendaftaran,nama_lengkap,jenis_kelamin,pilihan_kelas,jenis_pendaftaran,ruang_okb')
    .eq('status', 'Terjadwal OKB')
    .eq('jadwal_okb_tanggal', tanggal)
    .eq('jadwal_okb_gelombang', gelombang)
    .not('ruang_okb_id', 'is', null)
    .range(0, 4999);
  if (error || !data) throw new Error('Data Ruang OKB tidak dapat dimuat.');
  return (data as ExportRow[]).flatMap(row => {
    const ruangOkb = row.ruang_okb?.trim();
    return ruangOkb ? [{
      nomorPendaftaran: row.nomor_pendaftaran, namaLengkap: row.nama_lengkap ?? '', jenisKelamin: row.jenis_kelamin,
      pilihanKelas: row.pilihan_kelas, jenisPendaftaran: row.jenis_pendaftaran, ruangOkb,
    }] : [];
  });
}
