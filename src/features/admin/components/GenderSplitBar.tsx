import { CircleQuestionMark, Mars, Venus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AdminDashboardSummary } from '../contracts';

/** Validated as a categorical pair (light surface, CVD-safe) and kept apart from the Pilihan Kelas colors. */
const PARTS = [
  { key: 'male', label: 'Laki-laki', icon: Mars, color: '#4f46e5', ink: 'text-white' },
  { key: 'female', label: 'Perempuan', icon: Venus, color: '#db2777', ink: 'text-white' },
  { key: 'unknown', label: 'Belum diisi', icon: CircleQuestionMark, color: '#cbd5e1', ink: 'text-slate-900' },
] as const;

/** Share of the bar a block needs before it can print its name beside the symbol and count. */
const NAMED_SHARE = 0.3;
/** Below this share a block is too small for anything; hover and focus still give its count. */
const LABELLED_SHARE = 0.12;

/**
 * Siswa Baru holding a Kuota seat, split by jenis kelamin, as one tall segmented bar.
 * Every block names itself (symbol, name, count), so the bar needs no legend underneath;
 * "Belum diisi" only appears for old rows saved before jenis kelamin was required.
 */
export function GenderSplitBar({ counts }: { counts: AdminDashboardSummary['seatsByGender'] }) {
  const total = counts.male + counts.female + counts.unknown;
  const parts = PARTS.map(part => ({ ...part, value: counts[part.key] })).filter(part => part.value > 0);
  const summary = parts.map(part => `${part.label} ${part.value}`).join(', ');

  return (
    <TooltipProvider delay={150}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis kelamin</p>
        {total > 0 && <p className="text-xs text-slate-500"><span className="font-bold tabular-nums text-slate-900">{total}</span> siswa</p>}
      </div>
      {total === 0 ? (
        <div className="flex h-7 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">Data jenis kelamin belum tersedia</div>
      ) : (
        <div role="img" aria-label={`Siswa Baru per jenis kelamin: ${summary}`} className="@container/bar flex h-7 gap-0.5">
          {parts.map(part => {
            const Icon = part.icon;
            const share = part.value / total;
            return (
              <Tooltip key={part.key}>
                <TooltipTrigger
                  render={<div tabIndex={0} />}
                  aria-label={`${part.label}: ${part.value} Siswa Baru`}
                  className={cn('flex min-w-1 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-[4px] px-2.5 text-xs transition-[filter] duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none', part.ink)}
                  style={{ flexGrow: part.value, flexBasis: 0, backgroundColor: part.color }}
                >
                  {share >= LABELLED_SHARE && (
                    <>
                      <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.5} />
                      {share >= NAMED_SHARE && <span className="hidden font-medium opacity-90 @min-[20rem]/bar:inline">{part.label}</span>}
                      <span className="font-bold tabular-nums">{part.value}</span>
                    </>
                  )}
                </TooltipTrigger>
                <TooltipContent>{part.label}: {part.value} Siswa Baru</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
      {counts.unknown > 0 && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <span aria-hidden="true" className="size-2 rounded-[2px] bg-slate-300" />
          <span><span className="font-semibold tabular-nums text-slate-700">{counts.unknown}</span> data lama belum diisi jenis kelaminnya</span>
        </p>
      )}
    </TooltipProvider>
  );
}
