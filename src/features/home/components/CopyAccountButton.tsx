'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type CopyState = 'idle' | 'success' | 'error';

export default function CopyAccountButton({
  accountNumber,
}: {
  accountNumber: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopyState('success');
      window.setTimeout(() => setCopyState('idle'), 2_000);
    } catch {
      setCopyState('error');
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin nomor rekening"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#007A10] shadow-sm ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copyState === 'success' ? <Check size={17} /> : <Copy size={17} />}
        {copyState === 'success' ? 'Berhasil disalin' : 'Salin rekening'}
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-emerald-50">
        {copyState === 'success' && 'Berhasil disalin ke clipboard.'}
        {copyState === 'error' && 'Clipboard tidak tersedia. Silakan salin manual.'}
      </p>
    </div>
  );
}
