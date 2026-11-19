'use client';

import { Bar, BarChart, BarStack, LabelList, Rectangle, XAxis, type BarShapeProps } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { formatOkbDate } from '@/features/admin/okbDate';
import { OKB_WAVES, okbWaveLabel } from '@/features/admin/okbWave';
import type { OkbOverviewDay } from '../okbOverview';
import { WAVE_COLORS, waveKey } from '../okbOverviewColors';
import { countLabel, expectedCount } from './okbDayFormat';

type Datum = Record<ReturnType<typeof waveKey>, number> & { tanggal: string; total: number; day: OkbOverviewDay };

export const waveChartConfig = Object.fromEntries(
  OKB_WAVES.map(wave => [waveKey(wave), { label: okbWaveLabel(wave), color: WAVE_COLORS[wave] }]),
) satisfies ChartConfig;

/** Tinggi paling kecil; di layar lebar grafik ikut setinggi kartu tanggal terpilih di sampingnya. */
const MIN_HEIGHT = 248;

/** Garis permukaan 2px memisahkan segmen yang bersentuhan; tanggal yang tidak dipilih memudar agar pilihan terlihat. */
function stackShape(selected: string) {
  return function StackSegment(props: BarShapeProps) {
    if (!props.height) return null;
    const isSelected = (props.payload as Datum | undefined)?.tanggal === selected;
    return <Rectangle {...props} stroke="#ffffff" strokeWidth={2} fillOpacity={isSelected ? 1 : 0.55} />;
  };
}

/** Dua baris per tanggal: tanggal dan bulan, lalu hari atau "Hari ini". Warna lewat style agar tidak ditimpa gaya bawaan grafik. */
function DateTick({ x = 0, y = 0, payload, data, selected }: { x?: number; y?: number; payload?: { value: string }; data: Datum[]; selected: string }) {
  const datum = data.find(item => item.tanggal === payload?.value);
  if (!datum) return null;
  const isToday = datum.day.hariLagi === 0;
  const isSelected = datum.tanggal === selected;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" dy={14} className="text-[11px]" style={{ fill: isSelected ? '#0f172a' : '#64748b', fontWeight: isSelected ? 700 : 500 }}>
        {formatOkbDate(datum.tanggal, { day: 'numeric', month: 'short' })}
      </text>
      <text textAnchor="middle" dy={28} className="text-[10px]" style={{ fill: isToday ? '#047857' : '#94a3b8', fontWeight: isToday ? 700 : 400 }}>
        {isToday ? 'Hari ini' : formatOkbDate(datum.tanggal, { weekday: 'short' })}
      </text>
    </g>
  );
}

/** Nilai di depan, nama Gelombang di belakangnya, dengan garis kunci warna; total di baris terakhir. */
function ScheduleTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) {
  const datum = payload?.[0]?.payload as Datum | undefined;
  if (!active || !datum) return null;
  const isToday = datum.day.hariLagi === 0;
  return (
    <div className="grid min-w-48 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-900">
        {formatOkbDate(datum.tanggal, { weekday: 'long', day: 'numeric', month: 'long' })}
        {isToday && <span className="ml-1.5 font-bold text-emerald-700">Hari ini</span>}
      </p>
      {datum.day.waves.map(wave => (
        <div key={wave.gelombang} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-1 shrink-0 rounded-full" style={{ backgroundColor: WAVE_COLORS[wave.gelombang] }} />
          <span className="font-semibold tabular-nums text-slate-950">{countLabel(wave, isToday)}</span>
          <span className="ml-auto pl-3 text-slate-500">{okbWaveLabel(wave.gelombang)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-1.5">
        <span className="text-slate-500">Jumlah</span>
        <span className="font-bold tabular-nums text-slate-950">{datum.total} Pendaftar</span>
      </div>
      <p className="text-[10px] text-slate-400">Klik untuk melihat detail tanggal ini</p>
    </div>
  );
}

/**
 * Pendaftar per tanggal OKB, ditumpuk per Gelombang OKB. Klik di mana saja pada kolom tanggal untuk memilihnya;
 * tombol tanggal di bawah grafik memberi pilihan yang sama lewat keyboard.
 */
export function OkbScheduleChart({ days, selected, onSelect }: { days: OkbOverviewDay[]; selected: string; onSelect: (tanggal: string) => void }) {
  const data: Datum[] = days.map(day => {
    const isToday = day.hariLagi === 0;
    const counts = Object.fromEntries(OKB_WAVES.map(wave => {
      const item = day.waves.find(entry => entry.gelombang === wave);
      return [waveKey(wave), item ? expectedCount(item, isToday) : 0];
    })) as Record<ReturnType<typeof waveKey>, number>;
    return { ...counts, tanggal: day.tanggal, total: day.pendaftar, day };
  });
  const shape = stackShape(selected);
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <figure className="flex min-w-0 flex-1 flex-col">
      <figcaption className="sr-only">Grafik Jadwal OKB: {days.length} tanggal, {total} Pendaftar, ditumpuk per Gelombang OKB. Angka lengkap ada di tampilan Tabel.</figcaption>
      <ChartContainer config={waveChartConfig} initialDimension={{ width: 560, height: MIN_HEIGHT }} className="aspect-auto w-full flex-1" style={{ minHeight: MIN_HEIGHT }}>
        <BarChart
          data={data}
          margin={{ top: 22, right: 8, bottom: 4, left: 8 }}
          barCategoryGap="30%"
          className="cursor-pointer"
          onClick={state => {
            const index = Number(state?.activeIndex);
            if (Number.isInteger(index) && data[index]) onSelect(data[index].tanggal);
          }}
        >
          <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ScheduleTooltip />} />
          {/* tickFormatter hanya untuk mengukur lebar label saat memilih tanggal yang ditampilkan; isinya digambar DateTick. */}
          <XAxis
            dataKey="tanggal"
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            height={40}
            interval="preserveStartEnd"
            minTickGap={4}
            tickFormatter={(value: string) => formatOkbDate(value, { day: 'numeric', month: 'short' })}
            tick={<DateTick data={data} selected={selected} />}
          />
          <BarStack radius={[4, 4, 0, 0]}>
            {OKB_WAVES.map((wave, index) => (
              <Bar key={wave} dataKey={waveKey(wave)} name={okbWaveLabel(wave)} fill={`var(--color-${waveKey(wave)})`} maxBarSize={24} shape={shape}>
                {index === OKB_WAVES.length - 1 && <LabelList dataKey="total" position="top" offset={6} className="fill-slate-700 text-[11px] font-semibold tabular-nums" />}
              </Bar>
            ))}
          </BarStack>
        </BarChart>
      </ChartContainer>
    </figure>
  );
}
