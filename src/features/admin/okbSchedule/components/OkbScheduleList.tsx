import Link from 'next/link';
import { CalendarDays, ScanLine } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { nameTagHref } from '@/features/admin/nameTag/nameTagGroups';
import { formatOkbDate } from '@/features/admin/okbDate';
import { okbWaveLabel } from '@/features/admin/okbWave';
import { cn } from '@/lib/utils';
import type { OkbScheduleDay } from '../okbSchedule';

const LINK_CLASS = 'text-xs font-semibold text-emerald-700 hover:underline';

function countLabel({ total, hadir, terjadwal }: { total: number; hadir: number; terjadwal: number }, isToday: boolean) {
  return isToday ? `${hadir} hadir dari ${total}` : `${terjadwal} terjadwal`;
}

/** Tanggal OKB hari ini dan seterusnya; hanya hari ini yang menampilkan kehadiran, karena Scan Kehadiran hanya berlaku pada tanggalnya. */
export function OkbScheduleList({ days, today }: { days: OkbScheduleDay[]; today: string }) {
  if (days.length === 0) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-center">
        <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
        <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {days.map(day => {
        const isToday = day.tanggal === today;
        const label = formatOkbDate(day.tanggal, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return (
          <li key={day.tanggal} aria-label={label} className={cn('rounded-2xl border p-4 shadow-sm sm:p-5', isToday ? 'border-emerald-200 bg-emerald-50/60' : 'border-[var(--admin-border)] bg-[var(--admin-surface)]')}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">
                  {label}
                  {isToday && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">Hari ini</span>}
                </h2>
                <p className="mt-0.5 text-sm tabular-nums text-slate-600">{countLabel(day, isToday)}</p>
              </div>
              {isToday && <ButtonLink href="/admin/scan" size="sm"><ScanLine aria-hidden="true" />Scan Kehadiran</ButtonLink>}
            </div>
            <ul aria-label="Gelombang OKB" className="mt-3 divide-y divide-slate-200/70 border-t border-slate-200/70">
              {day.waves.map(wave => {
                const waveName = okbWaveLabel(wave.gelombang);
                return (
                  <li key={wave.gelombang} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                    <span className="font-medium text-slate-900">{waveName}</span>
                    <span className="tabular-nums text-slate-600">{countLabel(wave, isToday)}</span>
                    <span className="ml-auto flex items-center gap-3">
                      {/* Halaman Name Tag hanya memuat Terjadwal OKB; tanpa mereka, tautan akan membuka kelompok lain. */}
                      {wave.terjadwal > 0 && <Link href={nameTagHref(day.tanggal, wave.gelombang)} aria-label={`Name Tag ${waveName}`} className={LINK_CLASS}>Name Tag</Link>}
                      <Link href={`/admin/pendaftar?gelombang=${wave.gelombang}`} aria-label={`Data Pendaftar ${waveName}`} className={LINK_CLASS}>Data Pendaftar</Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
