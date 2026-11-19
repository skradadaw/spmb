'use client';

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { METER_COLORS } from '../okbOverviewColors';

const config = { meter: { label: 'Meter', color: METER_COLORS.fill } } satisfies ChartConfig;
const SIZE = 152;

/**
 * Satu rasio terhadap batasnya sebagai cincin: isian hijau di atas lintasan hijau muda dari ramp yang sama.
 * Angkanya tercetak di tengah, jadi cincin tidak perlu tooltip.
 */
export function OkbRadialMeter({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div role="img" aria-label={`${value} dari ${max} Pendaftar ${label}`} className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      {/* Lintasan = METER_COLORS.track; ditulis sebagai kelas karena gaya bawaan ChartContainer menimpa atribut fill. */}
      <ChartContainer
        config={config}
        initialDimension={{ width: SIZE, height: SIZE }}
        className="aspect-square h-full w-full [&_.recharts-radial-bar-background-sector]:fill-[#d1fae5]"
      >
        <RadialBarChart data={[{ key: 'meter', value: percent, fill: 'var(--color-meter)' }]} startAngle={90} endAngle={-270} innerRadius={56} outerRadius={72} barSize={14}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background cornerRadius={8} />
        </RadialBarChart>
      </ChartContainer>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none tracking-[-0.04em] text-slate-950">{value}</span>
        <span className="mt-1 text-[11px] text-slate-500">dari {max}</span>
        <span className="mt-0.5 text-[11px] font-semibold text-emerald-700">{percent}%</span>
      </div>
    </div>
  );
}
