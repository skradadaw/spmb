'use client';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PARTICIPANT_PAGE_SIZES, type ParticipantListQuery } from '../contracts';
import { participantListHref } from '../query';

/** Changing the page size goes back to page 1 so the admin never lands past the new last page. */
export function ParticipantPageSize({ query }: { query: ParticipantListQuery }) {
  const router = useRouter();
  return <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
    <label htmlFor="participant-page-size">Baris per halaman</label>
    <Select value={String(query.pageSize)} onValueChange={value => router.replace(participantListHref({ ...query, pageSize: Number(value) }), { scroll: false })}>
      <SelectTrigger id="participant-page-size" className="h-8 w-20"><SelectValue /></SelectTrigger>
      <SelectContent>{PARTICIPANT_PAGE_SIZES.map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
