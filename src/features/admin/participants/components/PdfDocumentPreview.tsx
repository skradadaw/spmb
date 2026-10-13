'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, LoaderCircle, Maximize2, Minus, Plus } from 'lucide-react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

type LoadState = 'loading' | 'ready' | 'error';

/** Renders already-downloaded PDF bytes; the viewer fetches them (with progress and caching) beforehand. */
export function PdfDocumentPreview({ href, title = 'dokumen', data }: { href: string; title?: string; data: Uint8Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const updateWidth = () => setContainerWidth(element.clientWidth);
    updateWidth();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let loadingTask: PDFDocumentLoadingTask | null = null;
    const load = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        // PDF.js may transfer the buffer to its worker, so it gets a copy and a retry still has the original.
        loadingTask = pdfjs.getDocument({ data: data.slice() });
        const pdf = await loadingTask.promise;
        if (controller.signal.aborted) {
          await loadingTask.destroy();
          return;
        }
        documentRef.current = pdf;
        setPageCount(pdf.numPages);
        setPageNumber(1);
        setLoadState('ready');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadState('error');
      }
    };
    void load();
    return () => {
      controller.abort();
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      documentRef.current = null;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [attempt, data]);

  useEffect(() => {
    const pdf = documentRef.current;
    const canvas = canvasRef.current;
    if (loadState !== 'ready' || !pdf || !canvas) return;
    let cancelled = false;
    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const resolvedScale = fitWidth && containerWidth > 0 ? Math.max(0.5, Math.min(3, (containerWidth - 32) / baseViewport.width)) : scale;
      const viewport = page.getViewport({ scale: resolvedScale });
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      renderTaskRef.current?.cancel();
      const task = page.render({ canvas, viewport, transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0] });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (error) {
        if (!cancelled && !(error instanceof Error && error.name === 'RenderingCancelledException')) setLoadState('error');
      }
    };
    void renderPage();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [containerWidth, fitWidth, loadState, pageNumber, scale]);

  function changeScale(delta: number) {
    setFitWidth(false);
    setScale(current => Math.max(0.5, Math.min(3, Number((current + delta).toFixed(2)))));
  }

  return (
    <div data-testid="pdfjs-preview" className="flex h-full min-h-0 flex-col">
      <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        {loadState === 'loading' && <div role="status" className="flex h-full items-center justify-center gap-2 text-sm font-medium text-slate-300"><LoaderCircle aria-hidden="true" className="size-5 animate-spin" />Memuat PDF…</div>}
        {loadState === 'error' && <div role="alert" className="mx-auto mt-12 max-w-sm rounded-xl border border-rose-400/20 bg-slate-950/80 p-5 text-center text-sm text-slate-200"><p className="font-semibold text-white">PDF tidak dapat ditampilkan</p><p className="mt-1 text-xs leading-5 text-slate-400">Berkas gagal diproses oleh renderer PDF.</p><button type="button" onClick={() => { setLoadState('loading'); setAttempt(value => value + 1); }} className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100">Coba lagi</button></div>}
        <canvas ref={canvasRef} aria-label={`Halaman ${pageNumber} dari ${pageCount}`} className={`mx-auto bg-white shadow-2xl ${loadState === 'ready' ? 'block' : 'hidden'}`} />
      </div>
      {loadState === 'ready' && <div className="flex flex-wrap items-center justify-center gap-1 border-t border-white/10 bg-slate-950/90 p-2 backdrop-blur">
        <button type="button" aria-label="Halaman sebelumnya" disabled={pageNumber <= 1} onClick={() => setPageNumber(value => value - 1)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 disabled:opacity-30"><ChevronLeft aria-hidden="true" className="size-4" /></button>
        <span className="min-w-20 text-center text-xs font-semibold tabular-nums text-white">{pageNumber} / {pageCount}</span>
        <button type="button" aria-label="Halaman berikutnya" disabled={pageNumber >= pageCount} onClick={() => setPageNumber(value => value + 1)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 disabled:opacity-30"><ChevronRight aria-hidden="true" className="size-4" /></button>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
        <button type="button" aria-label="Perkecil PDF" onClick={() => changeScale(-0.2)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10"><Minus aria-hidden="true" className="size-4" /></button>
        <button
          type="button"
          aria-label="Sesuaikan lebar"
          aria-pressed={fitWidth}
          onClick={() => {
            setFitWidth(current => !current);
            if (fitWidth) setScale(1);
          }}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
            fitWidth ? 'bg-white/20 text-white' : 'text-slate-200 hover:bg-white/10'
          }`}
        >
          <Maximize2 aria-hidden="true" className="size-3.5" />Lebar
        </button>
        <button type="button" aria-label="Perbesar PDF" onClick={() => changeScale(0.2)} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10"><Plus aria-hidden="true" className="size-4" /></button>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
        <a
          href={`${href}${href.includes('?') ? '&' : '?'}download=1`}
          download={`${title}.pdf`}
          aria-label="Unduh berkas PDF"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
        >
          <Download aria-hidden="true" className="size-3.5" />
          Unduh
        </a>
      </div>}
    </div>
  );
}
