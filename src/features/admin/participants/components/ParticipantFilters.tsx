'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw, Download, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ATTENTION_FILTERS, PARTICIPANT_CLASS_FILTERS, type ParticipantListQuery } from '../contracts';
import { hasActiveFilters, participantListHref } from '../query';

const ALL = '__all__';
const SEARCH_DELAY_MS = 400;

function FilterSelect({ id, label, value, options, onChange }: { id: string; label: string; value: string | null; options: readonly string[]; onChange: (value: string | null) => void }) {
  return <div className="min-w-0"><label htmlFor={id} className="text-xs font-semibold text-[var(--admin-muted)]">{label}</label>
    <Select value={value ?? ALL} onValueChange={next => onChange(next === ALL ? null : next)}><SelectTrigger id={id} className="mt-2 h-10 w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value={ALL}>{`Semua ${label.toLowerCase()}`}</SelectItem>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

/** Every change applies immediately and returns to page 1; the search waits until typing pauses. */
export function ParticipantFilters({ query, statuses, total }: { query: ParticipantListQuery; statuses: readonly string[]; total: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const statusOptions = Array.from(new Set([...statuses, ...(query.statusFilter ? [query.statusFilter] : [])]));
  const exportHref = participantListHref(query).replace('/admin/pendaftar', '/admin/pendaftar/ekspor');
  const apply = (change: Partial<ParticipantListQuery>) => startTransition(() => router.replace(participantListHref({ ...query, ...change }), { scroll: false }));

  // Follow outside navigation (Reset, back button) without clobbering what is being typed.
  const [appliedSearch, setAppliedSearch] = useState(query.search);
  if (appliedSearch !== query.search) {
    setAppliedSearch(query.search);
    if (search.trim() !== query.search) setSearch(query.search);
  }
  useEffect(() => {
    if (search.trim() === query.search) return;
    const timer = setTimeout(() => apply({ search: search.trim() }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  });

  return <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className={cn('p-4 transition-opacity sm:p-5', pending && 'opacity-70')} aria-busy={pending}>
    <form role="search" onSubmit={event => { event.preventDefault(); apply({ search: search.trim() }); }} className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
      <div className="sm:col-span-2 lg:col-span-1"><label htmlFor="participant-search" className="text-xs font-semibold text-[var(--admin-muted)]">Cari nama / nomor</label>
        <div className="relative mt-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]" /><Input id="participant-search" name="q" type="search" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} placeholder="Nama atau OB-2027-001" className="h-10 pl-9" /></div>
      </div>
      <FilterSelect id="participant-status" label="Status" value={query.statusFilter} options={statusOptions} onChange={statusFilter => apply({ statusFilter })} />
      <FilterSelect id="participant-class" label="Kelas" value={query.classFilter} options={PARTICIPANT_CLASS_FILTERS} onChange={classFilter => apply({ classFilter })} />
      <label className="flex h-10 cursor-pointer items-center gap-2 text-sm font-medium"><input type="checkbox" checked={query.attentionFilter !== null} onChange={event => apply({ attentionFilter: event.target.checked ? 'semua' : null })} className="size-4 accent-[var(--admin-sidebar)]" />Perlu perhatian</label>
    </form>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {query.attentionFilter === 'nisn' && <button type="button" onClick={() => apply({ attentionFilter: 'semua' })} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100" aria-label={`Hapus filter ${ATTENTION_FILTERS.nisn}`}>{ATTENTION_FILTERS.nisn}<X aria-hidden="true" className="size-3.5" /></button>}
      {query.okbMissed && <button type="button" onClick={() => apply({ okbMissed: false })} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100" aria-label="Hapus filter Tidak hadir OKB">Tidak hadir OKB<X aria-hidden="true" className="size-3.5" /></button>}
      {hasActiveFilters(query) && <ButtonLink href={participantListHref({ search: '', classFilter: null, statusFilter: null, attentionFilter: null, okbMissed: false, page: 1, pageSize: query.pageSize })} variant="outline" className="h-10"><RotateCcw aria-hidden="true" />Reset</ButtonLink>}
      <a href={exportHref} className={buttonVariants({ variant: 'outline', className: 'h-10 sm:ml-auto' })}><Download aria-hidden="true" />Ekspor Excel ({total})</a>
    </div>
  </CardContent></Card>;
}
