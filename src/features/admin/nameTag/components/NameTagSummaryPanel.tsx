import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { summarizeRuangOkb, type NameTagPendaftar } from '../nameTagGroups';
import { NAME_TAG_CARD, NAME_TAG_SUBHEADING, NameTagCardHeader } from './NameTagCardHeader';

/** Progres pembagian Ruang OKB satu kelompok dan isi tiap ruangan. */
export function NameTagSummaryPanel({ members }: { members: NameTagPendaftar[] }) {
  const { total, withRoom, withoutRoom, perRoom } = summarizeRuangOkb(members);
  const percent = total ? Math.round((withRoom / total) * 100) : 0;

  return (
    <Card role="region" aria-labelledby="ringkasan-name-tag" className={cn(NAME_TAG_CARD, 'space-y-4 p-5')}>
      <NameTagCardHeader id="ringkasan-name-tag" title="Ringkasan" />

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-[var(--admin-muted)]">
            <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{withRoom}</span>
            <span className="tabular-nums"> / {total} Pendaftar</span>
          </p>
          <span className="text-xs font-semibold tabular-nums text-[var(--admin-sidebar)]">{percent}%</span>
        </div>
        <Progress value={percent} aria-label="Pendaftar dengan Ruang OKB" />
        <p className="text-xs text-muted-foreground">sudah punya Ruang OKB</p>
      </div>

      <div className="space-y-2">
        <h3 className={NAME_TAG_SUBHEADING}>Per ruangan</h3>
        <ul aria-label="Pendaftar per ruangan" className="divide-y divide-[var(--admin-border)] rounded-lg border border-[var(--admin-border)]">
          {perRoom.map(({ nama, count }) => (
            <li key={nama} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 break-words text-slate-800">{nama}</span>
              <span className="font-semibold tabular-nums text-slate-950">{count}</span>
            </li>
          ))}
          {withoutRoom > 0 && (
            <li className="flex items-center justify-between gap-3 rounded-b-lg bg-amber-50/60 px-3 py-2 text-sm first:rounded-t-lg">
              <span className="text-amber-800">Belum ada ruangan</span>
              <span className="font-semibold tabular-nums text-amber-800">{withoutRoom}</span>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}
