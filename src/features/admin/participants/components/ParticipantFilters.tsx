'use client';
import { Search, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PARTICIPANT_CLASSES, PARTICIPANT_TYPES, type ParticipantListQuery } from '../contracts';

function FilterSelect({ id, label, name, value, options }: { id: string; label: string; name: string; value: string | null; options: readonly string[] }) {
  return <div className="min-w-0"><label htmlFor={id} className="text-xs font-semibold text-[var(--admin-muted)]">{label}</label>
    <Select name={name} defaultValue={value ?? '__all__'}><SelectTrigger id={id} className="mt-2 h-10 w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="__all__">Semua {label.toLowerCase()}</SelectItem>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
export function ParticipantFilters({ query, statuses }: { query: ParticipantListQuery; statuses: string[] }) {
  const statusOptions = Array.from(new Set([...statuses, ...(query.statusFilter ? [query.statusFilter] : [])]));
  return <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className="p-4 sm:p-5">
    <form action="/admin/pendaftar" method="get" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div><label htmlFor="participant-search" className="text-xs font-semibold text-[var(--admin-muted)]">Cari nama</label><Input id="participant-search" name="q" type="search" defaultValue={query.search} maxLength={100} placeholder="Cari nama peserta..." className="mt-2 h-10" /></div>
      <FilterSelect id="participant-class" name="kelas" label="Kelas" value={query.classFilter} options={PARTICIPANT_CLASSES} />
      <FilterSelect id="participant-type" name="jenis" label="Jenis pendaftaran" value={query.typeFilter} options={PARTICIPANT_TYPES} />
      <FilterSelect id="participant-status" name="status" label="Status" value={query.statusFilter} options={statusOptions} />
      <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4"><Button type="submit" className="h-10 bg-[var(--admin-sidebar)] text-white hover:bg-[var(--brand-green-dark)]"><Search aria-hidden="true" />Terapkan filter</Button><Button render={<Link href="/admin/pendaftar" />} variant="outline" className="h-10"><RotateCcw aria-hidden="true" />Reset</Button></div>
    </form>
  </CardContent></Card>;
}
