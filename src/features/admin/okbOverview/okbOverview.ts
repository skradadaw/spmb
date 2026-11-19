import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import { OKB_WAVES, type OkbWave } from '@/features/admin/okbWave';
import { buildOkbSchedule, type OkbScheduleDay } from '@/features/admin/okbSchedule/okbSchedule';
import { compareRuangOkbName } from '@/features/admin/ruangOkb/ruangOkb';
import { GENDER_OPTIONS, REGISTRATION_TYPE_OPTIONS } from '@/features/registration/schema';
import { CLASS_OPTIONS } from '@/features/registration/classCapacity';

/** Status Pendaftar yang dibaca Ringkasan OKB: dari siap dijadwalkan sampai Keputusan Penerimaan. */
export const OKB_OVERVIEW_STATUSES = ['Terverifikasi', 'Terjadwal OKB', 'Sudah OKB', 'Diterima', 'Ditolak'] as const;
export type OkbOverviewStatus = (typeof OKB_OVERVIEW_STATUSES)[number];

/** Satu Pendaftar seperti yang dibutuhkan Ringkasan OKB, tanpa data pribadi. */
export type OkbOverviewRow = {
  status: OkbOverviewStatus;
  /** Tanggal Jadwal OKB (YYYY-MM-DD); kosong bila belum dijadwalkan. */
  tanggal: string | null;
  gelombang: OkbWave | null;
  ruangOkb: string | null;
  pilihanKelas: string | null;
  jenisKelamin: string | null;
  jenisPendaftaran: string | null;
  /** Keputusan Penerimaan sudah dapat dilihat orang tua. */
  diumumkan: boolean;
};

/** Jumlah Pendaftar pada setiap tahap OKB; setiap angka cocok dengan saringan status di Data Pendaftar. */
export type OkbPipeline = {
  /** Terverifikasi: Berkas sah, belum punya Jadwal OKB. */
  perluDijadwalkan: number;
  /** Semua Terjadwal OKB, termasuk Tidak Hadir OKB. */
  terjadwal: number;
  /** Terjadwal OKB pada hari ini atau setelahnya. */
  mendatang: number;
  /** Tidak Hadir OKB: Terjadwal OKB yang tanggalnya sudah lewat. */
  tidakHadir: number;
  /** Sudah OKB: hadir dan menunggu Keputusan Penerimaan. */
  sudahOkb: number;
  diterima: number;
  ditolak: number;
  /** Diterima atau Ditolak yang belum diumumkan kepada orang tua. */
  belumDiumumkan: number;
};

export type WaveCounts = Record<OkbWave, number>;
export type OkbRoomLoad = { nama: string; total: number; waves: WaveCounts };
export type CompositionPart = { label: string; count: number };

/** Label tetap untuk data lama yang belum mengisi kolomnya. */
const NOT_FILLED = 'Belum diisi';

/** Setiap bagian selalu dalam urutan tetap; "Belum diisi" hanya muncul bila ada. */
export type OkbDayComposition = { kelas: CompositionPart[]; gender: CompositionPart[]; jenis: CompositionPart[] };

export type OkbOverviewDay = OkbScheduleDay & {
  /** Selisih hari dari hari ini; 0 berarti hari ini. */
  hariLagi: number;
  /** Pendaftar yang ditunggu: hari ini Terjadwal OKB dan Sudah OKB, tanggal lain Terjadwal OKB saja. */
  pendaftar: number;
  /** Ruang OKB yang dipakai Pendaftar yang ditunggu, dalam urutan nama alami. */
  rooms: OkbRoomLoad[];
  /** Pendaftar yang ditunggu tetapi belum mendapat Ruang OKB; jumlahnya dengan rooms sama dengan pendaftar. */
  tanpaRuang: { total: number; waves: WaveCounts };
  komposisi: OkbDayComposition;
};

export type OkbOverview = { today: string; pipeline: OkbPipeline; days: OkbOverviewDay[] };
/** results: Hasil OKB per Gelombang OKB, dihitung sama persis dengan tab Pengumuman. */
export type OkbOverviewView = OkbOverview & { results: WaveSummary[] };

type ScheduledRow = OkbOverviewRow & { status: 'Terjadwal OKB' | 'Sudah OKB'; tanggal: string; gelombang: OkbWave };

const DAY_MS = 86_400_000;

/** Selisih hari kalender antara dua tanggal YYYY-MM-DD. */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

