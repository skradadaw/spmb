'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegistrationProof } from '../contracts';

export function DownloadProofButton({ proof, className }: { proof: RegistrationProof; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    setBusy(true);
    setFailed(false);
    try {
      // Dimuat saat dibutuhkan agar jsPDF tidak membebani halaman awal.
      const { downloadRegistrationProof } = await import('../registrationProofPdf');
      await downloadRegistrationProof(proof);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={cn('inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70', className)}
      >
        {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Download aria-hidden="true" className="size-4" />}
        Unduh Bukti Pendaftaran
      </button>
      {failed && <span role="alert" className="text-xs text-red-600">Bukti gagal dibuat. Silakan coba lagi.</span>}
    </span>
  );
}
