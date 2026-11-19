import { formatOkbDate } from '@/features/admin/okbDate';

type Counts = { total: number; hadir: number; terjadwal: number };

/** Hanya hari ini yang menampilkan kehadiran, karena Scan Kehadiran hanya berlaku pada tanggalnya. */
export function countLabel({ total, hadir, terjadwal }: Counts, isToday: boolean) {
  return isToday ? `${hadir} hadir dari ${total}` : `${terjadwal} terjadwal`;
}

/** Pendaftar yang ditunggu: hari ini termasuk yang sudah hadir, tanggal lain hanya yang masih Terjadwal OKB. */
export const expectedCount = ({ total, terjadwal }: Counts, isToday: boolean) => (isToday ? total : terjadwal);

export function relativeDayLabel(hariLagi: number) {
  if (hariLagi === 0) return 'Hari ini';
  if (hariLagi === 1) return 'Besok';
  return `${hariLagi} hari lagi`;
}

export const longDate = (tanggal: string) => formatOkbDate(tanggal, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Kartu dasar Ringkasan OKB, sama dengan kartu di Ringkasan admin. */
export const OVERVIEW_CARD = 'min-w-0 rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]';
export const OVERVIEW_SUBHEADING = 'text-xs font-semibold uppercase tracking-wider text-slate-500';
export const OVERVIEW_LINK = 'rounded text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
