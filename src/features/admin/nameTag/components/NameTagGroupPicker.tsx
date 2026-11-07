'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADMIN_LABEL } from '@/features/admin/components/adminStyles';
import { SELECT_COLLISION_PADDING } from '@/features/admin/participants/components/ParticipantFilters';
import { formatOkbDate } from '@/features/admin/okbDate';
import { okbWaveLabel, parseOkbWave } from '@/features/admin/okbWave';
import { nameTagHref, type NameTagGroup, type NameTagSelection } from '../nameTagGroups';

const dateLabel = (date: string) => formatOkbDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Tanggal dan Gelombang OKB tersimpan di URL, agar kelompok terpilih dapat ditautkan dan tetap ada saat dimuat ulang. */
export function NameTagGroupPicker({ groups, selected }: { groups: NameTagGroup[]; selected: NameTagSelection }) {
  const router = useRouter();
  const showGroup = (href: string) => router.replace(href, { scroll: false });
  const dates = [...new Set(groups.map(group => group.tanggal))];
  const waves = groups.filter(group => group.tanggal === selected.tanggal);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor="name-tag-tanggal" className={ADMIN_LABEL}>Tanggal OKB</label>
        <Select value={selected.tanggal} onValueChange={tanggal => showGroup(nameTagHref(tanggal))}>
          <SelectTrigger id="name-tag-tanggal" aria-label="Tanggal OKB"><SelectValue /></SelectTrigger>
          <SelectContent collisionPadding={SELECT_COLLISION_PADDING}>
            {dates.map(date => <SelectItem key={date} value={date}>{dateLabel(date)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="name-tag-gelombang" className={ADMIN_LABEL}>Gelombang OKB</label>
        <Select value={String(selected.gelombang)} onValueChange={value => showGroup(nameTagHref(selected.tanggal, parseOkbWave(value) ?? undefined))}>
          <SelectTrigger id="name-tag-gelombang" aria-label="Gelombang OKB"><SelectValue /></SelectTrigger>
          <SelectContent collisionPadding={SELECT_COLLISION_PADDING}>
            {waves.map(group => <SelectItem key={group.gelombang} value={String(group.gelombang)} hint={`${group.count} pendaftar`}>{okbWaveLabel(group.gelombang)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
