import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { summarizeWaves, type WaveSummary, type WaveSummaryRow } from '../waveSummary';

/** Pendaftar yang sudah mengikuti OKB, dikelompokkan per Gelombang OKB untuk halaman Pengumuman. */
export async function fetchWaveSummaries(supabase: SupabaseClient): Promise<WaveSummary[]> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('status,jadwal_okb_gelombang,diumumkan_pada,nomor_va')
    .in('status', ['Sudah OKB', 'Diterima', 'Ditolak'])
    .not('jadwal_okb_gelombang', 'is', null)
    .range(0, 4999);
  if (error || !data) throw new Error('Ringkasan Gelombang OKB tidak dapat dimuat.');
  return summarizeWaves(data as WaveSummaryRow[]);
}
