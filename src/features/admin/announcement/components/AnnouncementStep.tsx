import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Keadaan sebuah langkah: sudah siap, masih perlu dikerjakan admin, atau sekadar keterangan. */
export type StepStatus = { tone: 'ready' | 'todo' | 'info'; label: string };

const STATUS_STYLE = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  todo: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-slate-200 bg-slate-50 text-slate-600',
} as const;

/** Satu langkah bernomor di halaman Pengumuman: nomor, judul, keadaannya, penjelasan, lalu isinya. */
export function AnnouncementStep({ id, step, title, description, status, className, children }: {
  id: string;
  step: number;
  title: string;
  description: ReactNode;
  status?: StepStatus | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={cn('flex flex-col rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm', className)}>
      <header className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{step}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
            <h2 id={id} className="text-base font-bold leading-8 tracking-tight text-slate-900">
              <span className="sr-only">Langkah {step}: </span>{title}
            </h2>
            {status && (
              <span data-step-status={status.tone} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', STATUS_STYLE[status.tone])}>
                {status.tone === 'ready' && <CheckCircle2 aria-hidden="true" className="size-3.5" />}
                {status.tone === 'todo' && <AlertCircle aria-hidden="true" className="size-3.5" />}
                {status.label}
              </span>
            )}
          </div>
          <p className="max-w-prose text-sm leading-6 text-[var(--admin-muted)]">{description}</p>
        </div>
      </header>
      {/* Kolom flex, bukan tinggi persen: isi terakhir mengisi sisa kartu tanpa meluber ke kartu di bawahnya. */}
      <div className="mt-4 flex flex-1 flex-col gap-4">{children}</div>
    </section>
  );
}
