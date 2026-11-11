'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ADMIN_ACTIONS, ADMIN_FIELD, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { formatNomorSurat, LETTER_NUMBER_FORMAT_MAX_LENGTH, LETTER_NUMBER_PLACEHOLDER, parseLetterNumberSettings, type LetterNumberSettings } from '@/features/announcement/letterNumber';
import { saveLetterNumberAction, type LetterNumberState } from '../actions/letterNumberActions';

const initialState: LetterNumberState = { status: 'idle', message: '' };
const EXAMPLE_FORMAT = `400.3.10.1/${LETTER_NUMBER_PLACEHOLDER}-SDS3AM/OKB/2026`;
const EXAMPLE_START = '350';

/** Format nomor Surat Penerimaan dan nomor urut awal; nomor urut tiap anak diberikan saat diumumkan. */
export function LetterNumberCard({ settings, lastUsed }: { settings: LetterNumberSettings | null; lastUsed: number | null }) {
  const [state, action, saving] = useActionState(saveLetterNumberAction, initialState);
  const [format, setFormat] = useState(settings?.format ?? '');
  const [nomorAwal, setNomorAwal] = useState(settings ? String(settings.nomorAwal) : '');

  const empty = !format && !nomorAwal;
  const parsed = parseLetterNumberSettings({ format, nomorAwal });
  // Sama dengan aturan di database: melanjutkan nomor terakhir, atau nomor awal bila lebih besar.
  const next = parsed.ok ? Math.max(parsed.settings.nomorAwal, (lastUsed ?? 0) + 1) : null;

  return (
    <form action={action} className="flex flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <div className="space-y-1.5">
          <Label htmlFor="format-nomor-surat" className={ADMIN_LABEL}>Format nomor surat</Label>
          <Input
            id="format-nomor-surat"
            name="format"
            value={format}
            onChange={event => setFormat(event.target.value)}
            maxLength={LETTER_NUMBER_FORMAT_MAX_LENGTH}
            placeholder={EXAMPLE_FORMAT}
            required
            aria-describedby="format-nomor-surat-hint"
            className={cn(ADMIN_FIELD, 'font-mono')}
          />
          <p id="format-nomor-surat-hint" className="text-xs text-[var(--admin-muted)]">
            <span className="font-mono font-semibold text-slate-700">{LETTER_NUMBER_PLACEHOLDER}</span> diganti nomor urut.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nomor-urut-awal" className={ADMIN_LABEL}>Nomor urut awal</Label>
          <Input
            id="nomor-urut-awal"
            name="nomorAwal"
            value={nomorAwal}
            onChange={event => setNomorAwal(event.target.value)}
            inputMode="numeric"
            placeholder={EXAMPLE_START}
            required
            className={cn(ADMIN_FIELD, 'font-mono')}
          />
        </div>
      </div>

      <div
        data-letter-number-status
        className={cn('rounded-xl border px-3 py-2.5', parsed.ok ? 'border-[var(--admin-border)] bg-[var(--admin-canvas)]' : 'border-amber-200 bg-amber-50')}
      >
        {parsed.ok && next !== null ? (
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-xs font-medium text-[var(--admin-muted)]">Surat berikutnya</p>
              <p className="mt-0.5 break-all font-mono text-sm font-semibold text-slate-900">{formatNomorSurat(parsed.settings.format, next)}</p>
            </div>
            {lastUsed !== null && <p className="text-xs text-[var(--admin-muted)]">Terakhir dipakai: <span className="font-mono font-semibold text-slate-700">{lastUsed}</span></p>}
          </div>
        ) : (
          <p className="text-sm font-medium text-amber-800">
            {empty ? 'Nomor surat belum diatur. Hasil OKB belum dapat diumumkan.' : parsed.ok ? '' : parsed.error}
          </p>
        )}
      </div>

      <div className={cn(ADMIN_ACTIONS, 'mt-auto')}>
        {state.message && (
          <p aria-live="polite" className={cn('mr-auto text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>{state.message}</p>
        )}
        {!settings && empty && (
          <Button type="button" onClick={() => { setFormat(EXAMPLE_FORMAT); setNomorAwal(EXAMPLE_START); }} className={ADMIN_SECONDARY_BUTTON}>
            <Wand2 aria-hidden="true" className="size-3.5" />Isi dengan contoh
          </Button>
        )}
        <Button type="submit" disabled={saving} className={ADMIN_PRIMARY_BUTTON}>
          {saving ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Save aria-hidden="true" className="size-3.5" />}
          Simpan nomor surat
        </Button>
      </div>
    </form>
  );
}
