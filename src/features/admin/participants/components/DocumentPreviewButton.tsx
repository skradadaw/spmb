'use client';

import { useCallback, useRef, useState, useTransition, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import dynamic from 'next/dynamic';
import { Dialog } from '@base-ui/react/dialog';
import { Check, ChevronLeft, ChevronRight, Download, Eye, FileText, ImageIcon, Loader2, Minus, Plus, RotateCcw, RotateCw, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_ACTIONS, ADMIN_CHOICE_BUTTON, ADMIN_DANGER_BUTTON, ADMIN_DONE_BUTTON, ADMIN_PAYMENT_DONE, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import type { RegistrationDocumentId } from '@/features/registration/contracts';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import { savePaymentMethodAction } from '../actions/savePaymentMethodAction';
import { PAYMENT_METHODS, type PaymentMethod } from '../contracts';
import { useDocumentBytes } from './useDocumentBytes';
import { ReplaceDocumentButton } from './ReplaceDocumentButton';

export type ViewerDocument = {
  id: RegistrationDocumentId;
  title: string;
  /** Versioned preview URL; a Berkas Pengganti gets a new one, so the browser may cache it. */
  href: string;
  verified: boolean;
  /** When an admin replaced the file; null for the registration upload. */
  replacedAt: string | null;
  /** Metode Pembayaran OKB; given only for the Bukti Pembayaran, which is verified by choosing it. */
  paymentMethod?: PaymentMethod | null;
};

type ViewState = { scale: number; x: number; y: number; rotation: number };
type DragState = { pointerId: number; startX: number; startY: number; x: number; y: number };
type PinchState = { distance: number; scale: number };

const INITIAL_VIEW: ViewState = { scale: 1, x: 0, y: 0, rotation: 0 };
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

const PdfDocumentPreview = dynamic(() => import('./PdfDocumentPreview').then(module => module.PdfDocumentPreview), {
  ssr: false,
  loading: () => <div role="status" className="flex h-full items-center justify-center text-sm font-medium text-slate-300">Menyiapkan renderer PDF…</div>,
});

export function previewType(href: string) {
  const contentType = new URL(href, 'http://localhost').searchParams.get('contentType');
  return contentType?.startsWith('image/') ? 'image' : 'pdf';
}

function extension(href: string) {
  const contentType = new URL(href, 'http://localhost').searchParams.get('contentType');
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return contentType?.startsWith('image/') ? 'jpg' : 'pdf';
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
}

const dateLabel = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value));
const downloadHref = (href: string) => `${href}${href.includes('?') ? '&' : '?'}download=1`;

/** Next unverified document after `from`, wrapping around; -1 when everything else is verified. */
export function nextUnverifiedIndex(documents: ViewerDocument[], from: number) {
  for (let step = 1; step < documents.length; step++) {
    const index = (from + step) % documents.length;
    if (!documents[index].verified) return index;
  }
  return -1;
}

