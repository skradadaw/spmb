'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_FIELD, ADMIN_PRIMARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';

const initialState: SaveRuangOkbResult = { status: 'idle', message: '', updated: 0 };

/** Ruang OKB seorang Pendaftar di halaman detailnya. */
export function RuangOkbForm({ participantId, ruangOkb }: { participantId: string; ruangOkb: string | null }) {
  const [state, formAction, pending] = useActionState(
    (_previous: SaveRuangOkbResult, formData: FormData) => saveRuangOkbAction([participantId], formData.get('clear') === '1' ? '' : String(formData.get('ruangOkb') ?? '')),
    initialState,
  );
  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="ruang-okb" className={ADMIN_SECTION_TITLE}>Ruang OKB</Label>
        {!ruangOkb && <span className="text-[11px] font-medium text-amber-700">Belum diisi</span>}
      </div>
      {/* key: isian kembali ke nilai tersimpan setelah halaman dimuat ulang. */}
      <Input key={ruangOkb ?? ''} id="ruang-okb" name="ruangOkb" autoComplete="off" defaultValue={ruangOkb ?? ''} placeholder="Mis. Ruang A" className={ADMIN_FIELD} />
      <div className={ADMIN_ACTIONS}>
        {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
        <Button type="submit" disabled={pending} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>
        {ruangOkb && <Button type="submit" name="clear" value="1" disabled={pending} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>}
      </div>
      {state.message && (
        <p aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
          {state.message}
        </p>
      )}
    </form>
  );
}
