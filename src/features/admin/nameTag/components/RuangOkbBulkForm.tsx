'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTIONS, ADMIN_DANGER_BUTTON, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { formatParticipantFieldValue } from '@/features/admin/participants/presentation';
import type { RuangOkb } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import type { NameTagPendaftar } from '../nameTagGroups';
import { initialRuangOkbResult, RuangOkbChoice, RuangOkbResultMessage } from './RuangOkbField';

const displayName = (member: NameTagPendaftar) => formatParticipantFieldValue('identity', 'namaLengkap', member.namaLengkap);

/** Daftar Pendaftar satu kelompok; yang dicentang diberi satu Ruang OKB sekaligus. */
export function RuangOkbBulkForm({ members, rooms }: { members: NameTagPendaftar[]; rooms: readonly RuangOkb[] | null }) {
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [ruangOkbId, setRuangOkbId] = useState('');

  // Dihitung dari daftar terbaru, agar Pendaftar yang hilang setelah dimuat ulang tidak ikut terkirim.
  const checkedMembers = members.filter(member => checkedIds.has(member.id));
  const allChecked = checkedMembers.length === members.length;

  const [state, saveAction, pending] = useActionState(async (_previous: SaveRuangOkbResult, clear: boolean) => {
    const result = await saveRuangOkbAction(checkedMembers.map(member => member.id), clear ? '' : ruangOkbId);
    // Saat sebagian gagal, pilihan Pendaftar dan ruangan tetap ada agar admin bisa memeriksanya.
    if (result.status === 'success') {
      setCheckedIds(new Set());
      setRuangOkbId('');
    }
    return result;
  }, initialRuangOkbResult);

  // Dikirim lewat onSubmit, bukan prop action: React mereset form setelah action, dan Radix Select ikut mengosongkan pilihannya.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clear = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('name') === 'clear';
    startTransition(() => saveAction(clear));
  }

  function toggle(id: string, checked: boolean) {
    const next = new Set(checkedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setCheckedIds(next);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-2 rounded-xl border border-slate-200 p-3">
        <Label htmlFor="ruang-okb-sekaligus" className={ADMIN_LABEL}>Ruang OKB</Label>
        <RuangOkbChoice id="ruang-okb-sekaligus" rooms={rooms} value={ruangOkbId} onChange={setRuangOkbId} />
        <div className={ADMIN_ACTIONS}>
          {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
          {!!rooms?.length && <Button type="submit" disabled={pending || checkedMembers.length === 0 || !ruangOkbId} className={cn(ADMIN_PRIMARY_BUTTON, 'order-last')}>Simpan ruangan</Button>}
          <Button type="submit" name="clear" value="1" disabled={pending || !checkedMembers.some(member => member.ruangOkb)} className={ADMIN_DANGER_BUTTON}>Kosongkan</Button>
        </div>
        <RuangOkbResultMessage result={state} />
      </form>

      <div className="flex items-center justify-between gap-2 px-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            aria-label="Pilih semua Pendaftar"
            ref={input => { if (input) input.indeterminate = checkedMembers.length > 0 && !allChecked; }}
            checked={allChecked}
            disabled={pending}
            onChange={event => setCheckedIds(new Set(event.target.checked ? members.map(member => member.id) : []))}
            className="size-4 accent-[var(--admin-sidebar)]"
          />
          Pilih semua
        </label>
        <p className="text-xs text-[var(--admin-muted)]">{checkedMembers.length} dipilih</p>
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
