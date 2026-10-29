'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CheckCircle2, ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { uploadToSignedTarget } from '@/features/registration/signedUploadClient';
import { activateTemplateAction, checkTemplateAction, discardTemplateAction, prepareTemplateUploadAction } from '../actions/templateActions';

const TEMPLATE_BUCKET = 'template_surat';
const LINK = 'inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--admin-sidebar)] underline-offset-2 hover:underline';

const previewHref = (sample: 'biasa' | 'panjang', path?: string) =>
  `/admin/pengumuman/template/pratinjau?contoh=${sample}${path ? `&path=${encodeURIComponent(path)}` : ''}`;

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
    <div className="space-y-3">
      <div data-template-status className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5">
        <FileText aria-hidden="true" className="size-4 shrink-0 text-[var(--admin-muted)]" />
        {active ? (
          <>
            <p className="text-sm">Template aktif, diunggah {format(new Date(active.uploadedAt), 'd MMMM yyyy HH.mm', { locale: idLocale })}</p>
            <a href="/admin/pengumuman/template" target="_blank" rel="noreferrer" className={LINK}>Unduh template<ExternalLink aria-hidden="true" className="size-3" /></a>
            <a href={previewHref('biasa')} target="_blank" rel="noreferrer" className={LINK}>Lihat pratinjau<ExternalLink aria-hidden="true" className="size-3" /></a>
          </>
        ) : (
          <p className="text-sm font-medium text-amber-700">Belum ada template aktif. Hasil OKB belum dapat diumumkan.</p>
        )}
      </div>

      {pendingPath ? (
        <section aria-label="Pratinjau template baru" className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-sm font-semibold">Periksa pratinjau sebelum mengaktifkan</p>
          <p className="text-xs leading-5 text-[var(--admin-muted)]">Pastikan nama anak, Nomor VA, serta tempat dan tanggal lahir berada tepat di tempatnya, termasuk untuk nama yang sangat panjang.</p>
          <div className="flex flex-wrap gap-4">
            <a href={previewHref('biasa', pendingPath)} target="_blank" rel="noreferrer" className={LINK}>Pratinjau nama biasa<ExternalLink aria-hidden="true" className="size-3" /></a>
            <a href={previewHref('panjang', pendingPath)} target="_blank" rel="noreferrer" className={LINK}>Pratinjau nama sangat panjang<ExternalLink aria-hidden="true" className="size-3" /></a>
          </div>
          <iframe title="Pratinjau Surat Penerimaan" src={previewHref('biasa', pendingPath)} className="hidden h-[32rem] w-full rounded-lg border border-[var(--admin-border)] bg-white md:block" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={activate} disabled={Boolean(busy)} className={ADMIN_PRIMARY_BUTTON}><CheckCircle2 aria-hidden="true" className="size-3.5" />Aktifkan template</Button>
            <Button type="button" onClick={discard} disabled={Boolean(busy)} className={ADMIN_SECONDARY_BUTTON}>Batal</Button>
          </div>
        </section>
      ) : (
        <div>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} aria-label="Pilih file template PDF" />
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={Boolean(busy)} className={ADMIN_SECONDARY_BUTTON}>
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
