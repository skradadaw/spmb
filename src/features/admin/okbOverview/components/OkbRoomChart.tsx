'use client';

import { Bar, BarChart, BarStack, LabelList, Rectangle, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { OKB_WAVES, okbWaveLabel } from '@/features/admin/okbWave';
import type { OkbRoomLoad } from '../okbOverview';
import { WAVE_COLORS, waveKey } from '../okbOverviewColors';
import { waveChartConfig } from './OkbScheduleChart';

type Datum = Record<ReturnType<typeof waveKey>, number> & { nama: string; total: number };

const ROW_HEIGHT = 34;
const NAME_LENGTH = 14;

function GappedSegment(props: BarShapeProps) {
  if (!props.width) return null;
  return <Rectangle {...props} stroke="#ffffff" strokeWidth={2} />;
}

/** Nama ruangan yang panjang dipotong agar batangnya tetap lebar; nama lengkapnya ada di tooltip dan tabel pembaca layar. */
function RoomTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const nama = payload?.value ?? '';
  const short = nama.length > NAME_LENGTH ? `${nama.slice(0, NAME_LENGTH - 1)}…` : nama;
  return (
    <text x={x} y={y} dx={-6} textAnchor="end" dominantBaseline="central" className="text-xs" style={{ fill: '#475569' }}>
      <title>{nama}</title>
      {short}
    </text>
  );
}

function RoomTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) {
  const datum = payload?.[0]?.payload as Datum | undefined;
  if (!active || !datum) return null;
  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-900">{datum.nama}</p>
      {OKB_WAVES.filter(wave => datum[waveKey(wave)] > 0).map(wave => (
        <div key={wave} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-1 shrink-0 rounded-full" style={{ backgroundColor: WAVE_COLORS[wave] }} />
          <span className="font-semibold tabular-nums text-slate-950">{datum[waveKey(wave)]}</span>
          <span className="ml-auto pl-3 text-slate-500">{okbWaveLabel(wave)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-1.5">
        <span className="text-slate-500">Jumlah</span>
        <span className="font-bold tabular-nums text-slate-950">{datum.total} Pendaftar</span>
      </div>
    </div>
  );
}

/** Isi setiap Ruang OKB pada satu tanggal, ditumpuk per Gelombang OKB dengan warna yang sama seperti grafik Jadwal OKB. */
export function OkbRoomChart({ rooms }: { rooms: OkbRoomLoad[] }) {
  const data: Datum[] = rooms.map(room => ({
    nama: room.nama,
    total: room.total,
    ...(Object.fromEntries(OKB_WAVES.map(wave => [waveKey(wave), room.waves[wave] ?? 0])) as Record<ReturnType<typeof waveKey>, number>),
  }));
  const height = rooms.length * ROW_HEIGHT + 8;

  return (
    <figure className="min-w-0">
      <ChartContainer config={waveChartConfig} initialDimension={{ width: 320, height }} className="aspect-auto w-full" style={{ height }}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }} barCategoryGap="28%">
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="nama" width={104} tickLine={false} axisLine={false} interval={0} tick={<RoomTick />} />
          <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<RoomTooltip />} />
          <BarStack radius={[0, 4, 4, 0]}>
            {OKB_WAVES.map((wave, index) => (
              <Bar key={wave} dataKey={waveKey(wave)} name={okbWaveLabel(wave)} fill={`var(--color-${waveKey(wave)})`} maxBarSize={20} shape={GappedSegment}>
                {index === OKB_WAVES.length - 1 && <LabelList dataKey="total" position="right" offset={8} className="fill-slate-900 text-xs font-bold tabular-nums" />}
              </Bar>
            ))}
          </BarStack>
        </BarChart>
      </ChartContainer>
      {/* Tabel pengganti grafik untuk pembaca layar: setiap angka dapat dibaca tanpa tooltip. */}
      <table className="sr-only">
        <caption>Pendaftar per Ruang OKB dan Gelombang OKB</caption>
        <thead><tr><th scope="col">Ruang OKB</th>{OKB_WAVES.map(wave => <th key={wave} scope="col">{okbWaveLabel(wave)}</th>)}<th scope="col">Jumlah</th></tr></thead>
        <tbody>
          {data.map(row => (
            <tr key={row.nama}><th scope="row">{row.nama}</th>{OKB_WAVES.map(wave => <td key={wave}>{row[waveKey(wave)]}</td>)}<td>{row.total}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
