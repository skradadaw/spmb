'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ADMIN_DANGER_BUTTON, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import type { RuangOkb } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import { initialRuangOkbResult, RuangOkbChoice, ruangOkbIdFor, RuangOkbResultMessage } from './RuangOkbField';

type Props = {
  applicantId: string;
  ruangOkb: string | null;
  rooms: readonly RuangOkb[] | null;
  /** Aksi tambahan di kiri baris tombol, mis. Cetak Name Tag. */
  extraAction?: ReactNode;
  className?: string;
};

/** Ruang OKB seorang Pendaftar di halaman detailnya. */
export function RuangOkbForm(props: Props) {
  // key: pilihan kembali ke nilai tersimpan setelah halaman dimuat ulang.
  return <RuangOkbFormFields key={props.ruangOkb ?? ''} {...props} />;
}

function RuangOkbFormFields({ applicantId, ruangOkb, rooms, extraAction, className }: Props) {
  const [ruangOkbId, setRuangOkbId] = useState(() => ruangOkbIdFor(rooms ?? [], ruangOkb));
  const [state, formAction, pending] = useActionState(
    (_previous: SaveRuangOkbResult, formData: FormData) => saveRuangOkbAction([applicantId], formData.get('clear') === '1' ? '' : ruangOkbId),
    initialRuangOkbResult,
  );
  const hasButtons = Boolean(rooms?.length) || Boolean(ruangOkb);
  return (
    <form action={formAction} className={cn('space-y-2 px-3 py-2.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="ruang-okb" className="text-[11px] font-medium text-slate-500">Ruang OKB</Label>
        {!ruangOkb && <span className="text-[11px] font-medium text-amber-700">Belum diisi</span>}
      </div>
      <RuangOkbChoice id="ruang-okb" rooms={rooms} value={ruangOkbId} onChange={setRuangOkbId} />
      {(hasButtons || extraAction) && (
        <div className="flex flex-wrap items-start justify-between gap-2 pt-1">
          <div>{extraAction}</div>
          {hasButtons && (
            <div className="flex flex-wrap justify-end gap-2">
              {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
              {!!rooms?.length && <Button type="submit" disabled={pending || !ruangOkbId} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>}
              {ruangOkb && <Button type="submit" name="clear" value="1" disabled={pending} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>}
            </div>
          )}
        </div>
      )}
      <RuangOkbResultMessage result={state} />
    </form>
  );
}
