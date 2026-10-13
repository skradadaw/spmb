'use client';
import Form from 'next/form';
import { Search, RotateCcw, Download } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ATTENTION_FILTERS, PARTICIPANT_CLASSES, PARTICIPANT_TYPES, type ParticipantListQuery } from '../contracts';

const ATTENTION_OPTIONS = Object.entries(ATTENTION_FILTERS).map(([value, label]) => ({ value, label }));
import { participantListHref } from '../query';

type FilterOption = string | { value: string; label: string };
function FilterSelect({ id, label, name, value, options, allLabel }: { id: string; label: string; name: string; value: string | null; options: readonly FilterOption[]; allLabel?: string }) {
  return <div className="min-w-0"><label htmlFor={id} className="text-xs font-semibold text-[var(--admin-muted)]">{label}</label>
    <Select name={name} defaultValue={value ?? '__all__'}><SelectTrigger id={id} className="mt-2 h-10 w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="__all__">{allLabel ?? `Semua ${label.toLowerCase()}`}</SelectItem>{options.map(option => typeof option === 'string' ? <SelectItem key={option} value={option}>{option}</SelectItem> : <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
export function ParticipantFilters({ query, statuses }: { query: ParticipantListQuery; statuses: readonly string[] }) {
  const statusOptions = Array.from(new Set([...statuses, ...(query.statusFilter ? [query.statusFilter] : [])]));
  const exportHref = participantListHref(query).replace('/admin/pendaftar', '/admin/pendaftar/ekspor');
  return <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className="p-4 sm:p-5">
    <Form action="/admin/pendaftar" className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div><label htmlFor="participant-search" className="text-xs font-semibold text-[var(--admin-muted)]">Cari nama / nomor</label><Input id="participant-search" name="q" type="search" defaultValue={query.search} maxLength={100} placeholder="Nama atau OB-2027-001" className="mt-2 h-10" /></div>
      <FilterSelect id="participant-class" name="kelas" label="Kelas" value={query.classFilter} options={PARTICIPANT_CLASSES} />
      <FilterSelect id="participant-type" name="jenis" label="Jenis pendaftaran" value={query.typeFilter} options={PARTICIPANT_TYPES} />
      <FilterSelect id="participant-status" name="status" label="Status" value={query.statusFilter} options={statusOptions} />
      <FilterSelect id="participant-attention" name="perhatian" label="Perlu perhatian" value={query.attentionFilter} options={ATTENTION_OPTIONS} allLabel="Semua peserta" />
      <div className="col-span-full flex flex-wrap gap-2"><Button type="submit" className="h-10"><Search aria-hidden="true" />Terapkan filter</Button><ButtonLink href="/admin/pendaftar" variant="outline" className="h-10"><RotateCcw aria-hidden="true" />Reset</ButtonLink><a href={exportHref} className={buttonVariants({ variant: 'outline', className: 'h-10' })}><Download aria-hidden="true" />Ekspor Excel</a></div>
    </Form>
  </CardContent></Card>;
}
