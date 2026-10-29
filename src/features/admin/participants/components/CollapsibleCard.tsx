'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Kartu samping di detail pendaftar yang dapat dibuka-tutup lewat seluruh header.
 * Isinya tetap terpasang saat ditutup, jadi formulir dan prefetch berkas tidak kehilangan keadaannya.
 */
export function CollapsibleCard({ title, hint, contentClassName, children }: {
  title: string;
  hint: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className={cn('group relative cursor-pointer bg-slate-50/80 px-4 py-3 transition-colors hover:bg-slate-100/80', open && 'border-b border-slate-200')}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base font-bold leading-6 tracking-tight text-slate-950">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={contentId}
                onClick={() => setOpen(value => !value)}
                className="text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-emerald-500"
              >
                {title}
              </button>
            </CardTitle>
            <p className="mt-0.5 text-xs leading-4 text-slate-600">{hint}</p>
          </div>
          {/* Penanda yang terlihat; klik ditangani tombol judul yang menutupi seluruh header. */}
          <span aria-hidden="true" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors group-hover:border-slate-300 group-hover:text-slate-950">
            {open ? 'Tutup' : 'Buka'}
            <ChevronDown className={cn('size-4 transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')} />
          </span>
        </div>
      </CardHeader>
      <CardContent id={contentId} hidden={!open} className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
