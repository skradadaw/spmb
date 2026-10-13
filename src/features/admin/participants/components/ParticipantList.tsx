import { ArrowLeft, ArrowRight, ArrowUpRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ParticipantListQuery, ParticipantListResult } from '../contracts';
import { participantListHref } from '../query';
import { participantDate, ParticipantStatus } from './ParticipantStatus';
import { formatParticipantFieldValue } from '../presentation';

export function ParticipantList({ result, query }: { result: ParticipantListResult; query: ParticipantListQuery }) {
  const queryString = participantListHref(query, result.page).split('?')[1];
  const detailHref = (id: string) => `/admin/pendaftar/${id}${queryString ? `?${queryString}` : ''}`;
  return <Card className="mt-4 min-w-0 rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"><CardContent className="p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">{result.total} peserta ditemukan</h2><p className="text-xs text-[var(--admin-muted)]">Halaman {result.page} dari {result.totalPages}</p></div>
    {result.items.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-canvas)] px-4 py-12 text-center"><Inbox aria-hidden="true" className="size-8 text-[var(--admin-muted)]" /><p className="text-sm text-[var(--admin-muted)]">Belum ada peserta yang sesuai dengan pencarian.</p><ButtonLink href="/admin/pendaftar" variant="outline">Reset filter</ButtonLink></div> : <>
      <div className="hidden overflow-hidden rounded-xl border border-[var(--admin-border)] md:block"><Table><TableHeader className="bg-[var(--admin-canvas)]"><TableRow><TableHead>Nama peserta</TableHead><TableHead>Asal TK</TableHead><TableHead>Kelas</TableHead><TableHead>Jenis</TableHead><TableHead>Tanggal masuk</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Aksi</span></TableHead></TableRow></TableHeader><TableBody>
        {result.items.map(item => <TableRow key={item.id}><TableCell className="max-w-64 whitespace-normal break-words"><span className="block font-semibold">{formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}</span>{item.nomorPendaftaran && <span className="mt-0.5 block font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</span>}</TableCell><TableCell className="max-w-48 whitespace-normal break-words">{item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'}</TableCell><TableCell>{item.pilihanKelas}</TableCell><TableCell>{item.jenisPendaftaran}</TableCell><TableCell className="text-[var(--admin-muted)]">{participantDate(item.createdAt)}</TableCell><TableCell className="max-w-44"><ParticipantStatus status={item.status} /></TableCell><TableCell><ButtonLink href={detailHref(item.id)} aria-label={`Lihat detail ${formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}`} variant="outline" size="sm">Detail<ArrowUpRight aria-hidden="true" /></ButtonLink></TableCell></TableRow>)}
      </TableBody></Table></div>
      <div className="space-y-3 md:hidden">{result.items.map(item => <article key={item.id} className="min-w-0 rounded-xl border border-[var(--admin-border)] p-4"><h3 className="break-words text-sm font-bold">{formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}</h3>{item.nomorPendaftaran && <p className="mt-1 font-mono text-xs text-[var(--admin-muted)]">{item.nomorPendaftaran}</p>}<div className="mt-2"><ParticipantStatus status={item.status} /></div><p className="mt-3 text-xs text-[var(--admin-muted)]">Asal TK: {item.asalSekolah ? formatParticipantFieldValue('school', 'asalSekolah', item.asalSekolah) : 'Belum diisi'}</p><p className="mt-2 text-xs text-[var(--admin-muted)]">{item.pilihanKelas} · {item.jenisPendaftaran}</p><p className="mt-2 text-xs text-[var(--admin-muted)]">{participantDate(item.createdAt)}</p><ButtonLink href={detailHref(item.id)} aria-label={`Lihat detail ${formatParticipantFieldValue('identity', 'namaLengkap', item.namaLengkap)}`} variant="outline" size="sm" className="mt-3">Lihat detail<ArrowUpRight aria-hidden="true" /></ButtonLink></article>)}</div>
    </>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
      {result.page > 1 ? <ButtonLink href={participantListHref(query, result.page - 1)} variant="outline"><ArrowLeft aria-hidden="true" />Sebelumnya</ButtonLink> : <Button disabled variant="outline"><ArrowLeft aria-hidden="true" />Sebelumnya</Button>}
      {result.page < result.totalPages ? <ButtonLink href={participantListHref(query, result.page + 1)} variant="outline">Berikutnya<ArrowRight aria-hidden="true" /></ButtonLink> : <Button disabled variant="outline">Berikutnya<ArrowRight aria-hidden="true" /></Button>}
    </div>
  </CardContent></Card>;
}
