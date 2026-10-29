import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ParticipantListItem, ParticipantListQuery, ParticipantListResult } from '../contracts';
import { paginationPages, participantListHref } from '../query';
import { ParticipantPageSize } from './ParticipantPageSize';
import { participantDate, ParticipantStatus, ParticipantAttentionNote, ParticipantVaNote, ParticipantWaveNote } from './ParticipantStatus';
import { formatParticipantFieldValue } from '../presentation';

/** Kelas yang ditampilkan: Kelas Penempatan begitu Panitia menetapkannya, selain itu Pilihan Kelas. */
const classLabel = (item: ParticipantListItem) => item.kelasPenempatan ?? item.pilihanKelas;
const typeLabel = (item: ParticipantListItem) => item.jenisPendaftaran === 'Pindahan' && item.kelasTujuan ? `Pindahan · Kelas ${item.kelasTujuan}` : item.jenisPendaftaran;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word.charAt(0)).join('').toLocaleUpperCase('id-ID') || '?';
}

/** Mobile row of Data Pendaftar: the whole card opens the detail page. */
function MobileParticipantCard({ item, href }: { item: ParticipantListItem; href: string }) {
  const name = formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap);
  const details: Array<[string, string]> = [
    ['Asal TK', item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'],
    ['Kelas', classLabel(item)],
    ['Jenis', typeLabel(item)],
    ['Tanggal masuk', participantDate(item.createdAt)],
  ];
  return (
    <Link href={href} aria-label={`Lihat detail ${name}`} className="group block min-w-0 rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-xs transition-[border-color,box-shadow] hover:border-emerald-200 hover:shadow-md active:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-sidebar)]">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand-green-light)] text-sm font-bold text-[var(--admin-sidebar)] ring-1 ring-inset ring-emerald-100">{initials(name)}</span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[15px] font-bold leading-5 text-slate-900">{name}</h3>
          {item.nomorPendaftaran && <p className="mt-0.5 font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</p>}
        </div>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-slate-300 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[var(--admin-sidebar)]" />
      </div>
      <div className="mt-3 rounded-xl bg-[var(--admin-canvas)] px-3 py-2">
        <ParticipantStatus status={item.status} />
        <ParticipantWaveNote wave={item.jadwalGelombang} /><ParticipantVaNote missing={item.vaMissing} />
        <ParticipantAttentionNote attention={item.attention} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] font-medium leading-4 text-[var(--admin-muted)]">{label}</dt>
            <dd className="mt-0.5 break-words text-[13px] font-semibold leading-5 text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}

/** Arrow buttons around "6 / 12" on phones; numbered pages from sm up. */
function Pagination({ result, query }: { result: ParticipantListResult; query: ParticipantListQuery }) {
  const { page, totalPages } = result;
  return <nav aria-label="Halaman" className="flex items-center gap-1">
    {page > 1 ? <ButtonLink href={participantListHref(query, page - 1)} variant="outline" size="icon" aria-label="Sebelumnya"><ArrowLeft aria-hidden="true" /></ButtonLink> : <Button disabled variant="outline" size="icon" aria-label="Sebelumnya"><ArrowLeft aria-hidden="true" /></Button>}
    <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-slate-700 sm:hidden">{page} / {totalPages}</span>
    {paginationPages(page, totalPages).map((n, index) => n === null
      ? <span key={`gap-${index}`} aria-hidden="true" className="hidden px-1 text-xs text-[var(--admin-muted)] sm:inline">…</span>
      : <ButtonLink key={n} href={participantListHref(query, n)} variant={n === page ? 'default' : 'outline'} size="icon" aria-label={`Halaman ${n}`} aria-current={n === page ? 'page' : undefined} className={cn('hidden sm:inline-flex', n === page && 'pointer-events-none')}>{n}</ButtonLink>)}
    {page < totalPages ? <ButtonLink href={participantListHref(query, page + 1)} variant="outline" size="icon" aria-label="Berikutnya"><ArrowRight aria-hidden="true" /></ButtonLink> : <Button disabled variant="outline" size="icon" aria-label="Berikutnya"><ArrowRight aria-hidden="true" /></Button>}
  </nav>;
}

export function ParticipantList({ result, query }: { result: ParticipantListResult; query: ParticipantListQuery }) {
  const queryString = participantListHref(query, result.page).split('?')[1];
  const detailHref = (id: string) => `/admin/pendaftar/${id}${queryString ? `?${queryString}` : ''}`;
  return <Card className="mt-4 min-w-0 rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className="p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">{result.total} pendaftar ditemukan</h2><p className="text-xs text-[var(--admin-muted)]">Halaman {result.page} dari {result.totalPages}</p></div>
    {result.items.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-canvas)] px-4 py-12 text-center"><Inbox aria-hidden="true" className="size-8 text-[var(--admin-muted)]" /><p className="text-sm text-[var(--admin-muted)]">Belum ada pendaftar yang sesuai dengan pencarian.</p><ButtonLink href="/admin/pendaftar" variant="outline">Reset filter</ButtonLink></div> : <>
      <div className="hidden overflow-hidden rounded-xl border border-[var(--admin-border)] md:block"><Table><TableHeader className="bg-[var(--admin-canvas)]"><TableRow><TableHead>Nama pendaftar</TableHead><TableHead>Asal TK</TableHead><TableHead>Kelas</TableHead><TableHead>Jenis</TableHead><TableHead>Tanggal masuk</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Aksi</span></TableHead></TableRow></TableHeader><TableBody>
        {result.items.map(item => <TableRow key={item.id}><TableCell className="max-w-64 whitespace-normal break-words"><span className="block font-semibold">{formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}</span>{item.nomorPendaftaran && <span className="mt-0.5 block font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</span>}</TableCell><TableCell className="max-w-48 whitespace-normal break-words">{item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'}</TableCell><TableCell>{classLabel(item)}</TableCell><TableCell>{typeLabel(item)}</TableCell><TableCell className="text-[var(--admin-muted)]">{participantDate(item.createdAt)}</TableCell><TableCell className="max-w-48 whitespace-normal"><ParticipantStatus status={item.status} /><ParticipantWaveNote wave={item.jadwalGelombang} /><ParticipantVaNote missing={item.vaMissing} /><ParticipantAttentionNote attention={item.attention} /></TableCell><TableCell><ButtonLink href={detailHref(item.id)} aria-label={`Lihat detail ${formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}`} variant="outline" size="sm">Detail<ArrowUpRight aria-hidden="true" /></ButtonLink></TableCell></TableRow>)}
      </TableBody></Table></div>
      <ul aria-label="Daftar pendaftar" className="space-y-3 md:hidden">{result.items.map(item => <li key={item.id}><MobileParticipantCard item={item} href={detailHref(item.id)} /></li>)}</ul>
    </>}
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
      <ParticipantPageSize query={query} />
      <Pagination result={result} query={query} />
    </div>
  </CardContent></Card>;
}
