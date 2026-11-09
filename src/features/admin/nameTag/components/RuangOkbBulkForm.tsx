'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatParticipantFieldValue } from '@/features/admin/participants/presentation';
import type { RuangOkb } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import { saveRuangOkbAction, type SaveRuangOkbResult } from '../actions/saveRuangOkbAction';
import { summarizeRuangOkb, type NameTagPendaftar } from '../nameTagGroups';
import { NAME_TAG_CARD, NameTagCardHeader } from './NameTagCardHeader';
import { initialRuangOkbResult, RuangOkbChoice, RuangOkbResultMessage } from './RuangOkbField';

/** Kolom: kotak centang, nama, Ruang OKB. */
const TABLE_GRID = 'grid grid-cols-[1rem_minmax(0,1fr)_minmax(7rem,11rem)] items-center gap-x-3 px-5';

const displayName = (member: NameTagPendaftar) => formatParticipantFieldValue('identity', 'namaLengkap', member.namaLengkap);

/** `all`: semua; `none`: belum ada ruangan; `room:<nama>`: satu ruangan. */
type Filter = 'all' | 'none' | `room:${string}`;

function matches(filter: Filter, member: NameTagPendaftar) {
  const ruang = member.ruangOkb?.trim();
  if (filter === 'none') return !ruang;
  if (filter.startsWith('room:')) return ruang === filter.slice('room:'.length);
  return true;
}

