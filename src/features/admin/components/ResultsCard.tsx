import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminDashboardSummary } from '../contracts';

function Figure({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <span className="block text-xs font-semibold text-slate-500">{label}</span>
      <span className="mt-1 block text-xl font-bold tabular-nums tracking-[-0.03em] text-slate-950 group-hover:underline">{value}</span>
    </Link>
  );
}

/** Report figures for the school's leadership; the full data lives in the Excel export. */
export function ResultsCard({ totalRegistrations, results, acceptedByClass }: Pick<AdminDashboardSummary, 'totalRegistrations' | 'results' | 'acceptedByClass'>) {
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-base font-bold tracking-[-0.02em]">Rekap pendaftaran</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Figure label="Total pendaftar" value={totalRegistrations} href="/admin/pendaftar" />
          <Figure label="Diterima" value={results.accepted} href="/admin/pendaftar?status=Diterima" />
          <Figure label="Ditolak" value={results.rejected} href="/admin/pendaftar?status=Ditolak" />
          <Figure label="Dibatalkan" value={results.withdrawn} href="/admin/pendaftar?status=Dibatalkan" />
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          Siswa Baru diterima per kelas: {acceptedByClass.map(({ label, count }) => <span key={label} className="mr-3 inline-block"><span className="font-semibold text-slate-700">{label}</span> <span className="tabular-nums">{count}</span></span>)}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">Total pendaftar tidak menghitung yang belum selesai mengunggah Berkas.</p>
      </CardContent>
    </Card>
  );
}
