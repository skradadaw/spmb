'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_PRIMARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import { initialRuangOkbResult, RuangOkbInput, RuangOkbResultMessage } from './RuangOkbField';

/** Ruang OKB seorang Pendaftar di halaman detailnya. */
export function RuangOkbForm({ applicantId, ruangOkb, suggestions }: { applicantId: string; ruangOkb: string | null; suggestions: string[] }) {
  const [state, formAction, pending] = useActionState(
    (_previous: SaveRuangOkbResult, formData: FormData) => saveRuangOkbAction([applicantId], formData.get('clear') === '1' ? '' : String(formData.get('ruangOkb') ?? '')),
    initialRuangOkbResult,
  );
  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="ruang-okb" className={ADMIN_SECTION_TITLE}>Ruang OKB</Label>
        {!ruangOkb && <span className="text-[11px] font-medium text-amber-700">Belum diisi</span>}
      </div>
      {/* key: isian kembali ke nilai tersimpan setelah halaman dimuat ulang. */}
      <RuangOkbInput key={ruangOkb ?? ''} id="ruang-okb" name="ruangOkb" defaultValue={ruangOkb ?? ''} suggestions={suggestions} />
      <div className={ADMIN_ACTIONS}>
        {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
        <Button type="submit" disabled={pending} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>
        {ruangOkb && <Button type="submit" name="clear" value="1" disabled={pending} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>}
      </div>
      <RuangOkbResultMessage result={state} />
    </form>
  );
}
