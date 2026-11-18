'use client';

import { Label, Pie, PieChart, Sector } from 'recharts';
import type { PieSectorShapeProps } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { LabelCount } from '../contracts';
import { CLASS_COLORS, REMAINING_SEAT_COLOR, classKey } from './dashboardColors';

const classConfig: ChartConfig = Object.fromEntries(
  Object.entries(CLASS_COLORS).map(([label, color]) => [classKey(label), { label, color }]),
);

/** The hovered slice grows a little so the admin sees which Pilihan Kelas the tooltip is about. */
function DonutSlice({ isActive, outerRadius = 0, ...props }: PieSectorShapeProps) {
  return <Sector {...props} outerRadius={isActive ? Number(outerRadius) + 5 : outerRadius} />;
}

/**
 * One ring for the whole Kuota: a slice per Pilihan Kelas plus the empty seats in grey,
 * so the admin sees at a glance how full the school is and which class draws the most interest.
 */
export function CapacityDonut({ rows, used, total }: { rows: LabelCount[]; used: number; total: number }) {
  const remaining = Math.max(0, total - used);
  const config: ChartConfig = { ...classConfig, sisa: { label: 'Sisa kursi', color: REMAINING_SEAT_COLOR } };
  const slices = [
    ...rows.map(row => ({ key: classKey(row.label), value: row.count, fill: `var(--color-${classKey(row.label)})` })),
    { key: 'sisa', value: remaining, fill: 'var(--color-sisa)' },
  ].filter(slice => slice.value > 0);
  const empty = slices.length === 0;

  return (
    <div role="img" aria-label={`Kuota Siswa Baru: ${used} dari ${total} kursi terisi`}>
      <ChartContainer config={config} className="mx-auto aspect-square h-[184px]" initialDimension={{ width: 184, height: 184 }}>
        <PieChart>
          {!empty && <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="key" hideLabel />} />}
          <Pie
            data={empty ? [{ key: 'sisa', value: 1, fill: 'var(--color-sisa)' }] : slices}
            dataKey="value"
            nameKey="key"
            innerRadius={60}
            outerRadius={82}
            paddingAngle={empty ? 0 : 1.5}
            cornerRadius={4}
            strokeWidth={0}
            shape={DonutSlice}
          >
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null;
                const cy = viewBox.cy ?? 0;
                return (
                  <text x={viewBox.cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={cy - 6} className="fill-slate-950 text-3xl font-bold tabular-nums">{used}</tspan>
                    <tspan x={viewBox.cx} y={cy + 18} className="fill-slate-500 text-xs">dari {total} kursi</tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
