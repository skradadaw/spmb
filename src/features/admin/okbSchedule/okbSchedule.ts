import type { OkbWave } from '@/features/admin/okbWave';

export type OkbScheduleStatus = 'Terjadwal OKB' | 'Sudah OKB';
export type OkbScheduleRow = { tanggal: string; gelombang: OkbWave; status: OkbScheduleStatus };
type OkbScheduleCounts = { total: number; hadir: number; terjadwal: number };
export type OkbScheduleWave = OkbScheduleCounts & { gelombang: OkbWave };
export type OkbScheduleDay = OkbScheduleCounts & { tanggal: string; waves: OkbScheduleWave[] };

/** Menyusun tanggal OKB beserta jumlah Pendaftar per Gelombang OKB; hadir berarti Sudah OKB. */
export function buildOkbSchedule(rows: OkbScheduleRow[]): OkbScheduleDay[] {
  const days = new Map<string, Map<OkbWave, OkbScheduleWave>>();
  for (const { tanggal, gelombang, status } of rows) {
    const waves = days.get(tanggal) ?? new Map<OkbWave, OkbScheduleWave>();
    days.set(tanggal, waves);
    const wave = waves.get(gelombang) ?? { gelombang, total: 0, hadir: 0, terjadwal: 0 };
    waves.set(gelombang, wave);
    wave.total += 1;
    if (status === 'Sudah OKB') wave.hadir += 1;
    else wave.terjadwal += 1;
  }
  return [...days.entries()]
    // Tanggal berformat YYYY-MM-DD, jadi urutan teksnya sama dengan urutan kalender.
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tanggal, waveMap]) => {
      const waves = [...waveMap.values()].sort((left, right) => left.gelombang - right.gelombang);
      return {
        tanggal,
        total: waves.reduce((sum, wave) => sum + wave.total, 0),
        hadir: waves.reduce((sum, wave) => sum + wave.hadir, 0),
        terjadwal: waves.reduce((sum, wave) => sum + wave.terjadwal, 0),
        waves,
      };
    });
}
