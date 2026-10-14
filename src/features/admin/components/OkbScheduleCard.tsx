import Link from 'next/link';
import { CalendarDays, ScanLine } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  // Jadwal OKB is a calendar date; noon UTC keeps it on the same day in Asia/Jakarta.
  return new Intl.DateTimeFormat('id-ID', { ...options, timeZone: 'Asia/Jakarta' }).format(new Date(`${date}T12:00:00Z`));
}

/** With one Gelombang the day total already says how many; with several, each chip carries its own count. */
function waveLabel(wave: { label: string; count: number }, single: boolean) {
  return single ? wave.label : `${wave.label} · ${wave.count} pendaftar`;
}

/** The nearest OKB dates with how many Pendaftar are scheduled, so the admin can prepare rooms and the attendance scan. */
export function OkbScheduleCard({ schedule, today }: Pick<AdminDashboardSummary, 'schedule' | 'today'>) {
  const hasToday = schedule.some(day => day.date === today);
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-3 sm:p-6 sm:pb-4">
        <CardTitle className="text-base font-bold tracking-[-0.02em]">Jadwal OKB terdekat</CardTitle>
        {hasToday && <ButtonLink href="/admin/scan" size="sm"><ScanLine aria-hidden="true" />Scan Kehadiran</ButtonLink>}
      </CardHeader>
      <CardContent className="p-5 pt-1 sm:p-6 sm:pt-1">
        {schedule.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
            <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
            <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {schedule.map(day => {
              const isToday = day.date === today;
              return (
                <li key={day.date} className={cn('flex items-center gap-3 rounded-xl border p-3', isToday ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-100')}>
                  <div aria-hidden="true" className={cn('grid w-12 shrink-0 overflow-hidden rounded-lg border text-center', isToday ? 'border-emerald-200 bg-white' : 'border-slate-200 bg-white')}>
                    <span className={cn('py-0.5 text-[10px] font-bold uppercase tracking-wide text-white', isToday ? 'bg-emerald-600' : 'bg-[var(--admin-sidebar)]')}>{formatDate(day.date, { month: 'short' })}</span>
                    <span className="py-1 text-lg font-bold leading-6 tabular-nums text-slate-900">{formatDate(day.date, { day: 'numeric' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {isToday && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">Hari ini</span>}
                    </p>
                    <ul aria-label="Gelombang OKB" className="mt-1.5 flex flex-wrap gap-1.5">
                      {day.waves.map(wave => (
                        <li key={wave.label} className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-sky-800">{waveLabel(wave, day.waves.length === 1)}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="shrink-0 text-right leading-tight">
                    <span className="block text-xl font-bold tabular-nums text-slate-900">{day.total}</span>
                    <span className="text-[11px] text-slate-500">pendaftar</span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/admin/pendaftar?status=Terjadwal+OKB" className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline">Lihat semua yang terjadwal</Link>
      </CardContent>
    </Card>
  );
}