/** Daftar Pendaftar satu kelompok; yang dicentang diberi satu Ruang OKB sekaligus. */
export function RuangOkbBulkForm({ members, rooms }: { members: NameTagPendaftar[]; rooms: readonly RuangOkb[] | null }) {
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [ruangOkbId, setRuangOkbId] = useState('');
  const [chosenFilter, setChosenFilter] = useState<Filter>('all');

  const summary = summarizeRuangOkb(members);
  const filters: { filter: Filter; label: string; count: number }[] = [
    { filter: 'all', label: 'Semua', count: summary.total },
    ...(summary.withoutRoom > 0 ? [{ filter: 'none' as const, label: 'Belum ada ruangan', count: summary.withoutRoom }] : []),
    ...summary.perRoom.map(({ nama, count }) => ({ filter: `room:${nama}` as const, label: nama, count })),
  ];
  // Saringan yang kosong setelah disimpan, misalnya Belum ada ruangan, kembali ke Semua.
  const filter: Filter = filters.some(item => item.filter === chosenFilter) ? chosenFilter : 'all';
  const visibleMembers = members.filter(member => matches(filter, member));

  // Dihitung dari daftar terbaru yang tampil, agar Pendaftar yang hilang atau tersaring tidak ikut terkirim.
  const checkedMembers = visibleMembers.filter(member => checkedIds.has(member.id));
  const allChecked = visibleMembers.length > 0 && checkedMembers.length === visibleMembers.length;

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

  function selectAllVisible(checked: boolean) {
    setCheckedIds(new Set(checked ? visibleMembers.map(member => member.id) : []));
  }

  function chooseFilter(next: Filter) {
    setChosenFilter(next);
    setCheckedIds(new Set());
  }

  return (
    <Card role="region" aria-labelledby="bagi-ruang-okb" className={NAME_TAG_CARD}>
      <div className="space-y-4 border-b border-[var(--admin-border)] px-5 pt-5">
        <NameTagCardHeader id="bagi-ruang-okb" step={2} title="Bagi Ruang OKB" />
        <Tabs value={filter} onValueChange={value => chooseFilter(value as Filter)}>
          {/* Garis aktif diwarnai sama dengan tab menu OKB dan menimpa garis bawah kartu. */}
          <TabsList variant="line" aria-label="Saring Pendaftar" className="-mb-px h-auto w-full justify-start gap-4 overflow-x-auto overflow-y-hidden p-0">
            {filters.map(item => {
              const active = item.filter === filter;
              return (
                <TabsTrigger
                  key={item.filter}
                  value={item.filter}
                  disabled={pending}
                  className="h-auto flex-none gap-2 px-0.5 pb-3 pt-0 text-[var(--admin-muted)] after:bg-[var(--admin-sidebar)] group-data-horizontal/tabs:after:bottom-0 data-active:font-semibold data-active:text-[var(--admin-sidebar)]"
                >
                  {item.label}
                  <Badge variant="secondary" className={cn('min-w-5 justify-center px-1.5 py-0.5 text-[11px] tabular-nums', active && 'bg-[var(--admin-sidebar)] text-white')}>{item.count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Toolbar satu baris yang tetap terlihat saat daftar panjang digulir. */}
      <form onSubmit={submit} className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[var(--admin-border)] bg-muted/80 px-5 py-3 backdrop-blur">
        {/* Bukan <label>: Base UI Checkbox di dalam label memakai teks label sebagai namanya, menimpa aria-label. */}
        <div className="flex min-h-9 items-center gap-3">
          <Checkbox
            aria-label="Pilih semua Pendaftar"
            checked={allChecked}
            indeterminate={checkedMembers.length > 0 && !allChecked}
            disabled={pending || visibleMembers.length === 0}
            onCheckedChange={selectAllVisible}
          />
          <span aria-hidden="true" onClick={() => !pending && visibleMembers.length > 0 && selectAllVisible(!allChecked)} className="cursor-pointer select-none">
            {checkedMembers.length > 0
              ? <span className="text-sm font-semibold text-[var(--admin-sidebar)]">{checkedMembers.length} dipilih</span>
              : <span className="text-sm font-medium text-foreground">Pilih semua</span>}
          </span>
        </div>
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center">
          <div className="min-w-0 sm:w-60">
            <Label htmlFor="ruang-okb-sekaligus" className="sr-only">Ruang OKB</Label>
            <RuangOkbChoice id="ruang-okb-sekaligus" rooms={rooms} value={ruangOkbId} onChange={setRuangOkbId} />
          </div>
          <div className="flex shrink-0 justify-end gap-2">
            {/* Simpan comes first in the DOM so Enter saves rather than clears; order-last keeps it rightmost. */}
            {!!rooms?.length && <Button type="submit" size="lg" disabled={pending || checkedMembers.length === 0 || !ruangOkbId} className="order-last flex-1 sm:w-32 sm:flex-none">Simpan ruangan</Button>}
            <Button type="submit" name="clear" value="1" variant="outline" size="lg" disabled={pending || !checkedMembers.some(member => member.ruangOkb)} className="flex-1 text-destructive sm:w-32 sm:flex-none hover:bg-destructive/10 hover:text-destructive">Kosongkan</Button>
          </div>
        </div>
        {state.message && <div className="basis-full"><RuangOkbResultMessage result={state} /></div>}
      </form>

      {/* Header dan baris memakai grid yang sama agar setiap kolom sejajar. */}
      <div aria-hidden="true" className={cn(TABLE_GRID, 'border-b border-[var(--admin-border)] py-2 text-xs font-medium text-muted-foreground')}>
        <span />
        <span>Nama Pendaftar</span>
        <span>Ruang OKB</span>
      </div>

      <ul aria-label="Daftar Pendaftar" className="divide-y divide-[var(--admin-border)]">
        {visibleMembers.map(member => {
          const name = displayName(member);
          const checked = checkedIds.has(member.id);
          return (
            <li key={member.id}>
              {/* Seluruh baris dapat diklik; klik pada kotak centang sendiri sudah ditangani Checkbox. */}
              <div
                onClick={event => {
                  if (pending || (event.target as HTMLElement).closest('[data-slot="checkbox"]')) return;
                  toggle(member.id, !checked);
                }}
                className={cn(
                  TABLE_GRID,
                  'min-h-11 cursor-pointer select-none py-2 transition-colors duration-150 hover:bg-muted/50',
                  checked && 'bg-muted hover:bg-muted',
                )}
              >
                <Checkbox aria-label={`Pilih ${name}`} checked={checked} disabled={pending} onCheckedChange={next => toggle(member.id, next)} />
                <span data-name className="min-w-0 break-words text-sm font-medium text-foreground">{name}</span>
                {member.ruangOkb
                  ? <span className="min-w-0 truncate text-sm text-foreground">{member.ruangOkb}</span>
                  : <Badge variant="warning" className="w-fit">Belum ada ruangan</Badge>}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-[var(--admin-border)] px-5 py-3 text-xs text-muted-foreground">
        Menampilkan {visibleMembers.length} dari {members.length} Pendaftar
      </p>
    </Card>
  );
}
