'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { PARTICIPANT_EXPORT_STATUSES, participantExportHref } from '../exportRequest';

type Mode = 'semua' | 'pilih';
const FAILED = 'Data pendaftar belum dapat diekspor. Silakan coba lagi.';
const filenameFrom = (disposition: string | null) => disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'data-pendaftar.xlsx';

/** Ekspor berdiri sendiri dari filter daftar: semua pendaftar, atau hanya status yang dicentang. Tanpa jumlah (gagal dimuat), tidak ada status yang dinonaktifkan. */
export function ParticipantExportDialog({ counts }: { counts: Record<string, number> | null }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('semua');
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses = mode === 'semua' ? PARTICIPANT_EXPORT_STATUSES : PARTICIPANT_EXPORT_STATUSES.filter(status => selected.includes(status));
  const total = counts ? statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0) : null;
  const empty = statuses.length === 0 || total === 0;
  const toggle = (status: string, checked: boolean) => setSelected(current => checked ? [...current, status] : current.filter(item => item !== status));

  async function download() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(participantExportHref(statuses));
      if (!response.ok) throw new Error(FAILED);
      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement('a'), { href: url, download: filenameFrom(response.headers.get('Content-Disposition')) });
      link.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      setError(FAILED);
    } finally {
      setPending(false);
    }
  }

  return <Dialog open={open} onOpenChange={next => { if (!pending) { setOpen(next); setError(null); } }}>
    <DialogTrigger render={<Button variant="outline" className="h-10 w-full sm:w-auto" />}><Download aria-hidden="true" />Ekspor Excel</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ekspor Data Pendaftar</DialogTitle>
        <DialogDescription>File Excel berisi seluruh data pendaftar, tanpa mengikuti filter di daftar.</DialogDescription>
      </DialogHeader>
      <RadioGroup value={mode} onValueChange={value => setMode(value as Mode)} aria-label="Data yang diekspor" disabled={pending}>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm font-medium">
          <RadioGroupItem value="semua" />Semua pendaftar
          {counts && <span className="ml-auto tabular-nums text-[var(--admin-muted)]">{PARTICIPANT_EXPORT_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0)}</span>}
        </label>
        <div className="rounded-lg border border-[var(--admin-border)]">
          <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium"><RadioGroupItem value="pilih" />Pilih status</label>
          <fieldset className={cn('grid gap-1 border-t border-[var(--admin-border)] px-3 py-2', mode !== 'pilih' && 'opacity-50')}>
            <legend className="sr-only">Status yang diekspor</legend>
            {PARTICIPANT_EXPORT_STATUSES.map(status => {
              const count = counts?.[status];
              return <label key={status} className={cn('flex items-center gap-3 py-1 pl-7 text-sm', count === 0 ? 'cursor-not-allowed text-[var(--admin-muted)]' : 'cursor-pointer')}>
                <input type="checkbox" checked={selected.includes(status)} disabled={mode !== 'pilih' || pending || count === 0} onChange={event => toggle(status, event.target.checked)} className="size-4 accent-[var(--admin-sidebar)]" />
                {status}
                {count !== undefined && <span className="ml-auto tabular-nums text-[var(--admin-muted)]">{count}</span>}
              </label>;
            })}
          </fieldset>
        </div>
      </RadioGroup>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <DialogClose render={<Button variant="outline" disabled={pending} />}>Batal</DialogClose>
        <Button type="button" onClick={download} disabled={pending || empty}>
          {pending ? <><Loader2 aria-hidden="true" className="animate-spin" />Menyiapkan file…</> : <><Download aria-hidden="true" />{total === null ? 'Ekspor' : `Ekspor ${total} pendaftar`}</>}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
