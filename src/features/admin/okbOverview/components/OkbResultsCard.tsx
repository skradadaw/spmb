'use client';

import { Bar, BarChart, BarStack, LabelList, Rectangle, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { ChartColumn, ChevronRight, Gavel, Megaphone, Table2, TriangleAlert } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import { DashboardCardTitle } from '@/features/admin/components/DashboardCardTitle';
import { okbWaveLabel } from '@/features/admin/okbWave';
import { cn } from '@/lib/utils';
import { RESULT_COLORS } from '../okbOverviewColors';
import { OVERVIEW_CARD, OVERVIEW_SUBHEADING } from './okbDayFormat';

const config = {
  diterima: { label: 'Diterima', color: RESULT_COLORS.diterima },
  ditolak: { label: 'Ditolak', color: RESULT_COLORS.ditolak },
  belum: { label: 'Belum diputuskan', color: RESULT_COLORS.belum },
} satisfies ChartConfig;
const SERIES = ['diterima', 'ditolak', 'belum'] as const;

type Row = { gelombang: string; diterima: number; ditolak: number; belum: number; total: number; diumumkan: number };

function GappedSegment(props: BarShapeProps) {
  if (!props.width) return null;
  return <Rectangle {...props} stroke="#ffffff" strokeWidth={2} />;
}

/** Satu baris tanpa pembungkusan otomatis Recharts; warna lewat style agar tidak ditimpa gaya bawaan grafik. */
function WaveTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return <text x={x} y={y} dx={-8} textAnchor="end" dominantBaseline="central" className="text-xs" style={{ fill: '#475569' }}>{payload?.value}</text>;
}

function ResultsChart({ rows }: { rows: Row[] }) {
  const height = rows.length * 46 + 44;
  return (
    <ChartContainer config={config} initialDimension={{ width: 420, height }} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 4 }} barCategoryGap="30%">
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="gelombang" width={96} tickLine={false} axisLine={false} interval={0} tick={<WaveTick />} />
        <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent indicator="line" />} />
        {/* Legenda mengikuti urutan blok di batang, bukan urutan abjad bawaan Recharts. */}
        <ChartLegend verticalAlign="top" itemSorter={item => SERIES.indexOf(item.dataKey as (typeof SERIES)[number])} content={<ChartLegendContent className="justify-start pb-4" />} />
        <BarStack radius={[0, 4, 4, 0]}>
          {SERIES.map((key, index) => (
            <Bar key={key} dataKey={key} fill={`var(--color-${key})`} maxBarSize={22} shape={GappedSegment}>
              {index === SERIES.length - 1 && <LabelList dataKey="total" position="right" offset={8} className="fill-slate-900 text-xs font-bold tabular-nums" />}
            </Bar>
          ))}
        </BarStack>
      </BarChart>
    </ChartContainer>
  );
}

