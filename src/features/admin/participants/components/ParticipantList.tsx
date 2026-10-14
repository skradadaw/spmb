import { ArrowLeft, ArrowRight, ArrowUpRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ParticipantListItem, ParticipantListQuery, ParticipantListResult } from '../contracts';
import { paginationPages, participantListHref } from '../query';
import { ParticipantPageSize } from './ParticipantPageSize';
import { participantDate, ParticipantStatus, ParticipantAttentionNote, ParticipantWaveNote } from './ParticipantStatus';
import { formatParticipantFieldValue } from '../presentation';

/** Kelas yang ditampilkan: Kelas Penempatan begitu Panitia menetapkannya, selain itu Pilihan Kelas. */
const classLabel = (item: ParticipantListItem) => item.kelasPenempatan ?? item.pilihanKelas;
const typeLabel = (item: ParticipantListItem) => item.jenisPendaftaran === 'Pindahan' && item.kelasTujuan ? `Pindahan · Kelas ${item.kelasTujuan}` : item.jenisPendaftaran;

function Pagination({ result, query }: { result: ParticipantListResult; query: ParticipantListQuery }) {
  const { page, totalPages } = result;
  return <nav aria-label="Halaman" className="flex items-center gap-1">
    {page > 1 ? <ButtonLink href={participantListHref(query, page - 1)} variant="outline" size="icon" aria-label="Sebelumnya"><ArrowLeft aria-hidden="true" /></ButtonLink> : <Button disabled variant="outline" size="icon" aria-label="Sebelumnya"><ArrowLeft aria-hidden="true" /></Button>}
    <span className="px-2 text-xs font-semibold sm:hidden">{page} / {totalPages}</span>
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
        {result.items.map(item => <TableRow key={item.id}><TableCell className="max-w-64 whitespace-normal break-words"><span className="block font-semibold">{formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}</span>{item.nomorPendaftaran && <span className="mt-0.5 block font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</span>}</TableCell><TableCell className="max-w-48 whitespace-normal break-words">{item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'}</TableCell><TableCell>{classLabel(item)}</TableCell><TableCell>{typeLabel(item)}</TableCell><TableCell className="text-[var(--admin-muted)]">{participantDate(item.createdAt)}</TableCell><TableCell className="max-w-48 whitespace-normal"><ParticipantStatus status={item.status} /><ParticipantWaveNote wave={item.jadwalGelombang} /><ParticipantAttentionNote attention={item.attention} /></TableCell><TableCell><ButtonLink href={detailHref(item.id)} aria-label={`Lihat detail ${formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}`} variant="outline" size="sm">Detail<ArrowUpRight aria-hidden="true" /></ButtonLink></TableCell></TableRow>)}
      </TableBody></Table></div>
      <div className="space-y-3 md:hidden">{result.items.map(item => <article key={item.id} className="min-w-0 rounded-xl border border-[var(--admin-border)] p-4"><h3 className="break-words text-sm font-bold">{formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}</h3>{item.nomorPendaftaran && <p className="mt-1 font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</p>}<div className="mt-2"><ParticipantStatus status={item.status} /><ParticipantWaveNote wave={item.jadwalGelombang} /><ParticipantAttentionNote attention={item.attention} /></div><p className="mt-3 text-xs text-[var(--admin-muted)]">Asal TK: {item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'}</p><p className="mt-2 text-xs text-[var(--admin-muted)]">{classLabel(item)} · {typeLabel(item)}</p><p className="mt-2 text-xs text-[var(--admin-muted)]">{participantDate(item.createdAt)}</p><ButtonLink href={detailHref(item.id)} aria-label={`Lihat detail ${formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}`} variant="outline" size="sm" className="mt-3">Lihat detail<ArrowUpRight aria-hidden="true" /></ButtonLink></article>)}</div>
    </>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
      <ParticipantPageSize query={query} />
      <Pagination result={result} query={query} />
    </div>
  </CardContent></Card>;
}
