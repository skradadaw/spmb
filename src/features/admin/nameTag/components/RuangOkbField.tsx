'use client';

import { useId, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { ADMIN_FIELD } from '@/features/admin/components/adminStyles';
import { cn } from '@/lib/utils';
import type { SaveRuangOkbResult } from '../actions/saveRuangOkbAction';

export const initialRuangOkbResult: SaveRuangOkbResult = { status: 'idle', message: '', updated: 0 };

/** Nama ruangan diketik bebas, dengan saran dari nama yang sudah dipakai. Batas panjangnya diperiksa server setelah dinormalkan. */
export function RuangOkbInput({ suggestions, ...props }: ComponentProps<typeof Input> & { suggestions: string[] }) {
  const suggestionsId = useId();
  return (
    <>
      <Input {...props} list={suggestionsId} autoComplete="off" placeholder="Mis. Ruang A" className={ADMIN_FIELD} />
      <datalist id={suggestionsId}>{suggestions.map(suggestion => <option key={suggestion} value={suggestion} />)}</datalist>
    </>
  );
}

export function RuangOkbResultMessage({ result }: { result: SaveRuangOkbResult }) {
  if (!result.message) return null;
  return (
    <p aria-live="polite" className={cn('text-xs font-semibold', result.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
      {result.message}
    </p>
  );
}
