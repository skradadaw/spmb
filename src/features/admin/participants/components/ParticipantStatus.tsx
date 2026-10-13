import { cn } from '@/lib/utils';
import type { ParticipantAttention } from '../contracts';

export function participantDate(value: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : 'Tanggal belum tersedia';
}

type StatusTone = 'done' | 'progress' | 'rejected' | 'inactive';

/** Green done, amber in progress, red rejected, grey inactive. */
function statusTone(status: string): StatusTone {
  if (status === 'Terverifikasi' || status === 'Diterima') return 'done';
  if (status === 'Menunggu Verifikasi' || status === 'Terjadwal OKB' || status === 'Sudah OKB') return 'progress';
  if (status === 'Ditolak') return 'rejected';
  return 'inactive';
}

const TEXT_COLOR: Record<StatusTone, string> = { done: 'text-emerald-700', progress: 'text-amber-700', rejected: 'text-rose-700', inactive: 'text-slate-500' };
const BADGE_COLOR: Record<StatusTone, string> = {
  done: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  progress: 'border-amber-200 bg-amber-50 text-amber-800',
  rejected: 'border-rose-200 bg-rose-50 text-rose-800',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
};

function statusColor(status: string) {
  return TEXT_COLOR[statusTone(status)];
}

/** The detail header shows the same colours as the list, as a soft pill. */
export function ParticipantStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span data-status={status} className={cn('inline-flex min-h-7 max-w-full items-center gap-1.5 break-words rounded-full border px-3 py-1 text-xs font-semibold leading-4', BADGE_COLOR[statusTone(status)], className)}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />{status}
    </span>
  );
}

export function ParticipantStatus({ status }: { status: string }) {
  return <span data-status={status} className={cn('break-words text-xs font-semibold leading-4', statusColor(status))}>{status}</span>;
}

export function attentionItems(attention: ParticipantAttention) {
  return [
    attention.nisnMismatch && 'NISN tidak sesuai',
    attention.followUpDocuments > 0 && `${attention.followUpDocuments} berkas perlu tindak lanjut`,
    attention.missingDocuments > 0 && `${attention.missingDocuments} berkas belum tersedia`,
  ].filter((item): item is string => Boolean(item));
}

/** Perlu Perhatian as small amber text under the status; nothing when there is nothing to handle. */
export function ParticipantAttentionNote({ attention, className }: { attention: ParticipantAttention; className?: string }) {
  const items = attentionItems(attention);
  if (items.length === 0) return null;
  return <p data-attention className={cn('mt-1 break-words text-[11px] font-medium leading-4 text-amber-700', className)}>{items.join(' · ')}</p>;
}
