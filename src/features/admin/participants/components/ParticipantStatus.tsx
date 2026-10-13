import { Badge, type BadgeVariant } from '@/components/ui/badge';
export function participantDate(value: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : 'Tanggal belum tersedia';
}
export function ParticipantStatus({ status }: { status: string }) {
  const variant: BadgeVariant = status === 'Terverifikasi' || status === 'Diterima' ? 'success' : status === 'Menunggu Verifikasi' || status === 'Terjadwal OKB' || status === 'Sudah OKB' ? 'warning' : status === 'Ditolak' ? 'destructive' : 'secondary';
  return <Badge variant={variant} className="max-w-full whitespace-normal break-words text-left leading-4">{status}</Badge>;
}
