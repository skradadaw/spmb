'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CheckCircle2, ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ADMIN_ACTIONS, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { uploadToSignedTarget } from '@/features/registration/signedUploadClient';
import { activateTemplateAction, checkTemplateAction, discardTemplateAction, prepareTemplateUploadAction } from '../actions/templateActions';

const TEMPLATE_BUCKET = 'template_surat';
/** Tautan pratinjau tampil sebagai tombol sekunder, seukuran tombol lain di kartu. */
const LINK_BUTTON = `inline-flex items-center justify-center whitespace-nowrap transition-colors ${ADMIN_SECONDARY_BUTTON}`;

const previewHref = (sample: 'biasa' | 'panjang', path?: string) =>
  `/admin/okb/pengumuman/template/pratinjau?contoh=${sample}${path ? `&path=${encodeURIComponent(path)}` : ''}`;

/** Unggah template Surat Penerimaan, periksa pratinjaunya, lalu aktifkan (ADR 0002). */
export function TemplateCard({ active }: { active: { uploadedAt: string } | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy('Mengunggah...');
    setMessage(null);
    try {
      const prepared = await prepareTemplateUploadAction({ size: file.size, type: file.type });
      if (!prepared.success) return setMessage({ tone: 'error', text: prepared.error });
      await uploadToSignedTarget(prepared.path, prepared.token, file, TEMPLATE_BUCKET);
      const checked = await checkTemplateAction(prepared.path);
      if (!checked.success) return setMessage({ tone: 'error', text: checked.error });
      setPendingPath(prepared.path);
    } catch {
      setMessage({ tone: 'error', text: 'Template gagal diunggah. Periksa koneksi lalu coba lagi.' });
    } finally {
      setBusy(null);
    }
  }

  async function activate() {
    if (!pendingPath) return;
    setBusy('Mengaktifkan...');
    const result = await activateTemplateAction(pendingPath);
    setBusy(null);
    if (!result.success) return setMessage({ tone: 'error', text: result.error });
    setPendingPath(null);
    setMessage({ tone: 'success', text: 'Template baru aktif. Surat Penerimaan berikutnya memakai template ini.' });
    router.refresh();
  }

  async function discard() {
    if (!pendingPath) return;
    setBusy('Membatalkan...');
    await discardTemplateAction(pendingPath);
    setBusy(null);
    setPendingPath(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {!active && (
        <p data-template-status className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
          Belum ada template aktif. Hasil OKB belum dapat diumumkan.
        </p>
      )}

      {pendingPath ? (
        <section aria-label="Pratinjau template baru" className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Periksa pratinjau sebelum mengaktifkan</p>
            <p className="text-xs leading-5 text-[var(--admin-muted)]">Pastikan setiap data berada tepat di tempatnya, termasuk untuk nama yang sangat panjang.</p>
          </div>
          <iframe title="Pratinjau Surat Penerimaan" src={previewHref('biasa', pendingPath)} className="hidden h-[32rem] w-full rounded-lg border border-[var(--admin-border)] bg-white md:block" />
          <div className={ADMIN_ACTIONS}>
            <a href={previewHref('biasa', pendingPath)} target="_blank" rel="noreferrer" className={LINK_BUTTON}><ExternalLink aria-hidden="true" className="size-3.5" />Pratinjau nama biasa</a>
            <a href={previewHref('panjang', pendingPath)} target="_blank" rel="noreferrer" className={LINK_BUTTON}><ExternalLink aria-hidden="true" className="size-3.5" />Pratinjau nama sangat panjang</a>
            <Button type="button" onClick={discard} disabled={Boolean(busy)} className={ADMIN_SECONDARY_BUTTON}>Batal</Button>
            <Button type="button" onClick={activate} disabled={Boolean(busy)} className={ADMIN_PRIMARY_BUTTON}><CheckCircle2 aria-hidden="true" className="size-3.5" />Aktifkan template</Button>
          </div>
        </section>
      ) : (
        <div className={cn(ADMIN_ACTIONS, 'mt-auto')}>
          {active && (
            <p data-template-status className="mr-auto inline-flex items-center gap-1.5 text-xs text-[var(--admin-muted)]">
              <FileText aria-hidden="true" className="size-3.5 shrink-0" />
              Diunggah {format(new Date(active.uploadedAt), 'd MMM yyyy, HH.mm', { locale: idLocale })}
            </p>
          )}
          {active && <a href={previewHref('biasa')} target="_blank" rel="noreferrer" className={LINK_BUTTON}><ExternalLink aria-hidden="true" className="size-3.5" />Lihat pratinjau</a>}
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} aria-label="Pilih file template PDF" />
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={Boolean(busy)} className={ADMIN_PRIMARY_BUTTON}>
            {busy ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Upload aria-hidden="true" className="size-3.5" />}
            {busy ?? (active ? 'Ganti template' : 'Unggah template')}
          </Button>
        </div>
      )}

      {busy && pendingPath && <p className="text-xs text-[var(--admin-muted)]">{busy}</p>}
      {message && (
        <p aria-live="polite" className={cn('text-xs font-semibold', message.tone === 'success' ? 'text-emerald-700' : 'text-rose-700')}>{message.text}</p>
      )}
    </div>
  );
}