export function DocumentPreviewButton({ participantId, documents, index, compact = false, className = '' }: {
  participantId: string;
  documents: ViewerDocument[];
  index: number;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const document = documents[index];
  const isPdf = previewType(document.href) === 'pdf';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label={isPdf ? `Lihat pratinjau PDF ${document.title}` : `Lihat berkas ${document.title}`} className={`inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${compact ? 'gap-1.5 px-2 text-xs' : 'gap-1.5 px-2.5 text-xs'} ${className}`}>
        {/* Compact cards are too narrow for the full label; the aria-label still names the document. */}
        <Eye aria-hidden="true" className="size-3.5 shrink-0" />{compact ? 'Lihat' : 'Lihat berkas'}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex h-[min(92dvh,58rem)] w-[min(94vw,72rem)] max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/50 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none">
          <DocumentViewer participantId={participantId} documents={documents} initialIndex={index} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DocumentViewer({ participantId, documents, initialIndex }: { participantId: string; documents: ViewerDocument[]; initialIndex: number }) {
  const [index, setIndex] = useState(initialIndex);
  const [view, setView] = useState<ViewState>(INITIAL_VIEW);
  const [dragging, setDragging] = useState(false);
  const [pinching, setPinching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const drag = useRef<DragState | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<PinchState | null>(null);

  const safeIndex = Math.min(index, documents.length - 1);
  const document = documents[safeIndex];
  const isImage = previewType(document.href) === 'image';
  const isPayment = document.paymentMethod !== undefined;
  const bytes = useDocumentBytes(document.href);

  const goTo = useCallback((next: number) => {
    setIndex((next + documents.length) % documents.length);
    setView(INITIAL_VIEW);
    setNotice(null);
    setReviewError(null);
  }, [documents.length]);

  function changeZoom(direction: -1 | 1) {
    setView(current => {
      const scale = clampScale(current.scale + direction * 0.2);
      const ratio = scale / current.scale;
      return { ...current, scale, x: current.x * ratio, y: current.y * ratio };
    });
  }

  function rotate(direction: -1 | 1) {
    setView(current => ({ scale: 1, x: 0, y: 0, rotation: current.rotation + direction * 90 }));
  }

  /** Saves a review, then moves on to the next unverified Berkas once this one is verified. */
  function submit(save: () => Promise<void>, verifies: boolean, failure: string) {
    setReviewError(null);
    startTransition(async () => {
      try {
        await save();
      } catch {
        setReviewError(failure);
        return;
      }
      if (!verifies) {
        setNotice(null);
        return;
      }
      // The page refreshes with the new review; meanwhile treat this document as verified when picking the next one.
      const next = nextUnverifiedIndex(documents.map((item, position) => position === safeIndex ? { ...item, verified: true } : item), safeIndex);
      if (next === -1) setNotice('Semua berkas sudah diverifikasi.');
      else goTo(next);
    });
  }

  function review(status: 'verified' | 'unverified') {
    const formData = new FormData();
    formData.set('participantId', participantId);
    formData.set('documentId', document.id);
    formData.set('status', status);
    submit(() => saveDocumentReviewAction(formData), status === 'verified', status === 'verified' ? 'Verifikasi gagal disimpan. Coba lagi.' : 'Verifikasi gagal dibatalkan. Coba lagi.');
  }

  function choosePayment(method: PaymentMethod) {
    const formData = new FormData();
    formData.set('participantId', participantId);
    formData.set('method', method);
    formData.set('verify', String(!document.verified));
    submit(() => savePaymentMethodAction(formData), true, 'Metode pembayaran gagal disimpan. Coba lagi.');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('input, textarea')) return;
    if (event.key === 'ArrowRight' && documents.length > 1) return goTo(safeIndex + 1);
    if (event.key === 'ArrowLeft' && documents.length > 1) return goTo(safeIndex - 1);
    if (!isImage) return;
    if (event.key === '+' || event.key === '=') changeZoom(1);
    else if (event.key === '-') changeZoom(-1);
    else if (event.key === '0') setView(INITIAL_VIEW);
    else if (event.key === 'r' || event.key === 'R') rotate(1);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!isImage) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left - bounds.width / 2;
    const localY = event.clientY - bounds.top - bounds.height / 2;
    setView(current => {
      const scale = clampScale(current.scale + (event.deltaY < 0 ? 0.2 : -0.2));
      const ratio = scale / current.scale;
      return { ...current, scale, x: localX - (localX - current.x) * ratio, y: localY - (localY - current.y) * ratio };
    });
  }

  function pinchDistance() {
    const [a, b] = Array.from(pointers.current.values());
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!isImage || (event.target as HTMLElement).closest('button')) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (pointers.current.size === 2) {
      // Two fingers: pinch to zoom instead of dragging.
      drag.current = null;
      setDragging(false);
      pinch.current = { distance: pinchDistance(), scale: view.scale };
      setPinching(true);
      return;
    }
    if (view.scale <= 1 || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const start = pinch.current;
      const scale = clampScale(start.scale * (pinchDistance() / Math.max(1, start.distance)));
      setView(current => ({ ...current, scale }));
      return;
    }
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const start = drag.current;
    setView(current => ({ ...current, x: start.x + event.clientX - start.startX, y: start.y + event.clientY - start.startY }));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2 && pinch.current) {
      pinch.current = null;
      setPinching(false);
    }
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      setDragging(false);
    }
  }

  const verifiedCount = documents.filter(item => item.verified).length;

  return (
    <div className="flex h-full min-h-0 flex-col outline-none" onKeyDown={handleKeyDown}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            {isImage ? <ImageIcon aria-hidden="true" className="size-4" /> : <FileText aria-hidden="true" className="size-4" />}
          </span>
          <div className="min-w-0">
            <Dialog.Title className="truncate text-sm font-semibold text-slate-950">Berkas {document.title}</Dialog.Title>
            <p data-document-info className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] font-medium text-slate-500">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{isImage ? 'Gambar' : 'PDF'}</span>
              {bytes.size !== null && <span>{formatFileSize(bytes.size)}</span>}
              <span aria-hidden="true">·</span>
              <span>{document.replacedAt ? `Diganti admin, ${dateLabel(document.replacedAt)}` : 'Dari pendaftaran'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {documents.length > 1 && <span aria-live="polite" className="hidden text-xs font-semibold tabular-nums text-slate-500 sm:inline">{safeIndex + 1} dari {documents.length}</span>}
          <a
            href={downloadHref(document.href)}
            download={`${document.title}.${extension(document.href)}`}
            aria-label={`Unduh berkas ${document.title}`}
            className={`${ADMIN_SECONDARY_BUTTON} inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
          >
            <Download aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">Unduh</span>
          </a>
          <Dialog.Close aria-label="Tutup berkas" className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><X aria-hidden="true" className="size-4" /></Dialog.Close>
        </div>
      </header>

      <div
        data-document-preview
        onWheel={handleWheel}
        onDoubleClick={event => {
          if (!isImage || (event.target as HTMLElement).closest('button, a')) return;
          if (view.scale !== 1) return setView(INITIAL_VIEW);
          const bounds = event.currentTarget.getBoundingClientRect();
          setView(current => ({ ...current, scale: 2, x: -(event.clientX - bounds.left - bounds.width / 2), y: -(event.clientY - bounds.top - bounds.height / 2) }));
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={isImage ? { touchAction: 'none' } : undefined}
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-900 ${isImage && view.scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      >
        {bytes.state === 'loading' && (
          <div role="status" className="flex w-full max-w-sm flex-col items-center gap-3 px-6">
            <div aria-hidden="true" className="h-56 w-40 animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none" />
            <p className="text-xs font-semibold text-slate-300">Memuat berkas…{bytes.progress !== null ? ` ${bytes.progress}%` : ''}</p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-150" style={{ width: `${bytes.progress ?? 15}%` }} />
            </div>
          </div>
        )}
        {bytes.state === 'error' && (
          <div role="alert" className="mx-4 max-w-sm rounded-xl border border-rose-400/20 bg-slate-950/80 p-5 text-center text-sm text-slate-200">
            <p className="font-semibold text-white">Berkas gagal dimuat</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Periksa koneksi internet, lalu coba lagi.</p>
            <button type="button" onClick={bytes.retry} className={`${ADMIN_SECONDARY_BUTTON} mt-4`}>Coba lagi</button>
          </div>
        )}
        {bytes.state === 'ready' && isImage && bytes.objectUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL; next/image cannot optimise it */}
            <img
              src={bytes.objectUrl}
              alt={document.title}
              draggable={false}
              className="pointer-events-none max-h-full max-w-full select-none object-contain p-4 sm:p-6"
              style={{
                transform: `translate3d(${view.x}px, ${view.y}px, 0) rotate(${view.rotation}deg) scale(${view.scale})`,
                transformOrigin: 'center center',
                transition: dragging || pinching ? 'none' : 'transform 160ms ease-out',
              }}
            />
            <div
              onDoubleClick={event => event.stopPropagation()}
              onPointerDown={event => event.stopPropagation()}
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-slate-950/85 p-1 shadow-xl backdrop-blur sm:bottom-5"
            >
              <ToolbarButton label="Perkecil" shortcut="−" onClick={() => changeZoom(-1)} disabled={view.scale <= MIN_SCALE}><Minus aria-hidden="true" className="size-4" /></ToolbarButton>
              <span aria-live="polite" className="min-w-14 text-center text-xs font-semibold tabular-nums text-white">{Math.round(view.scale * 100)}%</span>
              <ToolbarButton label="Perbesar" shortcut="+" onClick={() => changeZoom(1)} disabled={view.scale >= MAX_SCALE}><Plus aria-hidden="true" className="size-4" /></ToolbarButton>
              <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-white/15" />
              <ToolbarButton label="Putar ke kiri" onClick={() => rotate(-1)}><RotateCcw aria-hidden="true" className="size-4" /></ToolbarButton>
              <ToolbarButton label="Putar ke kanan" shortcut="R" onClick={() => rotate(1)}><RotateCw aria-hidden="true" className="size-4" /></ToolbarButton>
              <ToolbarButton label="Atur ulang tampilan" shortcut="0" onClick={() => setView(INITIAL_VIEW)} disabled={view.scale === 1 && view.rotation === 0 && view.x === 0 && view.y === 0}><span className="text-[10px] font-bold">1:1</span></ToolbarButton>
            </div>
          </>
        )}
        {bytes.state === 'ready' && !isImage && bytes.data && <PdfDocumentPreview href={document.href} title={document.title} data={bytes.data} />}

        {documents.length > 1 && (
          <>
            <button type="button" aria-label="Berkas sebelumnya" onClick={() => goTo(safeIndex - 1)} className="absolute left-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-white shadow-lg backdrop-blur transition-colors hover:bg-slate-950 sm:left-4"><ChevronLeft aria-hidden="true" className="size-5" /></button>
            <button type="button" aria-label="Berkas berikutnya" onClick={() => goTo(safeIndex + 1)} className="absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-white shadow-lg backdrop-blur transition-colors hover:bg-slate-950 sm:right-4"><ChevronRight aria-hidden="true" className="size-5" /></button>
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">{verifiedCount} dari {documents.length} terverifikasi</span>
          {notice && <span role="status" className="font-semibold text-emerald-700">{notice}</span>}
          {reviewError && <span role="alert" className="font-semibold text-rose-700">{reviewError}</span>}
        </div>
        <div className={ADMIN_ACTIONS}>
          <ReplaceDocumentButton participantId={participantId} documentId={document.id} title={document.title} hasFile inline />
          {document.verified && (isPayment ? document.paymentMethod : true) ? (
            <>
              <Button type="button" disabled={pending} onClick={() => review('unverified')} aria-label={`Batalkan verifikasi ${document.title}`} className={ADMIN_DANGER_BUTTON}>
                {pending ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Undo2 aria-hidden="true" className="size-3.5" />}Batalkan verifikasi
              </Button>
              <span data-payment-method={document.paymentMethod ?? undefined} className={`${isPayment && document.paymentMethod ? ADMIN_PAYMENT_DONE[document.paymentMethod] : ADMIN_DONE_BUTTON} inline-flex items-center`}>
                <Check aria-hidden="true" className="size-3.5" />{isPayment ? PAYMENT_METHODS.find(option => option.value === document.paymentMethod)?.label : 'Terverifikasi'}
              </span>
            </>
          ) : isPayment ? (
            <div role="group" aria-label={`Metode pembayaran ${document.title}`} className="flex items-center gap-2">
              {pending && <Loader2 aria-hidden="true" className="size-3.5 animate-spin text-slate-500" />}
              {PAYMENT_METHODS.map(option => (
                <Button key={option.value} type="button" disabled={pending} onClick={() => choosePayment(option.value)} className={ADMIN_CHOICE_BUTTON}>
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <Button type="button" disabled={pending} onClick={() => review('verified')} aria-label={`Verifikasi ${document.title}`} className={ADMIN_PRIMARY_BUTTON}>
              {pending ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Check aria-hidden="true" className="size-3.5" />}Verifikasi
            </Button>
          )}
        </div>
      </footer>
      <p className="sr-only">Gunakan panah kiri dan kanan untuk berpindah berkas. Pada gambar: plus dan minus untuk zoom, 0 untuk ukuran normal, R untuk memutar.</p>
    </div>
  );
}

function ToolbarButton({ label, shortcut, onClick, disabled, children }: { label: string; shortcut?: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={shortcut ? `${label} (${shortcut})` : label} disabled={disabled} onClick={onClick} className="inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
      {children}
    </button>
  );
}
