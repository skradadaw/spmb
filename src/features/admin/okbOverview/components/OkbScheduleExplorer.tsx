'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { Tabs as DateTabs } from '@base-ui/react/tabs';
import { AlertTriangle, CalendarDays, ChartColumn, CheckCircle2, DoorOpen, IdCard, ScanLine, Table2 } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardCardTitle } from '@/features/admin/components/DashboardCardTitle';
import { CalendarTile } from '@/features/admin/components/OkbDayTabs';
import { classColor, genderColor } from '@/features/admin/components/dashboardColors';
import { nameTagHref } from '@/features/admin/nameTag/nameTagGroups';
import { formatOkbDate } from '@/features/admin/okbDate';
import { OKB_WAVES, okbWaveLabel } from '@/features/admin/okbWave';
import { ruangOkbKey } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import type { CompositionPart, OkbOverviewDay } from '../okbOverview';
import { WAVE_COLORS } from '../okbOverviewColors';
import { OkbRadialMeter } from './OkbRadialMeter';
import { OkbRoomChart } from './OkbRoomChart';
import { OkbScheduleChart } from './OkbScheduleChart';
import { OVERVIEW_CARD, OVERVIEW_LINK, OVERVIEW_SUBHEADING, countLabel, expectedCount, longDate, relativeDayLabel } from './okbDayFormat';

const PANEL = 'min-w-0 rounded-xl border border-slate-100 bg-white p-4';
/** Ruang yang belum dipakai ditampilkan secukupnya; sisanya cukup dihitung. */
const UNUSED_ROOM_LIMIT = 8;

/** Name Tag dibuka pada Gelombang pertama yang masih punya Pendaftar Terjadwal OKB tanpa ruangan, bila ada. */
function nameTagTarget(day: OkbOverviewDay) {
  const scheduled = day.waves.filter(wave => wave.terjadwal > 0);
  return scheduled.find(wave => day.tanpaRuang.waves[wave.gelombang] > 0) ?? scheduled[0];
}

/** Kartu samping tanggal terpilih: hari ini kehadiran dan Scan Kehadiran, tanggal lain kesiapan Ruang OKB dan Name Tag. */
function DaySpotlight({ day }: { day: OkbOverviewDay }) {
  const isToday = day.hariLagi === 0;
  const withRoom = day.pendaftar - day.tanpaRuang.total;
  const target = nameTagTarget(day);
  const needsRoom = day.tanpaRuang.total > 0 && target && day.tanpaRuang.waves[target.gelombang] > 0;

  return (
    <aside aria-label={`Ringkasan ${longDate(day.tanggal)}`} className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-3">
        <CalendarTile date={day.tanggal} isToday={isToday} />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-slate-900">{longDate(day.tanggal)}</p>
          <span className={cn('mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold', isToday ? 'bg-emerald-600 text-white' : 'bg-sky-50 text-sky-800 ring-1 ring-sky-100')}>
            {relativeDayLabel(day.hariLagi)}
          </span>
        </div>
      </div>

      <div className="my-4 flex flex-1 flex-col items-center justify-center">
        {day.pendaftar === 0 ? (
          <p className="text-center text-sm text-slate-500">Tidak ada lagi Pendaftar Terjadwal OKB pada tanggal ini.</p>
        ) : isToday ? (
          <>
            <OkbRadialMeter value={day.hadir} max={day.total} label="hadir" />
            <p className="mt-2 text-center text-xs text-slate-600">
              Pendaftar hadir{day.terjadwal > 0 ? <> · <span className="font-semibold text-slate-900">{day.terjadwal}</span> belum hadir</> : ' · semua sudah hadir'}
            </p>
          </>
        ) : (
          <>
            <OkbRadialMeter value={withRoom} max={day.pendaftar} label="punya Ruang OKB" />
            <p className="mt-2 text-center text-xs text-slate-600">
              punya Ruang OKB{day.tanpaRuang.total > 0 && <> · <span className="font-semibold text-amber-700">{day.tanpaRuang.total}</span> belum</>}
            </p>
          </>
        )}
      </div>

      <div className="grid gap-2">
        {isToday && <ButtonLink href="/admin/scan" size="lg"><ScanLine aria-hidden="true" />Scan Kehadiran</ButtonLink>}
        {target && (
          <ButtonLink href={nameTagHref(day.tanggal, target.gelombang)} size="lg" variant={needsRoom && !isToday ? 'default' : 'outline'}>
            <IdCard aria-hidden="true" />{needsRoom ? 'Bagi Ruang OKB' : 'Cetak Name Tag'}
          </ButtonLink>
        )}
      </div>
    </aside>
  );
}

