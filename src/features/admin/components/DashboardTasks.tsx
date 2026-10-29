import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CalendarPlus, CalendarX2, Check, ChevronRight, ClipboardCheck, Gavel, Megaphone, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

const statusHref = (status: string) => `/admin/pendaftar?status=${encodeURIComponent(status)}`;

type Task = { label: string; action: string; count: number; href: string; icon: LucideIcon };

function TaskTile({ task, children }: { task: Task; children?: ReactNode }) {
  const done = task.count === 0;
  const Icon = done ? Check : task.icon;
  return (
    <div className={cn('flex min-w-0 flex-col rounded-2xl border bg-white p-4 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)] sm:p-5', done ? 'border-slate-200/70' : 'border-amber-200/80')}>
      <Link href={task.href} className="group flex min-w-0 items-start justify-between gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="min-w-0">
          <span className={cn('block text-xs font-semibold leading-5', done ? 'text-slate-400' : 'text-slate-600')}>{task.label}</span>
          <span className={cn('mt-1 block text-2xl font-bold tabular-nums tracking-[-0.04em] sm:text-3xl', done ? 'text-slate-300' : 'text-slate-950')}>{task.count}</span>
          <span className={cn('mt-1 flex items-center gap-1 text-[11px] leading-4 group-hover:underline', done ? 'text-slate-400' : 'text-slate-500')}>{done ? 'Tidak ada yang perlu dikerjakan' : task.action}<ChevronRight aria-hidden="true" className="size-3" /></span>
        </span>
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', done ? 'bg-slate-50 text-slate-300' : 'bg-amber-50 text-amber-700')}><Icon aria-hidden="true" className="size-5" /></span>
      </Link>
      {children}
    </div>
  );
}

/** Each tile is one kind of work for the admin and opens Data Pendaftar filtered to exactly those Pendaftar. */
export function DashboardTasks({ tasks, attention }: Pick<AdminDashboardSummary, 'tasks' | 'attention'>) {
  const list: Task[] = [
    { label: 'Perlu diverifikasi', action: 'Periksa Berkas', count: tasks.awaiting, href: statusHref('Menunggu Verifikasi'), icon: ClipboardCheck },
    { label: 'Perlu dijadwalkan OKB', action: 'Tetapkan Jadwal OKB', count: tasks.verified, href: statusHref('Terverifikasi'), icon: CalendarPlus },
    { label: 'Tidak hadir OKB', action: 'Jadwalkan ulang atau batalkan', count: tasks.absent, href: '/admin/pendaftar?okb=terlewat', icon: CalendarX2 },
    { label: 'Menunggu keputusan', action: 'Masukkan Keputusan Penerimaan', count: tasks.decision, href: statusHref('Sudah OKB'), icon: Gavel },
    { label: 'Belum diumumkan', action: 'Umumkan Hasil OKB', count: tasks.unannounced, href: '/admin/pendaftar?pengumuman=belum', icon: Megaphone },
    { label: 'Belum selesai unggah', action: 'Hubungi orang tua', count: tasks.uploading, href: statusHref('Menunggu Unggahan'), icon: Upload },
  ];
  const attentionTask: Task = { label: 'Perlu perhatian', action: 'NISN atau Berkas bermasalah', count: attention.any, href: '/admin/pendaftar?perhatian=semua', icon: AlertTriangle };
  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {list.map(task => <TaskTile key={task.label} task={task} />)}
      <TaskTile task={attentionTask}>
        {attention.nisn > 0 && <Link href="/admin/pendaftar?perhatian=nisn" className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-amber-200 hover:bg-amber-50">
          <span className="tabular-nums text-amber-700">{attention.nisn}</span>NISN tidak sesuai<ChevronRight aria-hidden="true" className="size-3 text-slate-400" />
        </Link>}
      </TaskTile>
    </div>
  );
}
