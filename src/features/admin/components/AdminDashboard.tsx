import { BookOpenCheck, ClipboardCheck, FileWarning, RefreshCw, UserRoundCheck, UsersRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { AdminDashboardSummary } from '../contracts';
import { AdminShell } from './AdminShell';
import { DistributionCard } from './DistributionCard';
import { MetricCard } from './MetricCard';
import { RecentApplicants } from './RecentApplicants';

function updatedLabel(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <AdminShell active="summary">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Ringkasan administrasi</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-3xl">Dashboard Pendaftaran</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Pantau jumlah pendaftar, kelengkapan proses, dan data terbaru dalam satu tampilan.</p></div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-500 shadow-sm sm:self-auto"><RefreshCw aria-hidden="true" className="h-3.5 w-3.5 text-emerald-700" /><span>Diperbarui {updatedLabel(summary.updatedAt)}</span></div>
          </section>
          <Separator decorative className="my-6 bg-slate-200/80" />
          <section aria-label="Statistik pendaftaran" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <MetricCard label="Total pendaftar" value={summary.totalRegistrations} helper="Seluruh data yang masuk" icon={UsersRound} />
            <MetricCard label="Menunggu verifikasi" value={summary.awaitingVerification} helper="Perlu ditinjau panitia" icon={ClipboardCheck} tone="amber" />
            <MetricCard label="Pendaftaran selesai" value={summary.completedRegistrations} helper="Data berhasil dikirim" icon={UserRoundCheck} tone="blue" />
            <MetricCard label="Berkas belum lengkap" value={summary.incompleteUploads} helper="Unggahan belum diselesaikan" icon={FileWarning} tone="slate" />
          </section>
          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <DistributionCard title="Distribusi pilihan kelas" description="Sebaran pendaftar berdasarkan program kelas." items={summary.classDistribution} icon={BookOpenCheck} />
            <DistributionCard title="Jenis pendaftaran" description="Perbandingan siswa baru dan siswa pindahan." items={summary.typeDistribution} icon={UsersRound} />
          </section>
          <section className="mt-4"><RecentApplicants applicants={summary.recentApplicants} /></section>
    </AdminShell>
  );
}
