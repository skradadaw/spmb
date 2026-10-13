import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { CLASS_OPTIONS, type ClassCapacity, type ClassOption } from '../classCapacity';

type UsageRow = { pilihan_kelas: string; kuota: number; terpakai: number };

export type ClassCapacityUpdateResult =
  | { status: 'ok' }
  | { status: 'invalid' }
  | { status: 'total_mismatch' }
  | { status: 'below_used'; pilihanKelas: ClassOption };

export class ClassCapacityLoadError extends Error {
  constructor() {
    super('Kuota kelas tidak dapat dimuat.');
    this.name = 'ClassCapacityLoadError';
  }
}

function isClassOption(value: string): value is ClassOption {
  return (CLASS_OPTIONS as readonly string[]).includes(value);
}

export async function fetchClassCapacities(client: Pick<SupabaseClient, 'rpc'>): Promise<ClassCapacity[]> {
  const { data, error } = await client.rpc('get_class_capacity_usage');
  if (error || !Array.isArray(data)) throw new ClassCapacityLoadError();

  const rows = new Map((data as UsageRow[]).map((row) => [row.pilihan_kelas, row]));
  return CLASS_OPTIONS.map((pilihanKelas) => {
    const row = rows.get(pilihanKelas);
    return {
      pilihanKelas,
      kuota: Number(row?.kuota ?? 0),
      terpakai: Number(row?.terpakai ?? 0),
    };
  });
}

export async function updateClassCapacities(
  client: Pick<SupabaseClient, 'rpc'>,
  kuota: Record<ClassOption, number>,
  total: number,
): Promise<ClassCapacityUpdateResult> {
  const { data, error } = await client.rpc('update_class_capacities', {
    p_reguler: kuota.Reguler,
    p_bilingual: kuota.Bilingual,
    p_tahfizh: kuota.Tahfizh,
    p_total: total,
  });
  if (error || typeof data !== 'string') throw new Error('Kuota kelas tidak dapat disimpan.');

  if (data === 'ok' || data === 'invalid' || data === 'total_mismatch') return { status: data };
  const [status, pilihanKelas] = data.split(':');
  if (status === 'below_used' && pilihanKelas && isClassOption(pilihanKelas)) {
    return { status: 'below_used', pilihanKelas };
  }
  throw new Error('Kuota kelas tidak dapat disimpan.');
}
