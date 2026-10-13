import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminDashboardSummary } from '../contracts';

const linkClass = 'group inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** Perlu Perhatian summary; each number opens Data Peserta with the matching filter. */
export function AttentionCard({ attention }: { attention: AdminDashboardSummary['attention'] }) {
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)]">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Link href="/admin/pendaftar?perhatian=semua" className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><AlertTriangle aria-hidden="true" className="size-5" /></span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold leading-5 text-slate-500">Perlu perhatian</span>
            <span className="block text-sm font-semibold text-slate-950 group-hover:underline">{attention.any} peserta perlu ditangani</span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pendaftar?perhatian=nisn" className={linkClass}>
            <span className="tabular-nums text-amber-700">{attention.nisn}</span>NISN tidak sesuai<ChevronRight aria-hidden="true" className="size-3.5 text-slate-400" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
