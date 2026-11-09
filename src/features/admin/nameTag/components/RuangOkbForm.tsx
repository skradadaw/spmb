'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_PRIMARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import type { RuangOkb } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import { initialRuangOkbResult, RuangOkbChoice, ruangOkbIdFor, RuangOkbResultMessage } from './RuangOkbField';

/** Ruang OKB seorang Pendaftar di halaman detailnya. */
export function RuangOkbForm({ applicantId, ruangOkb, rooms }: { applicantId: string; ruangOkb: string | null; rooms: readonly RuangOkb[] | null }) {
  // key: pilihan kembali ke nilai tersimpan setelah halaman dimuat ulang.
  return <RuangOkbFormFields key={ruangOkb ?? ''} applicantId={applicantId} ruangOkb={ruangOkb} rooms={rooms} />;
}

function RuangOkbFormFields({ applicantId, ruangOkb, rooms }: { applicantId: string; ruangOkb: string | null; rooms: readonly RuangOkb[] | null }) {
  const [ruangOkbId, setRuangOkbId] = useState(() => ruangOkbIdFor(rooms ?? [], ruangOkb));
  const [state, formAction, pending] = useActionState(
    (_previous: SaveRuangOkbResult, formData: FormData) => saveRuangOkbAction([applicantId], formData.get('clear') === '1' ? '' : ruangOkbId),
    initialRuangOkbResult,
  );
  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="ruang-okb" className={ADMIN_SECTION_TITLE}>Ruang OKB</Label>
        {!ruangOkb && <span className="text-[11px] font-medium text-amber-700">Belum diisi</span>}
      </div>
      <RuangOkbChoice id="ruang-okb" rooms={rooms} value={ruangOkbId} onChange={setRuangOkbId} />
      <div className={ADMIN_ACTIONS}>
        {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
        {!!rooms?.length && <Button type="submit" disabled={pending || !ruangOkbId} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>}
        {ruangOkb && <Button type="submit" name="clear" value="1" disabled={pending} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>}
      </div>
      <RuangOkbResultMessage result={state} />
    </form>
  );
}
