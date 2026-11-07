import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOkbWave } from '@/features/admin/okbWave';
import { jakartaToday } from '@/features/admin/participants/server/participantsRepository';
import { buildOkbSchedule, type OkbScheduleDay, type OkbScheduleStatus } from '../okbSchedule';

const ERROR_MESSAGE = 'Jadwal OKB tidak dapat dimuat.';
const COUNTED_STATUSES: OkbScheduleStatus[] = ['Terjadwal OKB', 'Sudah OKB'];

type Row = { status: OkbScheduleStatus; jadwal_okb_tanggal: string; jadwal_okb_gelombang: number | null };
export type OkbScheduleView = { today: string; days: OkbScheduleDay[]; missed: number };

/** Tanggal hari ini dan seterusnya untuk tab Jadwal, beserta jumlah Tidak Hadir OKB dari tanggal yang sudah lewat. */
export async function fetchOkbSchedule(supabase: SupabaseClient): Promise<OkbScheduleView> {
  const today = jakartaToday();
  const [rows, missed] = await Promise.all([
    supabase
      .from('pendaftar')
      .select('status,jadwal_okb_tanggal,jadwal_okb_gelombang')
      .in('status', COUNTED_STATUSES)
      .gte('jadwal_okb_tanggal', today)
      .range(0, 4999),
    supabase
      .from('pendaftar')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Terjadwal OKB')
      .lt('jadwal_okb_tanggal', today),
  ]);
  if (rows.error || !rows.data || missed.error) throw new Error(ERROR_MESSAGE);

  const days = buildOkbSchedule((rows.data as Row[]).flatMap(row => {
    const gelombang = parseOkbWave(row.jadwal_okb_gelombang);
    return gelombang ? [{ tanggal: row.jadwal_okb_tanggal, gelombang, status: row.status }] : [];
  }));
  return { today, days, missed: missed.count ?? 0 };
}
