'use client';

import { useActionState, useState } from 'react';
import { Megaphone, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_DANGER_SOLID_BUTTON, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { okbWaveLabel } from '@/features/admin/okbWave';
import { announceWaveAction } from '../actions/announceActions';
import type { AnnounceState } from '../announceResult';
import type { WaveSummary } from '../waveSummary';

const initialState: AnnounceState = { status: 'idle', message: '' };

/** Pengumuman Hasil OKB per Gelombang OKB: ringkasan lalu Umumkan atau Tarik pengumuman sekaligus. */
export function WaveAnnouncementCard({ summary }: { summary: WaveSummary }) {
  const [state, formAction, pending] = useActionState(announceWaveAction, initialState);
  const label = okbWaveLabel(summary.wave);
  const toAnnounce = summary.diterima.pending + summary.ditolak.pending;
  const announced = summary.diterima.announced + summary.ditolak.announced;

  return (
    <article data-wave-card={summary.wave} className="flex flex-col gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] p-4">
      <h3 className="text-sm font-bold text-slate-900">{label}</h3>
      <dl className="divide-y divide-[var(--admin-border)] rounded-lg border border-[var(--admin-border)] bg-white text-xs">
        <Stat label="Diterima" value={summary.diterima.pending} note={`${summary.diterima.announced} sudah diumumkan`} />
        <Stat label="Ditolak" value={summary.ditolak.pending} note={`${summary.ditolak.announced} sudah diumumkan`} />
        <Stat label="Belum diputuskan" value={summary.undecided} note="dilewati" />
      </dl>
      {summary.missingVa > 0 && (
        <p className="text-xs font-medium text-amber-700">{summary.missingVa} Pendaftar Diterima belum punya Nomor VA.</p>
      )}
      <div className={cn(ADMIN_ACTIONS, 'mt-auto')}>
        <WaveDialog
          wave={summary.wave}
          intent="withdraw"
          disabled={pending || announced === 0}
          trigger={<><Undo2 aria-hidden="true" className="size-3.5" />Tarik</>}
          triggerClassName={ADMIN_DANGER_BUTTON}
          title={`Tarik pengumuman ${label}?`}
          description={`${summary.diterima.announced} Diterima dan ${summary.ditolak.announced} Ditolak kembali menjadi "Hasil OKB belum diumumkan". Apa yang sudah terlanjur dilihat atau diunduh orang tua tidak dapat ditarik.`}
          confirmLabel="Ya, tarik pengumuman"
          confirmClassName={ADMIN_DANGER_SOLID_BUTTON}
          formAction={formAction}
        />
        <WaveDialog
          wave={summary.wave}
          intent="announce"
          disabled={pending || toAnnounce === 0}
          trigger={<><Megaphone aria-hidden="true" className="size-3.5" />Umumkan {label}</>}
          triggerClassName={ADMIN_PRIMARY_BUTTON}
          title={`Umumkan ${label}?`}
          description={`${summary.diterima.pending} Diterima dan ${summary.ditolak.pending} Ditolak akan diumumkan. Orang tua langsung dapat melihat hasilnya di halaman Cek Hasil OKB.${summary.undecided ? ` ${summary.undecided} pendaftar yang belum diputuskan dilewati.` : ''}`}
          confirmLabel="Ya, umumkan"
          confirmClassName={ADMIN_PRIMARY_BUTTON}
          formAction={formAction}
        />
      </div>
      {state.message && (
        <div aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
          <p>{state.message}</p>
          {state.missingVa && <ul className="mt-1 list-disc pl-4 font-medium">{state.missingVa.map(name => <li key={name}>{name}</li>)}</ul>}
        </div>
      )}
    </article>
  );
}

/** Satu baris ringkasan: jumlah yang siap diumumkan, dengan keterangan di bawah labelnya. */
function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div>
        <dt className="font-semibold text-slate-800">{label}</dt>
        <dd className="text-[11px] text-[var(--admin-muted)]">{note}</dd>
      </div>
      <dd className="text-lg font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

function WaveDialog({ wave, intent, disabled, trigger, triggerClassName, title, description, confirmLabel, confirmClassName, formAction }: {
  wave: number;
  intent: 'announce' | 'withdraw';
  disabled: boolean;
  trigger: React.ReactNode;
  triggerClassName: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName: string;
  formAction: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button type="button" disabled={disabled} className={triggerClassName} />}>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="gelombang" value={wave} />
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <Button type="submit" name="intent" value={intent} className={confirmClassName}>{confirmLabel}</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
