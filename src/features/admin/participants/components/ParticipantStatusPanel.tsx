'use client';

import { useActionState } from 'react';
import { CalendarClock, Gavel, RotateCcw, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CLASS_OPTIONS } from '@/features/registration/classCapacity';
import { CANCELLABLE_STATUSES } from '../contracts';
import { formatParticipantFieldValue } from '../presentation';
import { updateParticipantStatusAction, type UpdateParticipantStatusState } from '../actions/updateParticipantStatusAction';

const initialState: UpdateParticipantStatusState = { status: 'idle', message: '' };

type Props = {
  participantId: string;
  status: string;
  previousStatus: string | null;
  jadwalTanggal: string | null;
  jadwalSesi: string | null;
  pilihanKelas: string | null;
  kelasPenempatan: string | null;
};

export function ParticipantStatusPanel({ participantId, status, previousStatus, jadwalTanggal, jadwalSesi, pilihanKelas, kelasPenempatan }: Props) {
  const [state, formAction, pending] = useActionState(updateParticipantStatusAction, initialState);
  const canSchedule = status === 'Terverifikasi' || status === 'Terjadwal OKB';
  const canCancel = (CANCELLABLE_STATUSES as readonly string[]).includes(status);
  const hasSchedule = Boolean(jadwalTanggal || jadwalSesi);
  const canDecide = status === 'Sudah OKB' || status === 'Diterima' || status === 'Ditolak';
  const defaultPlacement = kelasPenempatan ?? (CLASS_OPTIONS as readonly string[]).find((kelas) => kelas === pilihanKelas) ?? '';

  return (
    <Card className="min-w-0 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-slate-950">Status &amp; OKB</CardTitle>
            <p className="mt-1 text-xs leading-4 text-slate-600">{statusHint(status, previousStatus)}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><CalendarClock aria-hidden="true" className="size-4" /></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {hasSchedule && (
          <dl className="grid grid-cols-2 divide-x divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80">
            <div className="px-3 py-2.5">
              <dt className="text-xs font-medium text-[var(--admin-muted)]">Tanggal OKB</dt>
              <dd className="mt-1 text-sm font-medium">{formatParticipantFieldValue('okb', 'jadwalTanggal', jadwalTanggal)}</dd>
            </div>
            <div className="px-3 py-2.5">
              <dt className="text-xs font-medium text-[var(--admin-muted)]">Sesi OKB</dt>
              <dd className="mt-1 break-words text-sm font-medium">{jadwalSesi ?? 'Belum diisi'}</dd>
            </div>
          </dl>
        )}

        {status === 'Terjadwal OKB' && (
          <form action={formAction}>
            <input type="hidden" name="participantId" value={participantId} />
            <Button type="submit" name="intent" value="attend" disabled={pending} size="sm" className="h-9 gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800">
              <UserCheck aria-hidden="true" className="size-3.5" />Tandai hadir OKB
            </Button>
          </form>
        )}

        {canSchedule && (
          <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 p-3">
            <input type="hidden" name="participantId" value={participantId} />
            <p className="text-sm font-semibold">{status === 'Terjadwal OKB' ? 'Jadwalkan ulang OKB' : 'Jadwalkan OKB'}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Tanggal</span>
                <Input type="date" name="jadwalTanggal" required defaultValue={jadwalTanggal ?? ''} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Sesi</span>
                <Input type="text" name="jadwalSesi" required maxLength={100} placeholder="Contoh: Sesi 1 (08.00–10.00)" defaultValue={jadwalSesi ?? ''} />
              </label>
            </div>
            <Button type="submit" name="intent" value="schedule" disabled={pending} size="sm" className="h-8 rounded-lg bg-slate-900 px-3 text-xs text-white hover:bg-slate-700">Simpan jadwal</Button>
          </form>
        )}

        {status === 'Diterima' && kelasPenempatan && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            Kelas Penempatan: <span className="font-semibold">{kelasPenempatan}</span>
            {pilihanKelas && pilihanKelas !== kelasPenempatan && <span className="text-emerald-900/70"> (Pilihan Kelas: {pilihanKelas})</span>}
          </p>
        )}

        {canDecide && (
          <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 p-3">
            <input type="hidden" name="participantId" value={participantId} />
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Gavel aria-hidden="true" className="size-3.5" />{status === 'Sudah OKB' ? 'Keputusan Penerimaan' : 'Ubah Keputusan Penerimaan'}</p>
            <fieldset className="flex flex-wrap gap-4">
              <legend className="sr-only">Keputusan</legend>
              {(['Diterima', 'Ditolak'] as const).map((keputusan) => (
                <label key={keputusan} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="keputusan" value={keputusan} required defaultChecked={status === keputusan} className="size-4 accent-emerald-700" />
                  {keputusan}
                </label>
              ))}
            </fieldset>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-700">Kelas Penempatan (wajib jika Diterima)</span>
              <select name="kelasPenempatan" defaultValue={defaultPlacement} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007A10]">
                <option value="">Pilih kelas</option>
                {CLASS_OPTIONS.map((kelas) => <option key={kelas} value={kelas}>{kelas}{kelas === pilihanKelas ? ' (Pilihan Kelas)' : ''}</option>)}
              </select>
            </label>
            <Button type="submit" name="intent" value="decide" disabled={pending} size="sm" className="h-8 rounded-lg bg-slate-900 px-3 text-xs text-white hover:bg-slate-700">Simpan keputusan</Button>
          </form>
        )}

        {status === 'Dibatalkan' && (
          <form action={formAction}>
            <input type="hidden" name="participantId" value={participantId} />
            <Button type="submit" name="intent" value="restore" disabled={pending} variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg px-3 text-xs font-semibold">
              <RotateCcw aria-hidden="true" className="size-3.5" />Pulihkan ke {previousStatus ?? 'Menunggu Verifikasi'}
            </Button>
          </form>
        )}

        {canCancel && (
          <details className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-rose-800">Batalkan pendaftar</summary>
            <p className="mt-2 text-xs leading-5 text-rose-900/80">
              Gunakan untuk berkas palsu, tidak hadir OKB tanpa dijadwalkan ulang, atau mengundurkan diri. Kursi pendaftar akan dibebaskan; tulis alasannya di catatan admin.
            </p>
            <form action={formAction} className="mt-3">
              <input type="hidden" name="participantId" value={participantId} />
              <Button type="submit" name="intent" value="cancel" disabled={pending} size="sm" className="h-8 gap-1.5 rounded-lg bg-rose-700 px-3 text-xs font-semibold text-white hover:bg-rose-800">
                <XCircle aria-hidden="true" className="size-3.5" />Ya, batalkan pendaftar
              </Button>
            </form>
          </details>
        )}

        {state.message && (
          <p aria-live="polite" className={state.status === 'success' ? 'text-sm font-semibold text-emerald-700' : 'text-sm font-semibold text-rose-700'}>
            {state.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function statusHint(status: string, previousStatus: string | null) {
  switch (status) {
    case 'Menunggu Unggahan': return 'Berkas belum selesai diunggah orang tua.';
    case 'Menunggu Verifikasi': return 'Verifikasi keempat berkas agar OKB dapat dijadwalkan.';
    case 'Terverifikasi': return 'Berkas lengkap. Tetapkan jadwal OKB.';
    case 'Terjadwal OKB': return 'Tandai hadir setelah OKB, atau jadwalkan ulang bila berhalangan.';
    case 'Sudah OKB': return 'Catat Keputusan Penerimaan yang ditetapkan Panitia.';
    case 'Diterima': return 'Pendaftar diterima oleh Panitia.';
    case 'Ditolak': return 'Pendaftar tidak lolos OKB.';
    case 'Dibatalkan': return `Dibatalkan dari status ${previousStatus ?? 'sebelumnya'}.`;
    default: return `Status saat ini: ${status}.`;
  }
}
