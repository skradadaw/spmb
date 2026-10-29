'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ANNOUNCEMENT_FILTERS, ATTENTION_FILTERS, PARTICIPANT_CLASS_FILTERS, PAYMENT_METHODS, type AnnouncementFilter, type ParticipantListQuery } from '../contracts';
import { hasActiveFilters, participantListHref } from '../query';
import { OKB_WAVES, okbWaveLabel } from '@/features/admin/okbWave';

const ALL = '__all__';
const SEARCH_DELAY_MS = 400;
/** Keeps popups clear of the sticky 68px mobile admin header. */
export const SELECT_COLLISION_PADDING = { top: 80, bottom: 12 };

const CHIP = 'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold';
const ACTIVE_CHIP = `${CHIP} border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`;
const WARNING_CHIP = `${CHIP} border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100`;

// `short` keeps every group on one row; the full label stays the accessible name.
const WAVE_OPTIONS = OKB_WAVES.map(wave => ({ value: wave, label: okbWaveLabel(wave), short: String(wave) }));
const ANNOUNCEMENT_SHORT: Record<AnnouncementFilter, string> = { sudah: 'Sudah', belum: 'Belum' };
const ANNOUNCEMENT_OPTIONS = (Object.keys(ANNOUNCEMENT_FILTERS) as AnnouncementFilter[]).map(key => ({ value: key, label: ANNOUNCEMENT_FILTERS[key], short: ANNOUNCEMENT_SHORT[key] }));

