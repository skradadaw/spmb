import Link from 'next/link';
import { CalendarDays, ScanLine } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

function dayLabel(date: string) {
  // Jadwal OKB is a calendar date; noon UTC keeps it on the same day in Asia/Jakarta.
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(`${date}T12:00:00Z`));
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
                <li key={day.date} className={cn('rounded-xl border px-4 py-3', isToday ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-100')}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-900">{dayLabel(day.date)}{isToday && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Hari ini</span>}</span>
                    <span className="tabular-nums text-slate-500"><strong className="text-slate-900">{day.total}</strong> pendaftar</span>
                  </div>
                  <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">{day.waves.map(wave => `${wave.label}: ${wave.count}`).join(' · ')}</p>
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
