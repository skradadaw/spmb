'use client';

import { useActionState, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_FIELD, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { formatParticipantFieldValue } from '@/features/admin/participants/presentation';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import { normalizeRuangOkb, RUANG_OKB_MAX_LENGTH } from '../nameTag';
import type { NameTagPendaftar } from '../nameTagGroups';

const initialState: SaveRuangOkbResult = { status: 'idle', message: '', updated: 0 };
const displayName = (member: NameTagPendaftar) => formatParticipantFieldValue('identity', 'namaLengkap', member.namaLengkap);

/** Daftar Pendaftar satu kelompok; yang dicentang diberi satu Ruang OKB sekaligus. */
export function RuangOkbBulkForm({ members, suggestions }: { members: NameTagPendaftar[]; suggestions: string[] }) {
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [room, setRoom] = useState('');
  const suggestionsId = useId();

  // Dihitung dari daftar terbaru, agar Pendaftar yang hilang setelah dimuat ulang tidak ikut terkirim.
  const selected = members.filter(member => checkedIds.has(member.id));
  const allSelected = selected.length === members.length;

  const [state, formAction, pending] = useActionState(async (_previous: SaveRuangOkbResult, formData: FormData) => {
    const result = await saveRuangOkbAction(selected.map(member => member.id), formData.get('clear') === '1' ? '' : room);
    // Saat sebagian gagal, pilihan dan nama tetap ada agar admin bisa memeriksanya.
    if (result.status === 'success') {
      setCheckedIds(new Set());
      setRoom('');
    }
    return result;
  }, initialState);

  function toggle(id: string, checked: boolean) {
    const next = new Set(checkedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setCheckedIds(next);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
        <Label htmlFor="ruang-okb-sekaligus" className={ADMIN_LABEL}>Nama ruangan</Label>
        <Input id="ruang-okb-sekaligus" name="ruangOkb" list={suggestionsId} autoComplete="off" maxLength={RUANG_OKB_MAX_LENGTH} value={room} onChange={event => setRoom(event.target.value)} placeholder="Mis. Ruang A" className={ADMIN_FIELD} />
        <datalist id={suggestionsId}>{suggestions.map(suggestion => <option key={suggestion} value={suggestion} />)}</datalist>
        <div className={ADMIN_ACTIONS}>
          {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
          <Button type="submit" disabled={pending || selected.length === 0 || !normalizeRuangOkb(room)} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>
          <Button type="submit" name="clear" value="1" disabled={pending || !selected.some(member => member.ruangOkb)} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>
        </div>
        {state.message && (
          <p aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
            {state.message}
          </p>
        )}
      </form>

      <div className="flex items-center justify-between gap-2 px-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            aria-label="Pilih semua Pendaftar"
            ref={input => { if (input) input.indeterminate = selected.length > 0 && !allSelected; }}
            checked={allSelected}
            disabled={pending}
            onChange={event => setCheckedIds(new Set(event.target.checked ? members.map(member => member.id) : []))}
            className="size-4 accent-[var(--admin-sidebar)]"
          />
          Pilih semua
        </label>
        <p className="text-xs text-[var(--admin-muted)]">{selected.length} dipilih</p>
      </div>

      <ul aria-label="Daftar Pendaftar" className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {members.map(member => {
          const name = displayName(member);
          return (
            <li key={member.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
                <input type="checkbox" aria-label={`Pilih ${name}`} checked={checkedIds.has(member.id)} disabled={pending} onChange={event => toggle(member.id, event.target.checked)} className="size-4 shrink-0 accent-[var(--admin-sidebar)]" />
                <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-900">{name}</span>
                {member.ruangOkb
                  ? <span className="shrink-0 text-right text-xs font-semibold text-slate-700">{member.ruangOkb}</span>
                  : <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Belum ada ruangan</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
