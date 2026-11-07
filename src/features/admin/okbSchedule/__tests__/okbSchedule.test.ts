import { describe, expect, it } from 'vitest';
import { buildOkbSchedule, type OkbScheduleRow } from '../okbSchedule';

const row = (tanggal: string, gelombang: 1 | 2 | 3, status: OkbScheduleRow['status']): OkbScheduleRow => ({ tanggal, gelombang, status });

describe('buildOkbSchedule', () => {
  it('returns no days when nobody is scheduled', () => {
    expect(buildOkbSchedule([])).toEqual([]);
  });

  it('counts Terjadwal OKB and Sudah OKB per Gelombang and per date', () => {
    const days = buildOkbSchedule([
      row('2026-11-20', 1, 'Terjadwal OKB'),
      row('2026-11-20', 1, 'Sudah OKB'),
      row('2026-11-20', 1, 'Terjadwal OKB'),
      row('2026-11-20', 2, 'Sudah OKB'),
    ]);

    expect(days).toEqual([{
      tanggal: '2026-11-20',
      total: 4,
      hadir: 2,
      terjadwal: 2,
      waves: [
        { gelombang: 1, total: 3, hadir: 1, terjadwal: 2 },
        { gelombang: 2, total: 1, hadir: 1, terjadwal: 0 },
      ],
    }]);
  });

  it('keeps a date whose Pendaftar have all attended', () => {
    const [day] = buildOkbSchedule([row('2026-11-20', 1, 'Sudah OKB')]);

    expect(day).toMatchObject({ tanggal: '2026-11-20', total: 1, hadir: 1, terjadwal: 0 });
  });

  it('orders dates from the nearest, then Gelombang from the smallest', () => {
    const days = buildOkbSchedule([
      row('2026-12-01', 1, 'Terjadwal OKB'),
      row('2026-11-20', 3, 'Terjadwal OKB'),
      row('2026-11-20', 1, 'Terjadwal OKB'),
    ]);

    expect(days.map(day => day.tanggal)).toEqual(['2026-11-20', '2026-12-01']);
    expect(days[0].waves.map(wave => wave.gelombang)).toEqual([1, 3]);
  });
});
