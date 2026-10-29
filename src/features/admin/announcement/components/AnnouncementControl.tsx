'use client';

import { useActionState, useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Megaphone, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import { announceParticipantAction } from '../actions/announceActions';
import type { AnnounceState } from '../announceResult';

const initialState: AnnounceState = { status: 'idle', message: '' };

/** Pengumuman Hasil OKB seorang Pendaftar Diterima/Ditolak: status, lalu Umumkan atau Tarik pengumuman. */
export function AnnouncementControl({ participantId, status, diumumkanPada }: { participantId: string; status: string; diumumkanPada: string | null }) {
  const [state, formAction, pending] = useActionState(announceParticipantAction, initialState);
  const [open, setOpen] = useState(false);
  const announced = Boolean(diumumkanPada);

  return (
    <section data-announcement className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className={ADMIN_SECTION_TITLE}>Pengumuman Hasil OKB</h3>
        <span className={cn('text-[11px] font-semibold', announced ? 'text-emerald-700' : 'text-slate-500')}>
          {announced ? `Diumumkan ${format(new Date(diumumkanPada!), 'd MMM yyyy HH.mm', { locale: idLocale })}` : 'Belum diumumkan'}
        </span>
      </div>
      <p className="text-xs leading-5 text-slate-600">
        {announced
          ? `Orang tua dapat melihat hasil ${status}${status === 'Diterima' ? ' beserta Nomor VA' : ''} di halaman Cek Hasil OKB.`
          : 'Orang tua belum dapat melihat keputusan ini sampai diumumkan.'}
      </p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button type="button" className={announced ? ADMIN_SECONDARY_BUTTON : ADMIN_PRIMARY_BUTTON} />}>
          {announced ? <><Undo2 aria-hidden="true" className="size-3.5" />Tarik pengumuman</> : <><Megaphone aria-hidden="true" className="size-3.5" />Umumkan</>}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{announced ? 'Tarik Pengumuman Hasil OKB?' : `Umumkan hasil ${status}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {announced
                ? 'Orang tua kembali melihat "Hasil OKB belum diumumkan". Apa yang sudah terlanjur dilihat atau diunduh tidak dapat ditarik.'
                : `Orang tua akan langsung melihat hasil ${status}${status === 'Diterima' ? ', Nomor VA, dan Surat Penerimaan' : ''} di halaman Cek Hasil OKB.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={formAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="participantId" value={participantId} />
            <AlertDialogFooter>
              <AlertDialogCancel>Kembali</AlertDialogCancel>
              <Button type="submit" name="intent" value={announced ? 'withdraw' : 'announce'} disabled={pending} className={ADMIN_PRIMARY_BUTTON}>
                {announced ? 'Ya, tarik pengumuman' : 'Ya, umumkan'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      {state.message && (
        <p aria-live="polite" className={cn('text-xs font-semibold', state.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
          {state.message}
        </p>
      )}
    </section>
  );
}
