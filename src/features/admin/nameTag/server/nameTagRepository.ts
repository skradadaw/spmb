import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseOkbWave } from '@/features/admin/okbWave';
import type { NameTagRow } from '../nameTagGroups';

type Row = { id: string; nama_lengkap: string | null; ruang_okb: string | null; jadwal_okb_tanggal: string; jadwal_okb_gelombang: number | null };

const jakartaToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

/** Pendaftar Terjadwal OKB dengan tanggal hari ini atau setelahnya, sama seperti kartu Jadwal OKB terdekat. */
export async function fetchNameTagRows(supabase: SupabaseClient): Promise<NameTagRow[]> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('id,nama_lengkap,ruang_okb,jadwal_okb_tanggal,jadwal_okb_gelombang')
    .eq('status', 'Terjadwal OKB')
    .gte('jadwal_okb_tanggal', jakartaToday())
    .range(0, 4999);
  if (error || !data) throw new Error('Data Name Tag tidak dapat dimuat.');
  return (data as Row[]).flatMap(row => {
    const gelombang = parseOkbWave(row.jadwal_okb_gelombang);
    return gelombang ? [{ id: row.id, namaLengkap: row.nama_lengkap ?? '', ruangOkb: row.ruang_okb?.trim() || null, tanggal: row.jadwal_okb_tanggal, gelombang }] : [];
  });
}
