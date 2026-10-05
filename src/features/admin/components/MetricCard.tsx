import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function MetricCard({ label, value, helper, icon: Icon, tone = 'green' }: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone?: 'green' | 'amber' | 'blue' | 'slate';
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-5 text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-3xl">{value}</p>
          </div>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-400">{helper}</p>
      </CardContent>
    </Card>
  );
}
