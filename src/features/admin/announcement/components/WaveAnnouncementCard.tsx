'use client';

import { useActionState, useState } from 'react';
import { Megaphone, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
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
    <Card data-wave-card={summary.wave} className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Diterima" value={summary.diterima.pending} note={`${summary.diterima.announced} sudah diumumkan`} />
          <Stat label="Ditolak" value={summary.ditolak.pending} note={`${summary.ditolak.announced} sudah diumumkan`} />
          <Stat label="Belum diputuskan" value={summary.undecided} note="dilewati" />
        </dl>
        {summary.missingVa > 0 && (
          <p className="text-xs font-medium text-amber-700">{summary.missingVa} Pendaftar Diterima belum punya Nomor VA.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <WaveDialog
            wave={summary.wave}
            intent="announce"
            disabled={pending || toAnnounce === 0}
            trigger={<><Megaphone aria-hidden="true" className="size-3.5" />Umumkan {label}</>}
            triggerClassName={ADMIN_PRIMARY_BUTTON}
            title={`Umumkan ${label}?`}
            description={`${summary.diterima.pending} Diterima dan ${summary.ditolak.pending} Ditolak akan diumumkan. Orang tua langsung dapat melihat hasilnya di halaman Cek Hasil OKB.${summary.undecided ? ` ${summary.undecided} pendaftar yang belum diputuskan dilewati.` : ''}`}
            confirmLabel="Ya, umumkan"
            formAction={formAction}
          />
          <WaveDialog
            wave={summary.wave}
            intent="withdraw"
            disabled={pending || announced === 0}
            trigger={<><Undo2 aria-hidden="true" className="size-3.5" />Tarik</>}
            triggerClassName={ADMIN_SECONDARY_BUTTON}
            title={`Tarik pengumuman ${label}?`}
            description={`${summary.diterima.announced} Diterima dan ${summary.ditolak.announced} Ditolak kembali menjadi "Hasil OKB belum diumumkan". Apa yang sudah terlanjur dilihat atau diunduh orang tua tidak dapat ditarik.`}
            confirmLabel="Ya, tarik pengumuman"
            formAction={formAction}
          />
        </div>
        {state.message && (
          <div aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
            <p>{state.message}</p>
            {state.missingVa && <ul className="mt-1 list-disc pl-4 font-medium">{state.missingVa.map(name => <li key={name}>{name}</li>)}</ul>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-2 py-2">
      <dt className="text-[11px] font-medium text-[var(--admin-muted)]">{label}</dt>
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
      <dd className="text-[10px] leading-3 text-[var(--admin-muted)]">{note}</dd>
    </div>
  );
}

function WaveDialog({ wave, intent, disabled, trigger, triggerClassName, title, description, confirmLabel, formAction }: {
  wave: number;
  intent: 'announce' | 'withdraw';
  disabled: boolean;
  trigger: React.ReactNode;
  triggerClassName: string;
  title: string;
  description: string;
  confirmLabel: string;
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
            <Button type="submit" name="intent" value={intent} className={ADMIN_PRIMARY_BUTTON}>{confirmLabel}</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
