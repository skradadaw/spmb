import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LetterNumberSettings } from '../letterNumber';

const failure = () => new Error('Pengaturan nomor surat tidak dapat diproses.');

export function createLetterNumberRepository(supabase: SupabaseClient) {
  return {
    async get(): Promise<LetterNumberSettings | null> {
      const { data, error } = await supabase.from('pengaturan_nomor_surat').select('format,nomor_awal').eq('id', 'aktif').maybeSingle();
      if (error) throw failure();
      if (!data || typeof data.format !== 'string' || !Number.isInteger(data.nomor_awal)) return null;
      return { format: data.format, nomorAwal: data.nomor_awal };
    },
    async save(settings: LetterNumberSettings): Promise<void> {
      const { error } = await supabase.from('pengaturan_nomor_surat').upsert({ id: 'aktif', format: settings.format, nomor_awal: settings.nomorAwal });
      if (error) throw failure();
    },
    /** Nomor urut terbesar yang sudah diberikan ke Pendaftar; null bila belum ada. */
    async getLastUsed(): Promise<number | null> {
      const { data, error } = await supabase
        .from('pendaftar')
        .select('nomor_urut_surat')
        .not('nomor_urut_surat', 'is', null)
        .order('nomor_urut_surat', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw failure();
      return data && Number.isInteger(data.nomor_urut_surat) ? data.nomor_urut_surat : null;
    },
  };
}

export type LetterNumberRepository = ReturnType<typeof createLetterNumberRepository>;