function WavePanel({ day }: { day: OkbOverviewDay }) {
  const id = useId();
  const isToday = day.hariLagi === 0;
  return (
    <section aria-labelledby={id} className={PANEL}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={id} className={OVERVIEW_SUBHEADING}>Gelombang OKB</h3>
        <p className="text-xs tabular-nums text-slate-500">{countLabel(day, isToday)}</p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {day.waves.map(wave => {
          const name = okbWaveLabel(wave.gelombang);
          return (
            <li key={wave.gelombang} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: WAVE_COLORS[wave.gelombang] }} />
                <span className="text-sm font-semibold text-slate-900">{name}</span>
                <span className="ml-auto text-sm tabular-nums text-slate-600">{countLabel(wave, isToday)}</span>
              </div>
              {isToday && <Progress value={wave.total ? Math.round((wave.hadir / wave.total) * 100) : 0} aria-label={`Kehadiran ${name}`} className="mt-2.5" />}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {/* Halaman Name Tag hanya memuat Terjadwal OKB; tanpa mereka, tautan akan membuka kelompok lain. */}
                {wave.terjadwal > 0 && <Link href={nameTagHref(day.tanggal, wave.gelombang)} aria-label={`Name Tag ${name}`} className={OVERVIEW_LINK}>Name Tag</Link>}
                <Link href={`/admin/pendaftar?gelombang=${wave.gelombang}`} aria-label={`Data Pendaftar ${name}`} className={OVERVIEW_LINK}>Data Pendaftar</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RoomPanel({ day, roomNames }: { day: OkbOverviewDay; roomNames: string[] | null }) {
  const id = useId();
  const used = new Set(day.rooms.map(room => ruangOkbKey(room.nama)));
  const unused = roomNames?.filter(nama => !used.has(ruangOkbKey(nama))) ?? [];
  const target = nameTagTarget(day);
  const canAssign = target && day.tanpaRuang.waves[target.gelombang] > 0;

  return (
    <section aria-labelledby={id} className={PANEL}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={id} className={OVERVIEW_SUBHEADING}>Pembagian Ruang OKB</h3>
        <p className="text-xs text-slate-500">
          <span className="font-bold tabular-nums text-slate-900">{day.rooms.length}</span> ruang dipakai{roomNames && roomNames.length > 0 ? ` dari ${roomNames.length}` : ''}
        </p>
      </div>
      <div className="mt-3 space-y-3">
        {day.rooms.length > 0
          ? <OkbRoomChart rooms={day.rooms} />
          : <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-3 py-4 text-center text-xs text-slate-500">Belum ada Pendaftar yang mendapat Ruang OKB.</p>}

        {day.tanpaRuang.total > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-amber-600" />
            <span className="min-w-0 flex-1">Belum mendapat Ruang OKB</span>
            <span className="font-bold tabular-nums">{day.tanpaRuang.total}</span>
            {canAssign && <Link href={nameTagHref(day.tanggal, target.gelombang)} className="rounded font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Bagi Ruang OKB</Link>}
          </div>
        ) : day.pendaftar > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-700"><CheckCircle2 aria-hidden="true" className="size-3.5" />Semua Pendaftar sudah mendapat Ruang OKB.</p>
        )}

        {unused.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-slate-500">Belum dipakai pada tanggal ini</p>
            <ul aria-label="Ruang OKB yang belum dipakai" className="mt-1.5 flex flex-wrap gap-1.5">
              {unused.slice(0, UNUSED_ROOM_LIMIT).map(nama => (
                <li key={nama} className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                  <DoorOpen aria-hidden="true" className="size-3 shrink-0 text-slate-400" /><span className="truncate">{nama}</span>
                </li>
              ))}
              {unused.length > UNUSED_ROOM_LIMIT && <li className="px-1 py-0.5 text-[11px] text-slate-500">+{unused.length - UNUSED_ROOM_LIMIT} lainnya</li>}
            </ul>
          </div>
        )}
        {roomNames?.length === 0 && (
          <p className="text-xs text-slate-500">Daftar Ruang OKB masih kosong. <Link href="/admin/pengaturan/ruang-okb" className={OVERVIEW_LINK}>Siapkan di Pengaturan</Link></p>
        )}
      </div>
    </section>
  );
}

/** Satu keseluruhan dibagi beberapa bagian: batang tipis tanpa teks, lalu nama dan angka tiap bagian dengan warnanya. */
function CompositionBar({ title, parts, colorOf }: { title: string; parts: CompositionPart[]; colorOf: (label: string) => string }) {
  const summary = parts.map(part => `${part.label} ${part.count}`).join(', ');
  return (
    <div>
      <p className="text-xs font-medium text-slate-600">{title}</p>
      <div role="img" aria-label={`${title}: ${summary}`} className="mt-1.5 flex h-2 gap-0.5">
        {parts.filter(part => part.count > 0).map(part => (
          <span key={part.label} className="h-full min-w-1 rounded-full" style={{ flexGrow: part.count, flexBasis: 0, backgroundColor: colorOf(part.label) }} />
        ))}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {parts.map(part => (
          <li key={part.label} className="flex min-w-0 items-center gap-1.5 text-xs">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: colorOf(part.label) }} />
            <span className="min-w-0 flex-1 truncate text-slate-600">{part.label}</span>
            <span className="font-semibold tabular-nums text-slate-900">{part.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompositionPanel({ day }: { day: OkbOverviewDay }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn(PANEL, 'md:col-span-2 xl:col-span-1')}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={id} className={OVERVIEW_SUBHEADING}>Komposisi Pendaftar</h3>
        <p className="text-xs text-slate-500"><span className="font-bold tabular-nums text-slate-900">{day.pendaftar}</span> Pendaftar</p>
      </div>
      {day.pendaftar === 0 ? (
        <p className="mt-3 text-xs text-slate-500">Tidak ada Pendaftar yang ditunggu pada tanggal ini.</p>
      ) : (
        <div className="mt-3 space-y-4">
          <CompositionBar title="Pilihan Kelas" parts={day.komposisi.kelas} colorOf={classColor} />
          <CompositionBar title="Jenis kelamin" parts={day.komposisi.gender} colorOf={genderColor} />
          <div>
            <p className="text-xs font-medium text-slate-600">Jenis Pendaftaran</p>
            <ul aria-label="Jenis Pendaftaran" className="mt-1.5 flex flex-wrap gap-1.5">
              {day.komposisi.jenis.map(part => (
                <li key={part.label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
                  {part.label}<span className="font-semibold tabular-nums text-slate-900">{part.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

/** Kembaran grafik dalam bentuk tabel: semua angka terbaca tanpa tooltip dan tanpa membedakan warna. */
function ScheduleTable({ days, selected, onSelect }: { days: OkbOverviewDay[]; selected: string; onSelect: (tanggal: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full min-w-[32rem] text-sm">
        <caption className="sr-only">Pendaftar per tanggal OKB dan Gelombang OKB</caption>
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">Tanggal</th>
            {OKB_WAVES.map(wave => <th key={wave} scope="col" className="px-3 py-2 text-right font-semibold">{okbWaveLabel(wave)}</th>)}
            <th scope="col" className="px-3 py-2 text-right font-semibold">Jumlah</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Hadir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {days.map(day => {
            const isToday = day.hariLagi === 0;
            return (
              <tr key={day.tanggal} className={cn('transition-colors', day.tanggal === selected ? 'bg-emerald-50/60' : 'hover:bg-slate-50')}>
                <th scope="row" className="px-3 py-2 text-left font-medium text-slate-900">
                  <button type="button" onClick={() => onSelect(day.tanggal)} aria-pressed={day.tanggal === selected} className="rounded text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    {formatOkbDate(day.tanggal, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </button>
                  {isToday && <span className="ml-2 rounded-full bg-emerald-600 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">Hari ini</span>}
                </th>
                {OKB_WAVES.map(wave => {
                  const item = day.waves.find(entry => entry.gelombang === wave);
                  return <td key={wave} className="px-3 py-2 text-right tabular-nums text-slate-700">{item ? expectedCount(item, isToday) : '–'}</td>;
                })}
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-950">{day.pendaftar}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">{isToday ? day.hadir : '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Jadwal OKB yang bisa dijelajahi: grafik (atau tabel) semua tanggal mendatang, ringkasan tanggal terpilih di sampingnya,
 * lalu Gelombang OKB, Pembagian Ruang OKB, dan komposisi Pendaftar tanggal itu. Tanggal dipilih lewat grafik atau tombol tanggal.
 */
export function OkbScheduleExplorer({ days, roomNames }: { days: OkbOverviewDay[]; roomNames: string[] | null }) {
  const [picked, setPicked] = useState<string | null>(null);
  // Tanggal yang dipilih bisa hilang setelah data diperbarui (misalnya jadwalnya dipindah); kembali ke tanggal terdekat.
  const day = days.find(item => item.tanggal === picked) ?? days[0];

  return (
    <Card className={OVERVIEW_CARD}>
      <Tabs defaultValue="grafik" className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
          <DashboardCardTitle icon={CalendarDays} title="Jadwal OKB" description="Tanggal hari ini dan seterusnya. Pilih tanggal untuk melihat Gelombang OKB, Ruang OKB, dan Pendaftarnya." />
          {day && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">{days.length} tanggal</span>
              <TabsList aria-label="Tampilan Jadwal OKB">
                <TabsTrigger value="grafik" className="px-2.5 text-xs"><ChartColumn aria-hidden="true" />Grafik</TabsTrigger>
                <TabsTrigger value="tabel" className="px-2.5 text-xs"><Table2 aria-hidden="true" />Tabel</TabsTrigger>
              </TabsList>
            </div>
          )}
        </div>

        {!day ? (
          <div className="mx-5 mb-5 flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center sm:mx-6 sm:mb-6">
            <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
            <p className="text-sm text-slate-500">Belum ada Jadwal OKB mendatang.</p>
            <p className="text-xs text-slate-400">Jadwal OKB ditetapkan di detail Pendaftar yang sudah Terverifikasi.</p>
          </div>
        ) : (
          <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
              <div className="flex min-w-0 flex-col">
                <TabsContent value="grafik" className="flex flex-col"><OkbScheduleChart days={days} selected={day.tanggal} onSelect={setPicked} /></TabsContent>
                <TabsContent value="tabel"><ScheduleTable days={days} selected={day.tanggal} onSelect={setPicked} /></TabsContent>
              </div>
              <DaySpotlight day={day} />
            </div>

            <DateTabs.Root value={day.tanggal} onValueChange={value => setPicked(String(value))}>
              <DateTabs.List activateOnFocus aria-label="Tanggal OKB" className="flex gap-1.5 overflow-x-auto border-t border-slate-100 pt-4 pb-1">
                {days.map(item => (
                  <DateTabs.Tab
                    key={item.tanggal}
                    value={item.tanggal}
                    aria-label={`${longDate(item.tanggal)}, ${item.pendaftar} Pendaftar`}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-1 pl-3 text-xs font-semibold text-slate-600 transition-colors duration-150 hover:border-emerald-200 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active]:border-emerald-600 data-[active]:bg-emerald-600 data-[active]:text-white motion-reduce:transition-none"
                  >
                    {item.hariLagi === 0 ? 'Hari ini' : formatOkbDate(item.tanggal, { weekday: 'short', day: 'numeric', month: 'short' })}
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-700 group-data-[active]:bg-white/20 group-data-[active]:text-white">{item.pendaftar}</span>
                  </DateTabs.Tab>
                ))}
              </DateTabs.List>
              {days.map(item => (
                <DateTabs.Panel key={item.tanggal} value={item.tanggal} className="mt-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_minmax(0,0.9fr)]">
                    <WavePanel day={item} />
                    <RoomPanel day={item} roomNames={roomNames} />
                    <CompositionPanel day={item} />
                  </div>
                </DateTabs.Panel>
              ))}
            </DateTabs.Root>
          </div>
        )}
      </Tabs>
    </Card>
  );
}
