import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { AdminDashboardSummary } from '../contracts';
import { CapacityCard } from './CapacityCard';
import { DashboardTasks } from './DashboardTasks';
import { OkbScheduleCard } from './OkbScheduleCard';
import { ResultsCard } from './ResultsCard';

/** Ringkasan answers "what do I need to do?" first, then "how is the Kuota?", with report figures last. */
export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Ringkasan administrasi</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-3xl">Dashboard Pendaftaran</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Lihat pendaftar yang perlu ditindaklanjuti, sisa kursi tiap kelas, dan OKB yang sudah dekat.</p></div>
        <Link href="/admin/pendaftar" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-emerald-700 hover:underline sm:self-auto">Lihat semua pendaftar<ChevronRight aria-hidden="true" className="size-4" /></Link>
      </section>
      <Separator decorative className="my-6 bg-slate-200/80" />
      <section aria-labelledby="dashboard-tasks">
        <h2 id="dashboard-tasks" className="mb-3 text-sm font-bold text-slate-700">Tugas admin</h2>
        <DashboardTasks tasks={summary.tasks} attention={summary.attention} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <CapacityCard capacity={summary.capacity} transfers={summary.transfers} />
        <OkbScheduleCard schedule={summary.schedule} today={summary.today} />
      </section>
      <section className="mt-4"><ResultsCard totalRegistrations={summary.totalRegistrations} results={summary.results} acceptedByClass={summary.acceptedByClass} /></section>
    </>
  );
}
