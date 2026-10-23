import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

/** Kursi Siswa Baru per Pilihan Kelas, dihitung dengan aturan yang sama seperti menu Kuota Kelas. */
export function CapacityCard({ capacity, transfers }: Pick<AdminDashboardSummary, 'capacity' | 'transfers'>) {
  const used = capacity.reduce((sum, row) => sum + row.terpakai, 0);
  const total = capacity.reduce((sum, row) => sum + row.kuota, 0);
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="flex-row items-start justify-between space-y-0 p-5 pb-3 sm:p-6 sm:pb-4">
        <CardTitle className="pt-1 text-base font-bold tracking-[-0.02em]">Kuota Siswa Baru</CardTitle>
        <div className="text-right tabular-nums">
          <p className="leading-none"><span className="text-2xl font-bold tracking-[-0.02em] text-slate-950">{used}</span><span className="text-sm font-medium text-slate-400"> / {total}</span></p>
          <p className="mt-1.5 text-xs text-slate-500">kursi terisi · sisa {Math.max(0, total - used)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-1 sm:p-6 sm:pt-1">
        {capacity.map(row => {
          const percentage = row.kuota === 0 ? 100 : Math.min(100, Math.round((row.terpakai / row.kuota) * 100));
          const full = row.terpakai >= row.kuota;
          const remaining = Math.max(0, row.kuota - row.terpakai);
          return (
            <div key={row.label}>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">{row.label}</span>
                <span className="shrink-0 tabular-nums"><span className="text-sm font-bold text-slate-950">{row.terpakai}</span><span className="text-xs font-medium text-slate-400"> / {row.kuota}</span></span>
              </div>
              <div role="progressbar" aria-label={`${row.label}: ${row.terpakai} dari ${row.kuota} kursi`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', full ? 'bg-rose-500' : 'bg-gradient-to-r from-[#087A20] to-[#22B43B]')} style={{ width: `${percentage}%` }} />
              </div>
              <p className={cn('mt-1.5 text-right text-xs tabular-nums', full ? 'font-semibold text-rose-700' : 'text-slate-500')}>{full ? 'Penuh' : `Sisa ${remaining} kursi`}</p>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span><strong className="tabular-nums text-slate-800">{transfers}</strong> Pindahan, di luar kuota</span>
          <Link href="/admin/kuota" className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline">Atur kuota<ChevronRight aria-hidden="true" className="size-3.5" /></Link>
        </div>
      </CardContent>
    </Card>
  );
}
