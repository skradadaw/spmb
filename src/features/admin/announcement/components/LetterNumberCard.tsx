'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { formatNomorSurat, LETTER_NUMBER_FORMAT_MAX_LENGTH, LETTER_NUMBER_PLACEHOLDER, parseLetterNumberSettings, type LetterNumberSettings } from '@/features/announcement/letterNumber';
import { saveLetterNumberAction, type LetterNumberState } from '../actions/letterNumberActions';

const initialState: LetterNumberState = { status: 'idle', message: '' };
const FIELD = 'h-9 rounded-lg text-sm';
const EXAMPLE_FORMAT = `400.3.10.1/${LETTER_NUMBER_PLACEHOLDER}-SDS3AM/OKB/2026`;
const EXAMPLE_START = '350';

/** Format nomor Surat Penerimaan dan nomor urut awal; nomor urut tiap anak diberikan saat diumumkan. */
export function LetterNumberCard({ settings, lastUsed }: { settings: LetterNumberSettings | null; lastUsed: number | null }) {
  const [state, action, saving] = useActionState(saveLetterNumberAction, initialState);
  const [format, setFormat] = useState(settings?.format ?? '');
  const [nomorAwal, setNomorAwal] = useState(settings ? String(settings.nomorAwal) : '');

  const parsed = parseLetterNumberSettings({ format, nomorAwal });
  // Sama dengan aturan di database: melanjutkan nomor terakhir, atau nomor awal bila lebih besar.
  const next = parsed.ok ? Math.max(parsed.settings.nomorAwal, (lastUsed ?? 0) + 1) : null;

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="space-y-1.5">
          <Label htmlFor="format-nomor-surat" className="text-xs font-semibold">Format nomor surat</Label>
          <Input
            id="format-nomor-surat"
            name="format"
            value={format}
            onChange={event => setFormat(event.target.value)}
            maxLength={LETTER_NUMBER_FORMAT_MAX_LENGTH}
            placeholder={EXAMPLE_FORMAT}
            required
            className={cn(FIELD, 'font-mono')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nomor-urut-awal" className="text-xs font-semibold">Nomor urut awal</Label>
          <Input
            id="nomor-urut-awal"
            name="nomorAwal"
            value={nomorAwal}
            onChange={event => setNomorAwal(event.target.value)}
            inputMode="numeric"
            placeholder={EXAMPLE_START}
            required
            className={cn(FIELD, 'font-mono')}
          />
        </div>
      </div>

      {!settings && !format && !nomorAwal && (
        <button
          type="button"
          onClick={() => { setFormat(EXAMPLE_FORMAT); setNomorAwal(EXAMPLE_START); }}
          className="text-xs font-semibold text-[var(--admin-sidebar)] underline-offset-2 hover:underline"
        >
          Pakai contoh: {EXAMPLE_FORMAT}, mulai {EXAMPLE_START}
        </button>
      )}

      <p className="text-xs leading-5 text-[var(--admin-muted)]">
        Tulis <span className="font-mono font-semibold">{LETTER_NUMBER_PLACEHOLDER}</span> di tempat nomor urut.
        Baris Nomor di template ditulis ulang oleh sistem dengan format ini, jadi isi template boleh sama persis.
      </p>

      <div data-letter-number-status className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5 text-sm">
        {parsed.ok && next !== null ? (
          <>
            <p>Surat berikutnya: <span className="font-mono font-semibold">Nomor: {formatNomorSurat(parsed.settings.format, next)}</span></p>
            {lastUsed !== null && <p className="mt-0.5 text-xs text-[var(--admin-muted)]">Nomor urut terakhir yang sudah dipakai: {lastUsed}.</p>}
          </>
        ) : settings ? (
          <p className="font-medium text-amber-700">{parsed.ok ? '' : parsed.error}</p>
        ) : (
          <p className="font-medium text-amber-700">Nomor surat belum diatur. Hasil OKB belum dapat diumumkan.</p>
        )}
      </div>

      <Button type="submit" disabled={saving} className={ADMIN_PRIMARY_BUTTON}>
        {saving ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Save aria-hidden="true" className="size-3.5" />}
        Simpan nomor surat
      </Button>

      {state.message && (
        <p aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>{state.message}</p>
      )}
    </form>
  );
}