function FilterSelect({ id, label, value, options, onChange }: { id: string; label: string; value: string | null; options: readonly string[]; onChange: (value: string | null) => void }) {
  return <div className="min-w-0"><label htmlFor={id} className="text-xs font-semibold text-[var(--admin-muted)]">{label}</label>
    <Select value={value ?? ALL} onValueChange={next => onChange(next === ALL ? null : next)}><SelectTrigger id={id} className="mt-2 h-10 w-full"><SelectValue /></SelectTrigger>
      <SelectContent collisionPadding={SELECT_COLLISION_PADDING}><SelectItem value={ALL}>{`Semua ${label.toLowerCase()}`}</SelectItem>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

/** One group in Filter lainnya: a segmented control with "Semua" first; picking a segment applies it at once. */
function ChoiceGroup<T extends string | number>({ title, label, value, options, onChange }: {
  title: string;
  label: string;
  value: T | null;
  options: readonly { value: T; label: string; short?: string }[];
  onChange: (value: T | null) => void;
}) {
  const choices: { value: T | null; label: string; short?: string }[] = [{ value: null, label: 'Semua' }, ...options];
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
      <div role="group" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
        {choices.map(choice => {
          const selected = choice.value === value;
          return (
            <button
              key={String(choice.value)}
              type="button"
              aria-pressed={selected}
              aria-label={choice.short ? choice.label : undefined}
              title={choice.short ? choice.label : undefined}
              onClick={() => onChange(choice.value)}
              className={cn(
                'h-8 min-w-0 truncate rounded-md px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600',
                selected ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900',
              )}
            >
              {choice.short ?? choice.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Search, Status and Kelas stay in view; the less used filters sit in Filter lainnya, grouped by what they
 * are about, and each active one shows as a removable chip. Every change applies immediately and returns
 * to page 1; the search waits until typing pauses.
 */
export function ParticipantFilters({ query, statuses }: { query: ParticipantListQuery; statuses: readonly string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const statusOptions = Array.from(new Set([...statuses, ...(query.statusFilter ? [query.statusFilter] : [])]));
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

  const moreCount = [query.waveFilter, query.announcementFilter, query.paymentFilter, query.attentionFilter].filter(Boolean).length;
  const removeChip = (label: string, change: Partial<ParticipantListQuery>, className = ACTIVE_CHIP) => (
    <button type="button" onClick={() => apply(change)} className={className} aria-label={`Hapus filter ${label}`}>{label}<X aria-hidden="true" className="size-3.5" /></button>
  );

  return <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className={cn('p-4 transition-opacity sm:p-5', pending && 'opacity-70')} aria-busy={pending}>
    <form role="search" onSubmit={event => { event.preventDefault(); apply({ search: search.trim() }); }} className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
      <div className="sm:col-span-2 lg:col-span-1"><label htmlFor="participant-search" className="text-xs font-semibold text-[var(--admin-muted)]">Cari nama / nomor</label>
        <div className="relative mt-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]" /><Input id="participant-search" name="q" type="search" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} placeholder="Nama atau OB-2027-001" className="h-10 pl-9" /></div>
      </div>
      <FilterSelect id="participant-status" label="Status" value={query.statusFilter} options={statusOptions} onChange={statusFilter => apply({ statusFilter })} />
      <FilterSelect id="participant-class" label="Kelas" value={query.classFilter} options={PARTICIPANT_CLASS_FILTERS} onChange={classFilter => apply({ classFilter })} />
      <Popover>
        <PopoverTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 data-[state=open]:border-emerald-600 sm:col-span-2 lg:col-span-1">
          <SlidersHorizontal aria-hidden="true" className="size-4" />Filter lainnya
          {moreCount > 0 && <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white"><span className="sr-only">, aktif </span>{moreCount}</span>}
          <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
        </PopoverTrigger>
        <PopoverContent align="end" collisionPadding={SELECT_COLLISION_PADDING} aria-label="Filter lainnya" className="w-[20rem] space-y-3.5 p-4">
          <ChoiceGroup title="Jadwal OKB" label="Gelombang" value={query.waveFilter} options={WAVE_OPTIONS} onChange={waveFilter => apply({ waveFilter })} />
          <ChoiceGroup title="Hasil OKB" label="Pengumuman" value={query.announcementFilter} options={ANNOUNCEMENT_OPTIONS} onChange={announcementFilter => apply({ announcementFilter })} />
          <ChoiceGroup title="Pembayaran OKB" label="Pembayaran" value={query.paymentFilter} options={PAYMENT_METHODS} onChange={paymentFilter => apply({ paymentFilter })} />
          <section className="space-y-1.5 border-t border-slate-100 pt-3.5">
            <h3 className="text-xs font-semibold text-slate-700">Perhatian</h3>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 has-checked:border-amber-300 has-checked:bg-amber-50 has-checked:text-amber-900">
              <input type="checkbox" aria-describedby="perlu-perhatian-hint" checked={query.attentionFilter !== null} onChange={event => apply({ attentionFilter: event.target.checked ? 'semua' : null })} className="size-4 accent-[var(--admin-sidebar)]" />
              <span className="flex-1">Perlu perhatian</span>
              <span id="perlu-perhatian-hint" aria-hidden="true" className="text-[11px] font-normal text-slate-500">NISN atau berkas</span>
            </label>
          </section>
        </PopoverContent>
      </Popover>
    </form>
    <div className="mt-4 flex flex-wrap items-center gap-2 empty:hidden">
      {query.waveFilter && removeChip(okbWaveLabel(query.waveFilter), { waveFilter: null })}
      {query.announcementFilter && removeChip(ANNOUNCEMENT_FILTERS[query.announcementFilter], { announcementFilter: null })}
      {query.paymentFilter && removeChip(PAYMENT_METHODS.find(method => method.value === query.paymentFilter)!.label, { paymentFilter: null })}
      {query.attentionFilter === 'semua' && removeChip('Perlu perhatian', { attentionFilter: null }, WARNING_CHIP)}
      {query.attentionFilter === 'nisn' && removeChip(ATTENTION_FILTERS.nisn, { attentionFilter: 'semua' }, WARNING_CHIP)}
      {query.okbMissed && removeChip('Tidak hadir OKB', { okbMissed: false }, WARNING_CHIP)}
      {hasActiveFilters(query) && <ButtonLink href={participantListHref({ search: '', classFilter: null, statusFilter: null, attentionFilter: null, okbMissed: false, waveFilter: null, announcementFilter: null, paymentFilter: null, page: 1, pageSize: query.pageSize })} variant="outline" className="h-8 text-xs"><RotateCcw aria-hidden="true" />Reset</ButtonLink>}
    </div>
  </CardContent></Card>;
}
