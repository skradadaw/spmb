import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, BadgeCheck, Ban, ChevronRight, CircleX, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

type Tone = 'emerald' | 'violet' | 'amber';

const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
};

type Kpi = { label: string; value: ReactNode; detail: ReactNode; hint: string; icon: LucideIcon; tone: Tone; href?: string; footer?: ReactNode };

const cardClass = 'group relative flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transition-none sm:p-5';

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold leading-5 text-slate-500">{kpi.label}</span>
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl ring-1', TONES[kpi.tone])}><Icon aria-hidden="true" className="size-5" /></span>
      </span>
      <span className="mt-1 block text-3xl font-bold tabular-nums tracking-[-0.04em] text-slate-950">{kpi.value}</span>
      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
        {kpi.detail}
        {kpi.href && <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600" />}
      </span>
      {kpi.footer}
    </>
  );
  // Linked figures open the matching page; the rest still explain themselves on hover or focus.
  const trigger: ReactElement = kpi.href
    ? <Link href={kpi.href} className={cn(cardClass, 'hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_32px_-20px_rgba(6,95,70,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')} />
    : <div tabIndex={0} className={cn(cardClass, 'cursor-help focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')} />;
  return (
    <Tooltip>
      <TooltipTrigger render={trigger}>{body}</TooltipTrigger>
      <TooltipContent side="bottom">{kpi.hint}</TooltipContent>
    </Tooltip>
  );
}

/** The three figures the admin checks first, with the other outcomes as a quiet line underneath. */
export function DashboardKpis({ summary }: { summary: AdminDashboardSummary }) {
  const kuota = summary.capacity.reduce((sum, row) => sum + row.kuota, 0);
  const registered = summary.totalRegistrations;
  // Measured against the Kuota for a sense of scale only: this total also holds Pindahan, Ditolak, Dibatalkan
  // and Menunggu Unggahan, none of which take a seat. The real empty seats are shown on the Kuota card.
  const percentage = kuota === 0 ? 0 : Math.min(100, Math.round((registered / kuota) * 100));
  const acceptedNew = summary.acceptedByClass.reduce((sum, row) => sum + row.count, 0);
  const acceptedTransfers = Math.max(0, summary.results.accepted - acceptedNew);

  const kpis: Kpi[] = [
    {
      label: 'Total pendaftar',
      value: <>{registered}<span className="text-base font-semibold text-slate-400"> / {kuota}</span></>,
      detail: summary.tasks.uploading > 0 ? `Termasuk ${summary.tasks.uploading} belum lengkap Berkas` : 'Semua data yang sudah masuk',
      hint: `Semua Pendaftar yang datanya sudah masuk, apa pun kelengkapan Berkasnya, dibandingkan dengan Kuota ${kuota} kursi. Pindahan, Ditolak, dan Dibatalkan ikut dihitung, jadi sisa kursi sebenarnya ada di kartu Kuota Siswa Baru.`,
      icon: Users, tone: 'emerald', href: '/admin/pendaftar',
      footer: (
        <span role="progressbar" aria-label={`Total pendaftar: ${registered} dibanding Kuota ${kuota}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="mt-3 block h-1.5 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-gradient-to-r from-[#087A20] to-[#22B43B]" style={{ width: `${percentage}%` }} />
        </span>
      ),
    },
    { label: 'Diterima', value: summary.results.accepted, detail: `${acceptedNew} Siswa Baru · ${acceptedTransfers} Pindahan`, hint: 'Pendaftar Diterima, termasuk yang belum diumumkan kepada orang tua.', icon: BadgeCheck, tone: 'violet', href: '/admin/pendaftar?status=Diterima' },
    { label: 'Pindahan', value: summary.transfers, detail: 'Di luar Kuota', hint: 'Pindahan yang masih berproses atau Diterima. Tidak memakai kursi Kuota Siswa Baru.', icon: ArrowLeftRight, tone: 'amber' },
  ];

  return (
    <TooltipProvider delay={400}>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:gap-4">
        {kpis.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>Hasil lainnya:</span>
        <OutcomeLink href="/admin/pendaftar?status=Ditolak" icon={CircleX} label="Ditolak" value={summary.results.rejected} />
        <OutcomeLink href="/admin/pendaftar?status=Dibatalkan" icon={Ban} label="Dibatalkan" value={summary.results.withdrawn} />
      </p>
    </TooltipProvider>
  );
}

function OutcomeLink({ href, icon: Icon, label, value }: { href: string; icon: LucideIcon; label: string; value: number }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-md font-medium text-slate-600 hover:text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Icon aria-hidden="true" className="size-3.5 text-slate-400" />{label}<span className="font-bold tabular-nums text-slate-900">{value}</span>
    </Link>
  );
}
