import Link from 'next/link';
import { CalendarDays, ChevronRight, ScanLine } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { AdminDashboardSummary } from '../contracts';
import { DashboardCardTitle } from './DashboardCardTitle';
import { OkbDayTabs } from './OkbDayTabs';

/** The nearest OKB dates with their Gelombang OKB and Ruang OKB spread, so the admin can prepare rooms and the attendance scan. */
export function OkbScheduleCard({ schedule, today }: Pick<AdminDashboardSummary, 'schedule' | 'today'>) {
  const hasToday = schedule.some(day => day.date === today);
  return (
    <Card className="min-w-0 rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-3 gap-y-3 space-y-0 p-5 pb-2 sm:p-6 sm:pb-3">
        <DashboardCardTitle icon={CalendarDays} title="Jadwal OKB" description="Tanggal terdekat dan pembagian ruang" />
        {hasToday
          ? <ButtonLink href="/admin/scan" size="sm"><ScanLine aria-hidden="true" />Scan Kehadiran</ButtonLink>
          : schedule.length > 0 && <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">{schedule.length} tanggal</span>}
      </CardHeader>
      <CardContent className="p-5 pt-1 sm:p-6 sm:pt-1">
        {schedule.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
            <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
            <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
          </div>
        ) : (
          <OkbDayTabs schedule={schedule} today={today} />
        )}
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Link href="/admin/okb" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">Lihat semua jadwal<ChevronRight aria-hidden="true" className="size-3.5" /></Link>
        </div>
      </CardContent>
    </Card>
  );
}
