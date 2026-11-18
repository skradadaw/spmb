import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CalendarPlus, CalendarX2, Check, ChevronRight, CircleCheckBig, ClipboardCheck, Gavel, Megaphone, Upload } from 'lucide-react';
import type { AdminDashboardSummary } from '../contracts';

const statusHref = (status: string) => `/admin/pendaftar?status=${encodeURIComponent(status)}`;

type Task = { label: string; action: string; count: number; href: string; icon: LucideIcon; extra?: ReactNode };

function TaskTile({ task }: { task: Task }) {
  const Icon = task.icon;
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-amber-200/80 bg-white p-4 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow] duration-200 hover:border-amber-300 hover:shadow-[0_14px_32px_-20px_rgba(180,83,9,0.35)] motion-reduce:transition-none">
      <Link href={task.href} className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100"><Icon aria-hidden="true" className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold leading-5 text-slate-600">{task.label}</span>
          <span className="flex items-center gap-1 truncate text-[11px] leading-4 text-slate-500 group-hover:text-amber-800">{task.action}</span>
        </span>
        <span className="text-2xl font-bold tabular-nums tracking-[-0.04em] text-slate-950">{task.count}</span>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
      </Link>
      {task.extra}
    </div>
  );
}

/**
 * Only work that is waiting gets a tile, each opening Data Pendaftar filtered to exactly those Pendaftar.
 * Finished kinds of work shrink into one quiet line so the admin's eye lands on what is left.
 */
export function DashboardTasks({ tasks, attention }: Pick<AdminDashboardSummary, 'tasks' | 'attention'>) {
  const list: Task[] = [
    { label: 'Perlu diverifikasi', action: 'Periksa Berkas', count: tasks.awaiting, href: statusHref('Menunggu Verifikasi'), icon: ClipboardCheck },
    { label: 'Perlu dijadwalkan OKB', action: 'Tetapkan Jadwal OKB', count: tasks.verified, href: statusHref('Terverifikasi'), icon: CalendarPlus },
    { label: 'Tidak hadir OKB', action: 'Jadwalkan ulang atau batalkan', count: tasks.absent, href: '/admin/pendaftar?okb=terlewat', icon: CalendarX2 },
    { label: 'Menunggu keputusan', action: 'Masukkan Keputusan Penerimaan', count: tasks.decision, href: statusHref('Sudah OKB'), icon: Gavel },
    { label: 'Belum diumumkan', action: 'Umumkan Hasil OKB', count: tasks.unannounced, href: '/admin/pendaftar?pengumuman=belum', icon: Megaphone },
    { label: 'Perlu perhatian', action: 'NISN atau Berkas bermasalah', count: attention.any, href: '/admin/pendaftar?perhatian=semua', icon: AlertTriangle, extra: attention.nisn > 0 && (
      <Link href="/admin/pendaftar?perhatian=nisn" className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-amber-200 hover:bg-amber-50">
        <span className="tabular-nums text-amber-700">{attention.nisn}</span>NISN tidak sesuai<ChevronRight aria-hidden="true" className="size-3 text-slate-400" />
      </Link>
    ) },
    { label: 'Belum selesai unggah', action: 'Hubungi orang tua', count: tasks.uploading, href: statusHref('Menunggu Unggahan'), icon: Upload },
  ];
  const pending = list.filter(task => task.count > 0);
  const done = list.filter(task => task.count === 0);

  if (pending.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-emerald-200"><CircleCheckBig aria-hidden="true" className="size-5" /></span>
        <div><p className="text-sm font-bold text-emerald-900">Semua tugas beres</p><p className="text-xs text-emerald-800/80">Tidak ada Pendaftar yang menunggu tindakan admin saat ini.</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pending.map(task => <TaskTile key={task.label} task={task} />)}
      </div>
      {done.length > 0 && (
        <div aria-label="Tugas yang sudah beres" className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="mr-1 font-semibold">Sudah beres:</span>
          {done.map(task => (
            <span key={task.label} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5"><Check aria-hidden="true" className="size-3 text-emerald-600" />{task.label}</span>
          ))}
        </div>
      )}
    </>
  );
}
