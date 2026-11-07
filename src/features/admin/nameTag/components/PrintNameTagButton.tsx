'use client';

import { useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { downloadBlob } from '../downloadBlob';
import { nameTagFileName, nameTagPrintState } from '../nameTag';
import { createNameTagPng, loadNameTagTemplate } from '../nameTagCard';

/** Cetak satuan untuk kartu yang rusak, hilang, atau terlewat; boleh diunduh ulang kapan saja. */
export function PrintNameTagButton({ status, namaLengkap, ruangOkb }: { status: string; namaLengkap: string; ruangOkb: string | null }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const state = nameTagPrintState(status, ruangOkb);
  if (state === 'unavailable') return null;

  async function handleClick() {
    if (!ruangOkb) return;
    setBusy(true);
    setFailed(false);
    try {
      const png = await createNameTagPng({ namaLengkap, ruangOkb, template: await loadNameTagTemplate() });
      downloadBlob(png, nameTagFileName(ruangOkb, namaLengkap));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button type="button" onClick={handleClick} disabled={busy || state !== 'ready'} className={ADMIN_SECONDARY_BUTTON}>
        {busy ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Printer aria-hidden="true" className="size-3.5" />}
        Cetak Name Tag
      </Button>
      {state === 'needs-ruang' && <p className="text-[11px] leading-4 text-amber-700">Isi Ruang OKB terlebih dahulu untuk mencetak Name Tag.</p>}
      {failed && <p role="alert" className="text-xs font-semibold text-rose-700">Name Tag gagal dibuat. Silakan coba lagi.</p>}
    </div>
  );
}
