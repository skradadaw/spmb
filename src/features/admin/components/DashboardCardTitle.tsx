import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Card heading with a tinted icon tile, shared by the Ringkasan cards so they read as one set. */
export function DashboardCardTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Icon aria-hidden="true" className="size-[18px]" /></span>
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-[-0.02em] text-slate-950">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-pretty text-slate-500">{description}</p>}
      </div>
    </div>
  );
}
