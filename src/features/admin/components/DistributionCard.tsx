import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DistributionItem } from '../contracts';

export function DistributionCard({ title, description, items, icon: Icon }: {
  title: string;
  description: string;
  items: DistributionItem[];
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="flex-row items-start justify-between space-y-0 p-5 pb-3 sm:p-6 sm:pb-4">
        <div>
          <CardTitle className="text-base font-bold tracking-[-0.02em]">{title}</CardTitle>
          <CardDescription className="mt-1 text-xs leading-5">{description}</CardDescription>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-1 sm:p-6 sm:pt-1">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="tabular-nums text-slate-500"><strong className="text-slate-800">{item.count}</strong> · {item.percentage}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${item.label}: ${item.count} pendaftar`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.percentage}
              className="h-2 overflow-hidden rounded-full bg-slate-100"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-[#087A20] to-[#22B43B]" style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
