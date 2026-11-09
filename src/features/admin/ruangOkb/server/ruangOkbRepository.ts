import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sortRuangOkb, type RuangOkb, type RuangOkbUsage } from '../ruangOkb';

/** Daftar Ruang OKB dalam urutan alami, untuk pilihan ruangan Pendaftar. */
export async function fetchRuangOkbList(supabase: SupabaseClient): Promise<RuangOkb[]> {
  const { data, error } = await supabase.from('ruang_okb').select('id,nama');
  if (error || !data) throw new Error('Daftar Ruang OKB tidak dapat dimuat.');
  return sortRuangOkb(data as RuangOkb[]);
}

type UsageRow = RuangOkb & { pendaftar: { count: number }[] | null };

/** Daftar Ruang OKB beserta jumlah Pendaftar yang memakainya, apa pun statusnya, untuk Pengaturan. */
export async function fetchRuangOkbUsage(supabase: SupabaseClient): Promise<RuangOkbUsage[]> {
  const { data, error } = await supabase.from('ruang_okb').select('id,nama,pendaftar(count)');
  if (error || !data) throw new Error('Daftar Ruang OKB tidak dapat dimuat.');
  return sortRuangOkb((data as UsageRow[]).map(({ id, nama, pendaftar }) => ({ id, nama, dipakai: pendaftar?.[0]?.count ?? 0 })));
}
