import Link from 'next/link';
import { CalendarDays, ChevronRight, ListTodo } from 'lucide-react';
import { formatOkbDate } from '@/features/admin/okbDate';
import type { AdminDashboardSummary } from '../contracts';
import { CapacityCard } from './CapacityCard';
import { DashboardKpis } from './DashboardKpis';
import { DashboardTasks } from './DashboardTasks';
import { OkbScheduleCard } from './OkbScheduleCard';

/** Ringkasan: the headline figures first, then what is waiting for the admin, then Kuota and the nearest OKB. */
export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  const t = summary.tasks;
  // Kinds of work, not Pendaftar: one Pendaftar can sit in several tasks at once (e.g. Perlu perhatian).
  const waiting = [t.awaiting, t.verified, t.absent, t.decision, t.unannounced, summary.attention.any, t.uploading].filter(count => count > 0).length;
  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Ringkasan administrasi</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-3xl">Dashboard Pendaftaran</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500"><CalendarDays aria-hidden="true" className="size-4 text-slate-400" />{formatOkbDate(summary.today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/admin/pendaftar" className="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-2xs transition-colors hover:border-emerald-200 hover:bg-emerald-50 sm:self-auto">Lihat semua pendaftar<ChevronRight aria-hidden="true" className="size-4" /></Link>
      </section>

      <section aria-label="Angka utama" className="mt-6"><DashboardKpis summary={summary} /></section>

      <section aria-labelledby="dashboard-tasks" className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <ListTodo aria-hidden="true" className="size-4 text-slate-500" />
          <h2 id="dashboard-tasks" className="text-sm font-bold text-slate-700">Tugas admin</h2>
          {waiting > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-800">{waiting} jenis tugas menunggu</span>}
        </div>
        <DashboardTasks tasks={summary.tasks} attention={summary.attention} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CapacityCard capacity={summary.capacity} seatsByGender={summary.seatsByGender} />
        <OkbScheduleCard schedule={summary.schedule} today={summary.today} />
      </section>
    </>
  );
}
