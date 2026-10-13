'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Loader2, Upload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import type { RegistrationDocumentId } from '@/features/registration/contracts';
import { uploadToSignedTarget } from '@/features/registration/signedUploadClient';
import { compressImage } from '@/features/registration/imageCompression';
import { commitDocumentReplacementAction, prepareDocumentReplacementAction } from '../actions/replaceDocumentActions';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export function ReplaceDocumentButton({ participantId, documentId, title, hasFile, inline = false }: {
  participantId: string;
  documentId: RegistrationDocumentId;
  title: string;
  hasFile: boolean;
  /** A regular secondary button, e.g. in the document viewer's footer. */
  inline?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const label = hasFile ? (inline ? 'Ganti berkas' : 'Ganti') : 'Unggah berkas';

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;

    setBusy(true);
    setError(null);
    try {
      const file = await compressImage(selected);
      const prepared = await prepareDocumentReplacementAction(participantId, documentId, { size: file.size, type: file.type });
      if (!prepared.success) return setError(prepared.error);
      await uploadToSignedTarget(prepared.path, prepared.token, file);
      const committed = await commitDocumentReplacementAction(participantId, documentId, prepared.path);
      if (!committed.success) setError(committed.error);
    } catch {
      setError('Berkas gagal diunggah. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={cn('flex shrink-0 flex-col gap-1', hasFile && !inline ? 'items-end' : 'items-start')}>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} aria-label={`Pilih berkas pengganti ${title}`} />
      <Button
        type="button"
        variant={hasFile ? 'ghost' : 'outline'}
        size="sm"
        disabled={busy}
        // An existing file is only replaced after confirming; a missing one opens the picker directly.
        onClick={() => (hasFile ? setConfirmOpen(true) : inputRef.current?.click())}
        aria-label={`${label} ${title}`}
        className={inline ? ADMIN_SECONDARY_BUTTON : cn(
          'shrink-0 gap-1.5 rounded-lg text-xs font-semibold shadow-none',
          // With a file the action sits beside the title; without one it fills the empty action row.
          hasFile
            ? '-mr-1.5 -mt-1 h-7 px-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            : 'h-8 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50',
        )}
      >
        {busy ? <Loader2 aria-hidden="true" className="size-3 animate-spin" /> : <Upload aria-hidden="true" className="size-3" />}
        {busy ? 'Mengunggah...' : label}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti {title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Berkas lama akan dihapus setelah berkas baru berhasil diperiksa sistem, dan status verifikasinya kembali &quot;Belum diperiksa&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <Button type="button" onClick={() => { setConfirmOpen(false); inputRef.current?.click(); }}>
              <Upload aria-hidden="true" />Pilih berkas
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <span role="alert" className={cn('max-w-[11rem] text-[11px] leading-4 text-rose-700', hasFile && !inline && 'text-right')}>{error}</span>}
    </span>
  );
}
