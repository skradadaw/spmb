import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

/** Kursi Siswa Baru per Pilihan Kelas, dihitung dengan aturan yang sama seperti menu Kuota Kelas. */
export function CapacityCard({ capacity, transfers }: Pick<AdminDashboardSummary, 'capacity' | 'transfers'>) {
  const used = capacity.reduce((sum, row) => sum + row.terpakai, 0);
  const total = capacity.reduce((sum, row) => sum + row.kuota, 0);
  const percentage = total === 0 ? 100 : Math.min(100, Math.round((used / total) * 100));
  const full = total > 0 && used >= total;

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
        <div>
          <div
            role="progressbar"
            aria-label={`Kuota Siswa Baru: ${used} dari ${total} kursi`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                full ? 'bg-rose-500' : 'bg-gradient-to-r from-[#087A20] to-[#22B43B]'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className={cn('mt-2 text-right text-xs tabular-nums', full ? 'font-semibold text-rose-700' : 'text-slate-500')}>
            {full ? 'Kuota Siswa Baru penuh' : `Sisa ${Math.max(0, total - used)} kursi`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sebaran Peminat
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {capacity.map((row) => (
              <div key={row.label} className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
                <p className="truncate text-xs font-medium text-slate-600">{row.label}</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-950">{row.terpakai}</p>
                <p className="text-[10px] text-slate-400">pendaftar</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span><strong className="tabular-nums text-slate-800">{transfers}</strong> Pindahan, di luar kuota</span>
          <Link href="/admin/pengaturan/kuota" className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline">Atur kuota<ChevronRight aria-hidden="true" className="size-3.5" /></Link>
        </div>
      </CardContent>
    </Card>
  );
}
