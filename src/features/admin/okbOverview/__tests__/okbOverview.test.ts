import { describe, expect, it } from 'vitest';
import type { OkbWave } from '@/features/admin/okbWave';
import { buildOkbOverview, daysBetween, type OkbOverviewRow } from '../okbOverview';

const TODAY = '2026-11-20';

const row = (status: OkbOverviewRow['status'], extra: Partial<OkbOverviewRow> = {}): OkbOverviewRow => ({
  status, tanggal: null, gelombang: null, ruangOkb: null,
  pilihanKelas: 'Reguler', jenisKelamin: 'Laki-laki', jenisPendaftaran: 'Siswa Baru', diumumkan: false,
  ...extra,
});
const at = (tanggal: string, gelombang: OkbWave, extra: Partial<OkbOverviewRow> = {}) => ({ tanggal, gelombang, ...extra });

describe('buildOkbOverview', () => {
  it('has no dates and zero counts when nobody is in OKB yet', () => {
    expect(buildOkbOverview([], TODAY)).toEqual({
      today: TODAY,
      pipeline: { perluDijadwalkan: 0, terjadwal: 0, mendatang: 0, tidakHadir: 0, sudahOkb: 0, diterima: 0, ditolak: 0, belumDiumumkan: 0 },
      days: [],
    });
  });

  it('counts every OKB stage the way the Status filter in Data Pendaftar does', () => {
    const { pipeline } = buildOkbOverview([
      row('Terverifikasi'),
      row('Terverifikasi'),
      row('Terjadwal OKB', at('2026-11-20', 1)),
      row('Terjadwal OKB', at('2026-11-25', 2)),
      row('Terjadwal OKB', at('2026-11-19', 1)),
      row('Sudah OKB', at('2026-11-12', 1)),
      row('Diterima', { diumumkan: true }),
      row('Diterima'),
      row('Ditolak'),
    ], TODAY);

    expect(pipeline).toEqual({ perluDijadwalkan: 2, terjadwal: 3, mendatang: 2, tidakHadir: 1, sudahOkb: 1, diterima: 2, ditolak: 1, belumDiumumkan: 2 });
  });

  it('shows today and later only, nearest first, with the days until each date', () => {
    const { days } = buildOkbOverview([
      row('Terjadwal OKB', at('2026-12-02', 1)),
      row('Terjadwal OKB', at('2026-11-20', 2)),
      row('Terjadwal OKB', at('2026-11-19', 1)),
      row('Sudah OKB', at('2026-11-18', 1)),
    ], TODAY);

    expect(days.map(day => [day.tanggal, day.hariLagi])).toEqual([['2026-11-20', 0], ['2026-12-02', 12]]);
  });

  it('counts those already present today, but only Pendaftar still scheduled on other dates', () => {
    const { days } = buildOkbOverview([
      row('Sudah OKB', at('2026-11-20', 1, { ruangOkb: 'Ruang 1' })),
      row('Terjadwal OKB', at('2026-11-20', 1, { ruangOkb: 'Ruang 1' })),
      // Ditandai hadir lebih awal dari detail Pendaftar: tidak datang lagi pada tanggalnya.
      row('Sudah OKB', at('2026-11-25', 2, { ruangOkb: 'Ruang 2' })),
      row('Terjadwal OKB', at('2026-11-25', 2)),
    ], TODAY);

    const [today, later] = days;
    expect(today).toMatchObject({ pendaftar: 2, total: 2, hadir: 1, terjadwal: 1 });
    expect(today.rooms).toEqual([{ nama: 'Ruang 1', total: 2, waves: { 1: 2, 2: 0, 3: 0 } }]);
    expect(later).toMatchObject({ pendaftar: 1, rooms: [], tanpaRuang: { total: 1, waves: { 1: 0, 2: 1, 3: 0 } } });
  });

  it('spreads Pendaftar over Ruang OKB per Gelombang, rooms in natural name order, and counts those without a room', () => {
    const [day] = buildOkbOverview([
      row('Terjadwal OKB', at('2026-11-21', 1, { ruangOkb: 'Ruang 10' })),
      row('Terjadwal OKB', at('2026-11-21', 1, { ruangOkb: 'Ruang 2' })),
      row('Terjadwal OKB', at('2026-11-21', 2, { ruangOkb: 'Ruang 2' })),
      row('Terjadwal OKB', at('2026-11-21', 2, { ruangOkb: '  ' })),
      row('Terjadwal OKB', at('2026-11-21', 3)),
    ], TODAY).days;

    expect(day.rooms).toEqual([
      { nama: 'Ruang 2', total: 2, waves: { 1: 1, 2: 1, 3: 0 } },
      { nama: 'Ruang 10', total: 1, waves: { 1: 1, 2: 0, 3: 0 } },
    ]);
    expect(day.tanpaRuang).toEqual({ total: 2, waves: { 1: 0, 2: 1, 3: 1 } });
    expect(day.rooms.reduce((sum, room) => sum + room.total, 0) + day.tanpaRuang.total).toBe(day.pendaftar);
  });

  it('keeps every Pilihan Kelas, jenis kelamin, and Jenis Pendaftaran in a fixed order, adding Belum diisi only for old rows', () => {
    const [day] = buildOkbOverview([
      row('Terjadwal OKB', at('2026-11-21', 1, { pilihanKelas: 'Tahfizh', jenisKelamin: 'Perempuan', jenisPendaftaran: 'Pindahan' })),
      row('Terjadwal OKB', at('2026-11-21', 1, { pilihanKelas: 'Reguler' })),
      row('Terjadwal OKB', at('2026-11-21', 1, { pilihanKelas: null, jenisKelamin: null })),
    ], TODAY).days;

    expect(day.komposisi).toEqual({
      kelas: [{ label: 'Reguler', count: 1 }, { label: 'Bilingual', count: 0 }, { label: 'Tahfizh', count: 1 }, { label: 'Belum diisi', count: 1 }],
      gender: [{ label: 'Laki-laki', count: 1 }, { label: 'Perempuan', count: 1 }, { label: 'Belum diisi', count: 1 }],
      jenis: [{ label: 'Siswa Baru', count: 2 }, { label: 'Pindahan', count: 1 }],
    });
  });

  it('leaves a Pendaftar without a valid Gelombang out of the dates but still counts its status', () => {
    const overview = buildOkbOverview([row('Terjadwal OKB', { tanggal: '2026-11-21', gelombang: null })], TODAY);

    expect(overview.days).toEqual([]);
    expect(overview.pipeline).toMatchObject({ terjadwal: 1, mendatang: 1 });
  });
});

describe('daysBetween', () => {
  it('counts calendar days, across months', () => {
    expect(daysBetween('2026-11-20', '2026-11-20')).toBe(0);
    expect(daysBetween('2026-11-30', '2026-12-02')).toBe(2);
  });
});
