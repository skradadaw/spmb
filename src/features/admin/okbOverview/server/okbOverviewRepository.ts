import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { summarizeWaves } from '@/features/admin/announcement/waveSummary';
import { parseOkbWave } from '@/features/admin/okbWave';
import { jakartaToday } from '@/features/admin/participants/server/participantsRepository';
import { buildOkbOverview, OKB_OVERVIEW_STATUSES, type OkbOverviewStatus, type OkbOverviewView } from '../okbOverview';

type Row = {
  status: OkbOverviewStatus;
  jadwal_okb_tanggal: string | null;
  jadwal_okb_gelombang: number | null;
  ruang_okb: string | null;
  pilihan_kelas: string | null;
  jenis_kelamin: string | null;
  jenis_pendaftaran: string | null;
  diumumkan_pada: string | null;
  nomor_va: string | null;
};

/** Satu pembacaan Pendaftar dari Terverifikasi sampai Keputusan Penerimaan untuk tab Ringkasan OKB; hanya jumlah yang keluar dari sini. */
export async function fetchOkbOverview(supabase: SupabaseClient): Promise<OkbOverviewView> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('status,jadwal_okb_tanggal,jadwal_okb_gelombang,ruang_okb,pilihan_kelas,jenis_kelamin,jenis_pendaftaran,diumumkan_pada,nomor_va')
    .in('status', OKB_OVERVIEW_STATUSES)
    .range(0, 4999);
  if (error || !data) throw new Error('Ringkasan OKB tidak dapat dimuat.');

  const rows = data as Row[];
  const overview = buildOkbOverview(rows.map(row => ({
    status: row.status,
    tanggal: row.jadwal_okb_tanggal,
    gelombang: parseOkbWave(row.jadwal_okb_gelombang),
    ruangOkb: row.ruang_okb?.trim() || null,
    pilihanKelas: row.pilihan_kelas,
    jenisKelamin: row.jenis_kelamin,
    jenisPendaftaran: row.jenis_pendaftaran,
    diumumkan: Boolean(row.diumumkan_pada),
  })), jakartaToday());
  return { ...overview, results: summarizeWaves(rows) };
}
