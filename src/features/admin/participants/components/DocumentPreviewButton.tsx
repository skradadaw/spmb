'use client';

import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Download, Eye, Minus, Plus, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';

type ViewState = { scale: number; x: number; y: number };
type DragState = { pointerId: number; startX: number; startY: number; x: number; y: number };

function getPreviewType(href: string) {
  const contentType = new URL(href, 'http://localhost').searchParams.get('contentType');
  return contentType?.startsWith('image/') ? 'image' : 'pdf';
}

function getDownloadHref(href: string) {
  const url = new URL(href, 'http://localhost');
  url.searchParams.set('download', '1');
  return `${url.pathname}${url.search}`;
}

export function DocumentPreviewButton({ href, title }: { href: string; title: string }) {
  const previewType = getPreviewType(href);
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);
  const downloadHref = getDownloadHref(href);

  function handlePreviewWheel(event: WheelEvent<HTMLDivElement>) {
    if (previewType !== 'image') return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    setView(current => {
      const scale = Math.min(4, Math.max(0.5, current.scale + (event.deltaY < 0 ? 0.2 : -0.2)));
      const ratio = scale / current.scale;
      return {
        scale,
        x: pointerX - (pointerX - current.x) * ratio,
        y: pointerY - (pointerY - current.y) * ratio,
      };
    });
  }

  function changeZoom(direction: -1 | 1) {
    setView(current => {
      const scale = Math.min(4, Math.max(0.5, current.scale + direction * 0.2));
      const ratio = scale / current.scale;
      return { scale, x: current.x * ratio, y: current.y * ratio };
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
    setView({ scale: 1, x: 0, y: 0 });
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger aria-label={`Lihat berkas ${title}`} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <Eye aria-hidden="true" className="size-3.5" />Lihat berkas
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex h-[min(78dvh,48rem)] w-[min(88vw,56rem)] max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:opacity-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <Dialog.Title className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">Berkas {title}</Dialog.Title>
            <div className="flex shrink-0 items-center gap-1">
              {previewType === 'image' && (
                <div className="mr-1 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button type="button" aria-label="Perkecil" disabled={view.scale <= 0.5} onClick={() => changeZoom(-1)} className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><Minus aria-hidden="true" className="size-4" /></button>
                  <span aria-live="polite" className="min-w-12 text-center text-xs font-medium tabular-nums text-slate-600">{Math.round(view.scale * 100)}%</span>
                  <button type="button" aria-label="Perbesar" disabled={view.scale >= 4} onClick={() => changeZoom(1)} className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><Plus aria-hidden="true" className="size-4" /></button>
                  <button type="button" aria-label="Atur ulang zoom" disabled={view.scale === 1} onClick={resetZoom} className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw aria-hidden="true" className="size-3.5" /></button>
                </div>
              )}
              <a href={downloadHref} aria-label={`Unduh berkas ${title}`} download className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><Download aria-hidden="true" className="size-4" /></a>
              <Dialog.Close aria-label="Tutup berkas" onClick={resetZoom} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><X aria-hidden="true" className="size-4" /></Dialog.Close>
            </div>
          </div>
          <div data-document-preview onWheel={handlePreviewWheel} onDoubleClick={event => { if (previewType === 'image') { event.preventDefault(); if (view.scale === 1) { const bounds = event.currentTarget.getBoundingClientRect(); setView({ scale: 2, x: -(event.clientX - bounds.left), y: -(event.clientY - bounds.top) }); } else { resetZoom(); } } }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className={`relative min-h-0 flex-1 overflow-hidden bg-slate-100 p-2 sm:p-4 ${view.scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}>
            {previewType === 'image' ? (
              <Image src={href} alt={title} width={1600} height={1200} unoptimized className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain sm:inset-4 sm:h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)]" style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`, transformOrigin: 'top left', transition: dragging ? 'none' : 'transform 160ms ease-out' }} draggable={false} />
            ) : (
              <iframe src={href} title={`Berkas ${title}`} className="h-full min-h-0 w-full flex-1 bg-white" />
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
