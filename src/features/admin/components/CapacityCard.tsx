import Link from 'next/link';
import { ChartPie, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';
import { DashboardCardTitle } from './DashboardCardTitle';
import { CapacityDonut } from './DashboardCharts';
import { GenderSplitBar } from './GenderSplitBar';
import { REMAINING_SEAT_COLOR, classColor } from './dashboardColors';

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2.5 py-1.5 text-sm">
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="min-w-0 flex-1 truncate text-slate-600">{label}</span>
      <span className="font-bold tabular-nums text-slate-950">{value}</span>
    </li>
  );
}

/**
 * Kursi Siswa Baru as one total Kuota: a donut split by Pilihan Kelas with the empty seats in grey,
 * then the same seated Siswa Baru split by jenis kelamin. Slices only explain themselves on hover; they do not link,
 * because Data Pendaftar filters by Kelas Penempatan and every status, so the counts would not match.
 */
export function CapacityCard({ capacity, seatsByGender }: Pick<AdminDashboardSummary, 'capacity' | 'seatsByGender'>) {
  const used = capacity.reduce((sum, row) => sum + row.terpakai, 0);
  const total = capacity.reduce((sum, row) => sum + row.kuota, 0);
  const remaining = Math.max(0, total - used);
  const full = total > 0 && used >= total;
  const interest = capacity.map(row => ({ label: row.label, count: row.terpakai }));

  return (
    <Card className="min-w-0 rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-2 sm:p-6 sm:pb-3">
        <DashboardCardTitle icon={ChartPie} title="Kuota Siswa Baru" description="Kursi terisi per kelas" />
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', full ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100')}>
          {full ? 'Kuota penuh' : `Sisa ${remaining} kursi`}
        </span>
      </CardHeader>
      <CardContent className="p-5 pt-1 sm:p-6 sm:pt-1">
        <div className="grid items-center gap-4 sm:grid-cols-[184px_1fr]">
          <CapacityDonut rows={interest} used={used} total={total} />
          <ul aria-label="Peminat per Pilihan Kelas" className="divide-y divide-slate-100">
            {interest.map(row => <LegendRow key={row.label} color={classColor(row.label)} label={row.label} value={row.count} />)}
            <LegendRow color={REMAINING_SEAT_COLOR} label="Sisa kursi" value={remaining} />
          </ul>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <GenderSplitBar counts={seatsByGender} />
        </div>

        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Link href="/admin/pengaturan/kuota" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">Atur kuota<ChevronRight aria-hidden="true" className="size-3.5" /></Link>
        </div>
      </CardContent>
    </Card>
  );
}
