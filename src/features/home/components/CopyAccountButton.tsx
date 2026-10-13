'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { actionClass } from './actionStyles';

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
        className={actionClass('solidOnDeep', 'sm')}
      >
        {copyState === 'success' ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {copyState === 'success' ? 'Berhasil disalin' : 'Salin rekening'}
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-public-mint">
        {copyState === 'success' && 'Berhasil disalin ke clipboard.'}
        {copyState === 'error' && 'Clipboard tidak tersedia. Silakan salin manual.'}
      </p>
    </div>
  );
}
