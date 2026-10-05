import Image from 'next/image';
import { BookOpenCheck, ClipboardCheck, FileWarning, LogOut, RefreshCw, UserRoundCheck, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logoutAdminAction } from '@/features/auth/logout-action';
import type { AdminDashboardSummary } from '../contracts';
import { DashboardSidebar } from './DashboardSidebar';
import { DistributionCard } from './DistributionCard';
import { MetricCard } from './MetricCard';
import { RecentApplicants } from './RecentApplicants';

function updatedLabel(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <div className="min-h-screen bg-[#F5F7F6] text-slate-950">
      <DashboardSidebar />
      <main className="min-w-0 lg:pl-[272px]">
        <header className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={42} height={42} className="h-[42px] w-[42px] shrink-0 object-contain" /><div className="min-w-0"><p className="truncate text-xs font-bold">SD Plus 3 Al-Muhajirin</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Admin SPMB</p></div></div>
            <form action={logoutAdminAction}><Button type="submit" variant="ghost" size="icon" aria-label="Keluar dari panel admin"><LogOut aria-hidden="true" className="h-[18px] w-[18px]" /></Button></form>
          </div>
        </header>
        <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
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
        </div>
      </main>
    </div>
  );
}
