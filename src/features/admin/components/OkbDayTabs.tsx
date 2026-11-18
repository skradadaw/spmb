'use client';

import { Tabs } from '@base-ui/react/tabs';
import { AlertTriangle, DoorOpen } from 'lucide-react';
import { formatOkbDate as formatDate } from '@/features/admin/okbDate';
import { cn } from '@/lib/utils';
import type { OkbScheduleDay } from '../contracts';

/** With one Gelombang the day total already says how many; with several, each chip carries its own count. */
function waveLabel(wave: { label: string; count: number }, single: boolean) {
  return single ? wave.label : `${wave.label} · ${wave.count} pendaftar`;
}

/** One bar per Ruang OKB, all on the same scale (the day's total) and in one hue, so rooms compare at a glance. */
function RoomList({ day }: { day: OkbScheduleDay }) {
  if (day.rooms === null) {
    return <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-center text-xs text-slate-500">Data Ruang OKB belum tersedia.</p>;
  }
  const seated = day.rooms.reduce((sum, room) => sum + room.count, 0);
  const unassigned = Math.max(0, day.total - seated);
  const scale = Math.max(1, day.total);

  return (
    <div className="space-y-2">
      {day.rooms.length > 0 && (
        <ul aria-label="Pembagian Ruang OKB" className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {day.rooms.map(room => (
            <li key={room.label} className="grid grid-cols-[minmax(0,6.5rem)_1fr_2rem] items-center gap-2 rounded-lg px-2 py-1.5 sm:grid-cols-[minmax(0,7rem)_1fr_2.5rem] sm:gap-3 transition-colors duration-150 hover:bg-slate-50 motion-reduce:transition-none">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600"><DoorOpen aria-hidden="true" className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{room.label}</span></span>
              <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-gradient-to-r from-[#087A20] to-[#22B43B]" style={{ width: `${(room.count / scale) * 100}%` }} />
              </span>
              <span className="text-right text-sm font-bold tabular-nums text-slate-950">{room.count}</span>
            </li>
          ))}
        </ul>
      )}
      {unassigned > 0 && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-amber-600" />
          <span className="min-w-0 flex-1">Belum mendapat Ruang OKB</span>
          <span className="font-bold tabular-nums">{unassigned}</span>
        </p>
      )}
      {day.rooms.length > 0 && unassigned === 0 && <p className="px-2 text-[11px] text-emerald-700">Semua Pendaftar sudah mendapat Ruang OKB.</p>}
    </div>
  );
}

/** A small desk-calendar tile: month band on top, day number below; today gets the brighter green band. */
function CalendarTile({ date, isToday }: { date: string; isToday: boolean }) {
  return (
    <span aria-hidden="true" className="flex w-14 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)]">
      <span className={cn('py-1 text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-white', isToday ? 'bg-emerald-600' : 'bg-[var(--admin-sidebar)]')}>{formatDate(date, { month: 'short' })}</span>
      <span className="pb-1.5 pt-1 text-xl font-bold leading-6 tabular-nums tracking-[-0.03em] text-slate-950">{formatDate(date, { day: 'numeric' })}</span>
    </span>
  );
}

/**
 * The nearest OKB dates: pick a date (only offered when there is more than one) to see its Gelombang OKB
 * and how its Pendaftar are spread over the Ruang OKB, so the admin can prepare rooms before the day.
 */
export function OkbDayTabs({ schedule, today }: { schedule: OkbScheduleDay[]; today: string }) {
  return (
    <Tabs.Root defaultValue={schedule[0].date}>
      {schedule.length > 1 && (
        <Tabs.List aria-label="Tanggal OKB" className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          {schedule.map(day => {
            const isToday = day.date === today;
            return (
              <Tabs.Tab
                key={day.date}
                value={day.date}
                aria-label={`${formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${day.total} pendaftar`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 text-xs font-semibold text-slate-600 transition-colors duration-150 hover:border-emerald-200 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active]:border-emerald-600 data-[active]:bg-emerald-600 data-[active]:text-white motion-reduce:transition-none"
              >
                {isToday ? 'Hari ini' : formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-700 group-data-[active]:bg-white/20 group-data-[active]:text-white">{day.total}</span>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      )}

      {schedule.map(day => {
        const isToday = day.date === today;
        const roomCount = day.rooms?.length ?? 0;
        return (
          <Tabs.Panel key={day.date} value={day.date} className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <div className="flex items-center gap-3.5">
              <CalendarTile date={day.date} isToday={isToday} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {isToday && <span className="ml-2 hidden rounded-full bg-emerald-600 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white sm:inline">Hari ini</span>}
                </p>
                <ul aria-label="Gelombang OKB" className="mt-1.5 flex flex-wrap gap-1.5">
                  {day.waves.map(wave => (
                    <li key={wave.label} className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-sky-800">{waveLabel(wave, day.waves.length === 1)}</li>
                  ))}
                </ul>
              </div>
              <p className="shrink-0 text-right leading-tight">
                <span className="block text-2xl font-bold tabular-nums tracking-[-0.03em] text-slate-950">{day.total}</span>
                <span className="text-[11px] text-slate-500">pendaftar</span>
              </p>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ruang OKB</p>
                {day.rooms !== null && <p className="text-xs text-slate-500"><span className="font-bold tabular-nums text-slate-900">{roomCount}</span> ruang</p>}
              </div>
              <RoomList day={day} />
            </div>
          </Tabs.Panel>
        );
      })}
    </Tabs.Root>
  );
}