const emptyWaves = (): WaveCounts => Object.fromEntries(OKB_WAVES.map(wave => [wave, 0])) as WaveCounts;

function summarizePipeline(rows: OkbOverviewRow[], today: string): OkbPipeline {
  const pipeline: OkbPipeline = { perluDijadwalkan: 0, terjadwal: 0, mendatang: 0, tidakHadir: 0, sudahOkb: 0, diterima: 0, ditolak: 0, belumDiumumkan: 0 };
  for (const row of rows) {
    if (row.status === 'Terverifikasi') pipeline.perluDijadwalkan += 1;
    else if (row.status === 'Terjadwal OKB') {
      pipeline.terjadwal += 1;
      // Tanggal berformat YYYY-MM-DD, jadi perbandingan teks sama dengan urutan kalender.
      if (row.tanggal && row.tanggal < today) pipeline.tidakHadir += 1;
      else pipeline.mendatang += 1;
    } else if (row.status === 'Sudah OKB') pipeline.sudahOkb += 1;
    else {
      if (row.status === 'Diterima') pipeline.diterima += 1;
      else pipeline.ditolak += 1;
      if (!row.diumumkan) pipeline.belumDiumumkan += 1;
    }
  }
  return pipeline;
}

function isUpcoming(row: OkbOverviewRow, today: string): row is ScheduledRow {
  return (row.status === 'Terjadwal OKB' || row.status === 'Sudah OKB') && row.gelombang !== null && row.tanggal !== null && row.tanggal >= today;
}

function roomLoads(members: ScheduledRow[]) {
  const rooms = new Map<string, OkbRoomLoad>();
  const tanpaRuang = { total: 0, waves: emptyWaves() };
  for (const { ruangOkb, gelombang } of members) {
    const nama = ruangOkb?.trim();
    const load = nama ? rooms.get(nama) ?? { nama, total: 0, waves: emptyWaves() } : tanpaRuang;
    if (nama) rooms.set(nama, load as OkbRoomLoad);
    load.total += 1;
    load.waves[gelombang] += 1;
  }
  return { rooms: [...rooms.values()].sort((left, right) => compareRuangOkbName(left.nama, right.nama)), tanpaRuang };
}

function countParts(values: (string | null)[], labels: readonly string[]): CompositionPart[] {
  const counts = new Map(labels.map(label => [label, 0]));
  let notFilled = 0;
  for (const value of values) {
    const label = value?.trim() ?? '';
    const count = counts.get(label);
    if (count === undefined) notFilled += 1;
    else counts.set(label, count + 1);
  }
  const parts = [...counts].map(([label, count]) => ({ label, count }));
  return notFilled > 0 ? [...parts, { label: NOT_FILLED, count: notFilled }] : parts;
}

function composition(members: ScheduledRow[]): OkbDayComposition {
  return {
    kelas: countParts(members.map(row => row.pilihanKelas), CLASS_OPTIONS),
    gender: countParts(members.map(row => row.jenisKelamin), GENDER_OPTIONS),
    jenis: countParts(members.map(row => row.jenisPendaftaran), REGISTRATION_TYPE_OPTIONS),
  };
}

/**
 * Semua yang ditampilkan tab Ringkasan OKB dari satu pembacaan Pendaftar:
 * jumlah per tahap OKB, lalu setiap tanggal OKB hari ini dan seterusnya beserta Gelombang OKB, Ruang OKB, dan komposisi Pendaftarnya.
 */
export function buildOkbOverview(rows: OkbOverviewRow[], today: string): OkbOverview {
  const upcoming = rows.filter((row): row is ScheduledRow => isUpcoming(row, today));
  const days = buildOkbSchedule(upcoming.map(({ tanggal, gelombang, status }) => ({ tanggal, gelombang, status })));
  return {
    today,
    pipeline: summarizePipeline(rows, today),
    days: days.map(day => {
      const isToday = day.tanggal === today;
      // Pendaftar yang ditandai hadir lebih awal tidak datang lagi pada tanggalnya, jadi hanya hari ini yang ikut menghitung Sudah OKB.
      const members = upcoming.filter(row => row.tanggal === day.tanggal && (isToday || row.status === 'Terjadwal OKB'));
      return { ...day, hariLagi: daysBetween(today, day.tanggal), pendaftar: members.length, ...roomLoads(members), komposisi: composition(members) };
    }),
  };
}
