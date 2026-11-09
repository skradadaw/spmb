'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { downloadBlob } from '../downloadBlob';
import { nameTagZipFileName, planNameTagZip } from '../nameTag';
import { createNameTagPng, loadNameTagTemplate } from '../nameTagCard';
import type { NameTagPendaftar, NameTagSelection } from '../nameTagGroups';
import { createNameTagZip } from '../nameTagZip';
import { NAME_TAG_CARD, NameTagCardHeader } from './NameTagCardHeader';

/** Cetak sekaligus untuk satu kelompok, bukan hanya yang dicentang; boleh diunduh ulang kapan saja. */
export function DownloadNameTagZip({ selected, members }: { selected: NameTagSelection; members: NameTagPendaftar[] }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { cards, withoutRuangCount } = planNameTagZip(members);

  async function handleClick() {
    setBusy(true);
    setFailed(false);
    try {
      const template = await loadNameTagTemplate();
      const files = [];
      // Satu per satu: setiap kartu memakai canvas ukuran penuh.
      for (const { namaLengkap, ruangOkb, fileName } of cards) {
        files.push({ fileName, png: await createNameTagPng({ namaLengkap, ruangOkb, template }) });
      }
      downloadBlob(await createNameTagZip(files), nameTagZipFileName(selected));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card role="region" aria-labelledby="unduh-name-tag" className={cn(NAME_TAG_CARD, 'space-y-4 p-5')}>
      <NameTagCardHeader id="unduh-name-tag" step={3} title="Unduh Name Tag" />
      <div className="space-y-1 rounded-lg bg-muted px-3 py-2.5 text-xs leading-5">
        <p className="font-semibold text-slate-900">{cards.length} kartu akan diunduh.</p>
        <p className={cn(withoutRuangCount > 0 ? 'font-medium text-amber-700' : 'text-[var(--admin-muted)]', withoutRuangCount === 0 && 'sr-only')}>{withoutRuangCount} Pendaftar tanpa Ruang OKB tidak ikut diunduh.</p>
        {failed && <p role="alert" className="font-semibold text-rose-700">ZIP Name Tag gagal dibuat. Silakan coba lagi.</p>}
      </div>
      <Button type="button" onClick={handleClick} disabled={busy || cards.length === 0} size="lg" className="w-full">
        {busy ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Download aria-hidden="true" className="size-3.5" />}
        Unduh ZIP Name Tag
      </Button>
    </Card>
  );
}
