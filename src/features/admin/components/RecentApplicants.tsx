import { Clock3, Inbox } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RecentApplicant } from '../contracts';

function statusVariant(status: string): BadgeVariant {
  if (status === 'Terverifikasi' || status === 'Diterima') return 'success';
  if (status === 'Menunggu Verifikasi') return 'warning';
  if (status === 'Ditolak') return 'destructive';
  return 'secondary';
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

export function RecentApplicants({ applicants }: { applicants: RecentApplicant[] }) {
  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.3)]">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="text-base font-bold tracking-[-0.02em]">Pendaftar terbaru</CardTitle>
        <CardDescription className="text-xs leading-5">Data terbaru yang telah masuk ke sistem pendaftaran.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        {applicants.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm"><Inbox aria-hidden="true" className="h-5 w-5" /></span>
            <p className="max-w-md text-sm font-medium leading-6 text-slate-500">Belum ada data pendaftar. Data akan muncul setelah formulir pendaftaran dikirim.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-slate-100 md:block">
              <Table>
                <TableHeader className="bg-slate-50/80"><TableRow><TableHead>Nama calon murid</TableHead><TableHead>Kelas</TableHead><TableHead>Jenis</TableHead><TableHead>Tanggal masuk</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{applicants.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[260px] font-semibold text-slate-900"><span className="block truncate">{item.namaLengkap}</span></TableCell>
                    <TableCell>{item.pilihanKelas}</TableCell><TableCell>{item.jenisPendaftaran}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">{formattedDate(item.createdAt)}</TableCell>
                    <TableCell><Badge variant={statusVariant(item.status)}>{item.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </div>
            <div className="space-y-3 md:hidden">{applicants.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3"><p className="min-w-0 break-words text-sm font-bold leading-5 text-slate-900">{item.namaLengkap}</p><Badge variant={statusVariant(item.status)} className="shrink-0">{item.status}</Badge></div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500"><span>{item.pilihanKelas}</span><span>•</span><span>{item.jenisPendaftaran}</span></div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{formattedDate(item.createdAt)}</p>
              </article>
            ))}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
