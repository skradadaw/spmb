import { cn } from '@/lib/utils';

export function participantDate(value: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : 'Tanggal belum tersedia';
}

/** Status as colored text only: green done, amber in progress, red rejected, grey inactive. */
function statusColor(status: string) {
  if (status === 'Terverifikasi' || status === 'Diterima') return 'text-emerald-700';
  if (status === 'Menunggu Verifikasi' || status === 'Terjadwal OKB' || status === 'Sudah OKB') return 'text-amber-700';
  if (status === 'Ditolak') return 'text-rose-700';
  return 'text-slate-500';
}

export function ParticipantStatus({ status }: { status: string }) {
  return <span data-status={status} className={cn('break-words text-xs font-semibold leading-4', statusColor(status))}>{status}</span>;
}
