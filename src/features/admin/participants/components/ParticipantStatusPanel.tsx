'use client';

import { useActionState, useState } from 'react';
import { CalendarClock, Check, RotateCcw, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { FormSelect } from '@/features/admin/components/FormSelect';
import { ADMIN_DANGER_BUTTON, ADMIN_DANGER_SOLID_BUTTON, ADMIN_FIELD, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import { CLASS_OPTIONS } from '@/features/registration/classCapacity';
import { CANCELLABLE_STATUSES } from '../contracts';
import { formatParticipantFieldValue } from '../presentation';
import { updateParticipantStatusAction, type UpdateParticipantStatusState } from '../actions/updateParticipantStatusAction';

const initialState: UpdateParticipantStatusState = { status: 'idle', message: '' };
type FormAction = (formData: FormData) => void;

type Props = {
  participantId: string;
  status: string;
  previousStatus: string | null;
  jadwalTanggal: string | null;
  jadwalSesi: string | null;
  pilihanKelas: string | null;
  kelasPenempatan: string | null;
};

const STEPS = ['Berkas', 'Jadwal OKB', 'Hadir OKB', 'Keputusan'] as const;

/** Index of the step currently being worked on; STEPS.length means every step is done. */
function currentStep(status: string) {
  switch (status) {
    case 'Terverifikasi': return 1;
    case 'Terjadwal OKB': return 2;
    case 'Sudah OKB': return 3;
    case 'Diterima':
    case 'Ditolak': return STEPS.length;
    default: return 0;
  }
}

export function ParticipantStatusPanel({ participantId, status, previousStatus, jadwalTanggal, jadwalSesi, pilihanKelas, kelasPenempatan }: Props) {
  const [state, formAction, pending] = useActionState(updateParticipantStatusAction, initialState);
  const [rescheduling, setRescheduling] = useState(false);
  const cancelled = status === 'Dibatalkan';
  const canCancel = (CANCELLABLE_STATUSES as readonly string[]).includes(status);
  const hasSchedule = Boolean(jadwalTanggal || jadwalSesi);
  const canDecide = status === 'Sudah OKB' || status === 'Diterima' || status === 'Ditolak';

  return (
    <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-slate-950">Status &amp; OKB</CardTitle>
            <p className="mt-1 text-xs leading-4 text-slate-600">{statusHint(status, previousStatus)}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><CalendarClock aria-hidden="true" className="size-4" /></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-4">
        <StepIndicator current={currentStep(status)} muted={cancelled} />

        {hasSchedule && (
          <section className="space-y-2">
            <h3 className={ADMIN_SECTION_TITLE}>Jadwal OKB</h3>
            <dl className="grid grid-cols-2 divide-x divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-500">Tanggal</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-950">{formatParticipantFieldValue('okb', 'jadwalTanggal', jadwalTanggal)}</dd>
              </div>
              <div className="px-3 py-2">
                <dt className="text-[11px] font-medium text-slate-500">Sesi</dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-slate-950">{jadwalSesi ?? 'Belum diisi'}</dd>
              </div>
            </dl>
          </section>
        )}

        {status === 'Terjadwal OKB' && (
          <form action={formAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="participantId" value={participantId} />
            <Button type="submit" name="intent" value="attend" disabled={pending} className={ADMIN_PRIMARY_BUTTON}>
              <UserCheck aria-hidden="true" className="size-3.5" />Tandai hadir OKB
            </Button>
            {!rescheduling && (
              <Button type="button" onClick={() => setRescheduling(true)} className={ADMIN_SECONDARY_BUTTON}>
                <CalendarClock aria-hidden="true" className="size-3.5" />Jadwalkan ulang
              </Button>
            )}
          </form>
        )}

        {(status === 'Terverifikasi' || rescheduling) && (
          <ScheduleForm
            participantId={participantId}
            title={rescheduling ? 'Jadwalkan ulang OKB' : 'Jadwalkan OKB'}
            jadwalTanggal={jadwalTanggal}
            jadwalSesi={jadwalSesi}
            pending={pending}
            formAction={formAction}
            onCancel={rescheduling ? () => setRescheduling(false) : undefined}
          />
        )}

        {status === 'Diterima' && kelasPenempatan && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
            Kelas Penempatan: <span className="font-semibold">{kelasPenempatan}</span>
            {pilihanKelas && pilihanKelas !== kelasPenempatan && <span className="text-emerald-900/70"> (Pilihan Kelas: {pilihanKelas})</span>}
          </p>
        )}

        {canDecide && (
          <DecisionForm
            participantId={participantId}
            status={status}
            pilihanKelas={pilihanKelas}
            kelasPenempatan={kelasPenempatan}
            pending={pending}
            formAction={formAction}
          />
        )}

        {cancelled && (
          <form action={formAction}>
            <input type="hidden" name="participantId" value={participantId} />
            <Button type="submit" name="intent" value="restore" disabled={pending} className={ADMIN_SECONDARY_BUTTON}>
              <RotateCcw aria-hidden="true" className="size-3.5" />Pulihkan ke {previousStatus ?? 'Menunggu Verifikasi'}
            </Button>
          </form>
        )}

        {state.message && (
          <p aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
            {state.message}
          </p>
        )}

        {canCancel && (
          <div className="border-t border-slate-200 pt-3">
            <CancelDialog participantId={participantId} pending={pending} formAction={formAction} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StepIndicator({ current, muted }: { current: number; muted: boolean }) {
  return (
    <ol aria-label="Tahapan pendaftaran" className={cn('grid grid-cols-4 gap-1', muted && 'opacity-50')}>
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current && !muted;
        return (
          <li key={label} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600' : 'bg-slate-100 text-slate-500',
              )}
            >
              {done ? <Check aria-hidden="true" className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn('text-[11px] leading-4', active ? 'font-semibold text-slate-950' : done ? 'font-medium text-slate-700' : 'text-slate-500')}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ScheduleForm({ participantId, title, jadwalTanggal, jadwalSesi, pending, formAction, onCancel }: {
  participantId: string;
  title: string;
  jadwalTanggal: string | null;
  jadwalSesi: string | null;
  pending: boolean;
  formAction: FormAction;
  onCancel?: () => void;
}) {
  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 p-3">
      <input type="hidden" name="participantId" value={participantId} />
      <h3 className={ADMIN_SECTION_TITLE}>{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="okb-tanggal" className={ADMIN_LABEL}>Tanggal</Label>
          <Input id="okb-tanggal" type="date" name="jadwalTanggal" required defaultValue={jadwalTanggal ?? ''} className={ADMIN_FIELD} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="okb-sesi" className={ADMIN_LABEL}>Sesi</Label>
          <Input id="okb-sesi" type="text" name="jadwalSesi" required maxLength={100} placeholder="Contoh: Sesi 1 (08.00–10.00)" defaultValue={jadwalSesi ?? ''} className={ADMIN_FIELD} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="intent" value="schedule" disabled={pending} className={ADMIN_PRIMARY_BUTTON}>Simpan jadwal</Button>
        {onCancel && <Button type="button" onClick={onCancel} className={ADMIN_SECONDARY_BUTTON}>Batal</Button>}
      </div>
    </form>
  );
}

function DecisionForm({ participantId, status, pilihanKelas, kelasPenempatan, pending, formAction }: {
  participantId: string;
  status: string;
  pilihanKelas: string | null;
  kelasPenempatan: string | null;
  pending: boolean;
  formAction: FormAction;
}) {
  const [keputusan, setKeputusan] = useState(status === 'Diterima' || status === 'Ditolak' ? status : '');
  const [kelas, setKelas] = useState(kelasPenempatan ?? (CLASS_OPTIONS as readonly string[]).find((option) => option === pilihanKelas) ?? '');

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 p-3">
      <input type="hidden" name="participantId" value={participantId} />
      <input type="hidden" name="keputusan" value={keputusan} />
      <h3 className={ADMIN_SECTION_TITLE}>{status === 'Sudah OKB' ? 'Keputusan Penerimaan' : 'Ubah Keputusan Penerimaan'}</h3>
      <RadioGroup value={keputusan} onValueChange={(value) => setKeputusan(String(value))} aria-label="Keputusan" className="flex flex-wrap gap-5">
        {(['Diterima', 'Ditolak'] as const).map((option) => (
          <Label key={option} className="cursor-pointer gap-2 text-sm font-normal text-slate-800">
            <RadioGroupItem value={option} />
            {option}
          </Label>
        ))}
      </RadioGroup>
      <div className="space-y-1.5">
        <Label htmlFor="kelas-penempatan" className={ADMIN_LABEL}>Kelas Penempatan (wajib jika Diterima)</Label>
        <FormSelect
          id="kelas-penempatan"
          name="kelasPenempatan"
          value={kelas}
          placeholder="Pilih kelas"
          options={CLASS_OPTIONS.map((option) => ({ value: option, label: option === pilihanKelas ? `${option} (Pilihan Kelas)` : option }))}
          onChange={setKelas}
          className={ADMIN_FIELD}
        />
      </div>
      <Button type="submit" name="intent" value="decide" disabled={pending || !keputusan} className={ADMIN_PRIMARY_BUTTON}>Simpan keputusan</Button>
    </form>
  );
}

function CancelDialog({ participantId, pending, formAction }: { participantId: string; pending: boolean; formAction: FormAction }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button type="button" className={ADMIN_DANGER_BUTTON} />}>
        <XCircle aria-hidden="true" className="size-3.5" />Batalkan pendaftar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan pendaftar ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Gunakan untuk berkas palsu, tidak hadir OKB tanpa dijadwalkan ulang, atau mengundurkan diri. Kursinya akan dibebaskan untuk pendaftar lain. Tulis alasannya di catatan admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="participantId" value={participantId} />
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <Button type="submit" name="intent" value="cancel" disabled={pending} className={ADMIN_DANGER_SOLID_BUTTON}>Ya, batalkan pendaftar</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
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
