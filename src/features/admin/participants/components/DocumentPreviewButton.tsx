'use client';

import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import dynamic from 'next/dynamic';
import { Dialog } from '@base-ui/react/dialog';
import { Download, Eye, FileText, ImageIcon, Minus, Plus, RotateCcw, RotateCw, X } from 'lucide-react';
import Image from 'next/image';

type ViewState = { scale: number; x: number; y: number; rotation: number };
type DragState = { pointerId: number; startX: number; startY: number; x: number; y: number };

const PdfDocumentPreview = dynamic(() => import('./PdfDocumentPreview').then(module => module.PdfDocumentPreview), {
  ssr: false,
  loading: () => <div role="status" className="flex h-full items-center justify-center text-sm font-medium text-slate-300">Menyiapkan renderer PDF…</div>,
});

function getPreviewType(href: string) {
  const contentType = new URL(href, 'http://localhost').searchParams.get('contentType');
  return contentType?.startsWith('image/') ? 'image' : 'pdf';
}

export function DocumentPreviewButton({ href, title, compact = false }: { href: string; title: string; compact?: boolean }) {
  const previewType = getPreviewType(href);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0, rotation: 0 });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const drag = useRef<DragState | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }
  function handlePreviewWheel(event: WheelEvent<HTMLDivElement>) {
    if (previewType !== 'image') return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const localX = pointerX - centerX;
      const localY = pointerY - centerY;
    setView(current => {
      const scale = Math.min(4, Math.max(0.5, current.scale + (event.deltaY < 0 ? 0.2 : -0.2)));
      const ratio = scale / current.scale;
      return {
        scale,
        x: localX - (localX - current.x) * ratio,
        y: localY - (localY - current.y) * ratio,
        rotation: current.rotation,
      };
    });
  }

  function changeZoom(direction: -1 | 1) {
    setView(current => {
      const scale = Math.min(4, Math.max(0.5, current.scale + direction * 0.2));
      const ratio = scale / current.scale;
      return { scale, x: current.x * ratio, y: current.y * ratio, rotation: current.rotation };
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (previewType !== 'image' || view.scale <= 1 || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const start = drag.current;
    setView(current => ({ ...current, x: start.x + event.clientX - start.startX, y: start.y + event.clientY - start.startY }));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
  }

  function resetZoom() {
    setView({ scale: 1, x: 0, y: 0, rotation: 0 });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger aria-label={previewType === 'pdf' ? `Lihat pratinjau PDF ${title}` : `Lihat berkas ${title}`} className={`inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${compact ? 'gap-1 px-2 text-[11px]' : 'gap-1.5 px-2.5 text-xs'}`}>
        <Eye aria-hidden="true" className="size-3.5" />Lihat berkas
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex h-[min(90dvh,56rem)] w-[min(94vw,72rem)] max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/50 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {previewType === 'pdf' ? <FileText aria-hidden="true" className="size-4" /> : <ImageIcon aria-hidden="true" className="size-4" />}
              </span>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-sm font-semibold text-slate-950">Berkas {title}</Dialog.Title>
                <span className="mt-0.5 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{previewType === 'pdf' ? 'PDF' : 'Gambar'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${href}${href.includes('?') ? '&' : '?'}download=1`}
                download
                aria-label={`Unduh berkas ${title}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Download aria-hidden="true" className="size-4 text-slate-600" />
                <span className="hidden sm:inline">Unduh berkas</span>
              </a>
              <Dialog.Close aria-label="Tutup berkas" onClick={resetZoom} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><X aria-hidden="true" className="size-4" /></Dialog.Close>
            </div>
          </header>
          <div data-document-preview onWheel={handlePreviewWheel} onDoubleClick={event => { if (previewType === 'image') { event.preventDefault(); if (view.scale === 1) { const bounds = event.currentTarget.getBoundingClientRect(); setView({ scale: 2, x: -(event.clientX - bounds.left), y: -(event.clientY - bounds.top), rotation: view.rotation }); } else { resetZoom(); } } }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className={`relative min-h-0 flex-1 overflow-hidden bg-slate-900 ${view.scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}>
            {previewType === 'image' ? (
              <>
                <Image src={href} alt={title} width={1600} height={1200} unoptimized className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] object-contain sm:inset-5 sm:h-[calc(100%-2.5rem)] sm:w-[calc(100%-2.5rem)]" style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) rotate(${view.rotation}deg) scale(${view.scale})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 160ms ease-out' }} draggable={false} />
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-slate-950/85 p-1 shadow-xl backdrop-blur sm:bottom-5">
                  <button type="button" aria-label="Perkecil" disabled={view.scale <= 0.5} onClick={() => changeZoom(-1)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"><Minus aria-hidden="true" className="size-4" /></button>
                  <span aria-live="polite" className="min-w-14 text-center text-xs font-semibold tabular-nums text-white">{Math.round(view.scale * 100)}%</span>
                  <button type="button" aria-label="Perbesar" disabled={view.scale >= 4} onClick={() => changeZoom(1)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"><Plus aria-hidden="true" className="size-4" /></button>
                  <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-white/15" />
                  <button type="button" aria-label="Putar ke kiri" onClick={() => setView(current => ({ ...current, rotation: current.rotation - 90 }))} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white"><RotateCcw aria-hidden="true" className="size-4" /></button>
                  <button type="button" aria-label="Putar ke kanan" onClick={() => setView(current => ({ ...current, rotation: current.rotation + 90 }))} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white"><RotateCw aria-hidden="true" className="size-4" /></button>
                  <button type="button" aria-label="Atur ulang tampilan" disabled={view.scale === 1 && view.rotation === 0 && view.x === 0 && view.y === 0} onClick={resetZoom} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"><span className="text-[10px] font-bold">1:1</span></button>
                </div>
              </>
            ) : (
              <PdfDocumentPreview href={href} />
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