/** Satu meter per Gelombang: berapa Keputusan Penerimaan yang sudah dapat dilihat orang tua. */
function AnnouncementProgress({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className={OVERVIEW_SUBHEADING}>Pengumuman Hasil OKB</p>
      <ul aria-label="Pengumuman Hasil OKB per Gelombang" className="mt-3 space-y-2.5">
        {rows.map(row => {
          const decided = row.diterima + row.ditolak;
          const percent = decided ? Math.round((row.diumumkan / decided) * 100) : 0;
          return (
            <li key={row.gelombang} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-xs sm:grid-cols-[6rem_minmax(0,1fr)_9.5rem]">
              <span className="font-medium text-slate-700">{row.gelombang}</span>
              <Progress value={percent} aria-label={`Pengumuman ${row.gelombang}`} />
              <span className="col-start-2 tabular-nums text-slate-500 sm:col-start-auto sm:text-right">
                {decided ? <><span className="font-semibold text-slate-900">{row.diumumkan}</span> dari {decided} diumumkan</> : 'Belum ada keputusan'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ResultsTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full min-w-[28rem] text-sm">
        <caption className="sr-only">Hasil OKB per Gelombang OKB</caption>
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">Gelombang</th>
            {SERIES.map(key => <th key={key} scope="col" className="px-3 py-2 text-right font-semibold">{config[key].label}</th>)}
            <th scope="col" className="px-3 py-2 text-right font-semibold">Diumumkan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => (
            <tr key={row.gelombang}>
              <th scope="row" className="px-3 py-2 text-left font-medium text-slate-900">{row.gelombang}</th>
              {SERIES.map(key => <td key={key} className="px-3 py-2 text-right tabular-nums text-slate-700">{row[key]}</td>)}
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">{row.diumumkan} dari {row.diterima + row.ditolak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Keputusan Penerimaan per Gelombang OKB bagi Pendaftar yang sudah mengikuti OKB, dengan angka yang sama seperti tab Pengumuman.
 * Hasil yang belum diumumkan dan Nomor VA yang kurang diumumkan di bawahnya, lalu tab Pengumuman satu klik dari situ.
 */
export function OkbResultsCard({ results }: { results: WaveSummary[] }) {
  const rows: Row[] = results.map(summary => {
    const diterima = summary.diterima.announced + summary.diterima.pending;
    const ditolak = summary.ditolak.announced + summary.ditolak.pending;
    return {
      gelombang: okbWaveLabel(summary.wave), diterima, ditolak, belum: summary.undecided,
      total: diterima + ditolak + summary.undecided, diumumkan: summary.diterima.announced + summary.ditolak.announced,
    };
  });
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const toAnnounce = results.reduce((sum, summary) => sum + summary.diterima.pending + summary.ditolak.pending, 0);
  const missingVa = results.reduce((sum, summary) => sum + summary.missingVa, 0);

  return (
    <Card className={cn(OVERVIEW_CARD, 'flex flex-col')}>
      <Tabs defaultValue="grafik" className="flex-1 gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
          <DashboardCardTitle icon={Gavel} title="Hasil OKB per Gelombang" description="Keputusan Penerimaan bagi Pendaftar yang sudah mengikuti OKB" />
          {total > 0 && (
            <TabsList aria-label="Tampilan Hasil OKB">
              <TabsTrigger value="grafik" className="px-2.5 text-xs"><ChartColumn aria-hidden="true" />Grafik</TabsTrigger>
              <TabsTrigger value="tabel" className="px-2.5 text-xs"><Table2 aria-hidden="true" />Tabel</TabsTrigger>
            </TabsList>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
          {/* Isi mengisi sisa tinggi kartu, sehingga baris tautan selalu berada di dasar kartu. */}
          <div className="flex-1">
            {total === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
                <Gavel aria-hidden="true" className="size-5 text-slate-400" />
                <p className="text-sm text-slate-500">Belum ada Pendaftar yang mengikuti OKB.</p>
              </div>
            ) : (
              <>
                <TabsContent value="grafik"><ResultsChart rows={rows} /></TabsContent>
                <TabsContent value="tabel"><ResultsTable rows={rows} /></TabsContent>
                <AnnouncementProgress rows={rows} />
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Megaphone aria-hidden="true" className="size-3.5 text-slate-400" />
              {toAnnounce > 0 ? <><span className="font-bold tabular-nums text-slate-900">{toAnnounce}</span> hasil siap diumumkan</> : 'Tidak ada hasil baru untuk diumumkan'}
            </span>
            {missingVa > 0 && (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                <TriangleAlert aria-hidden="true" className="size-3.5 text-amber-600" />
                <span className="font-bold tabular-nums">{missingVa}</span> Diterima belum punya Nomor VA
              </span>
            )}
            <ButtonLink href="/admin/okb/pengumuman" variant="outline" size="sm" className="ml-auto">Buka Pengumuman<ChevronRight aria-hidden="true" /></ButtonLink>
          </div>
        </div>
      </Tabs>
    </Card>
  );
}
