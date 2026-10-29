'use client';

import { useOptimistic, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_CHOICE_BUTTON, ADMIN_DONE_BUTTON, ADMIN_PAYMENT_DONE, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import { savePaymentMethodAction } from '../actions/savePaymentMethodAction';
import { PAYMENT_METHODS, type DocumentReviewStatus, type ParticipantDocument, type PaymentMethod } from '../contracts';
import { DocumentPreviewButton, type ViewerDocument } from './DocumentPreviewButton';
import { ReplaceDocumentButton } from './ReplaceDocumentButton';

export type DocumentReviewState = 'missing' | 'pending' | 'verified';

/**
 * One Berkas card. Verifikasi shows as done the moment it is clicked; saving and the page refresh take
 * several round trips, and the card goes back (with a message) only if the server refuses.
 * The Bukti Pembayaran card passes `paymentMethod`: it is verified by choosing Cash or Transfer instead.
 */
export function DocumentReviewCard({ participantId, document, status: savedStatus, sourceLabel, viewerDocuments, viewerIndex, paymentMethod: savedMethod }: {
  participantId: string;
  document: ParticipantDocument;
  status: DocumentReviewState;
  sourceLabel: string | null;
  viewerDocuments: ViewerDocument[];
  viewerIndex: number;
  /** Metode Pembayaran OKB; given only for the Bukti Pembayaran card. */
  paymentMethod?: PaymentMethod | null;
}) {
  const [status, setOptimisticStatus] = useOptimistic(savedStatus);
  const [method, setOptimisticMethod] = useOptimistic(savedMethod);
  const [error, setError] = useState<string | null>(null);
  const isPayment = savedMethod !== undefined;

  async function choosePayment(formData: FormData) {
    setOptimisticMethod(formData.get('method') as PaymentMethod);
    setOptimisticStatus('verified');
    setError(null);
    try {
      await savePaymentMethodAction(formData);
    } catch {
      setError('Metode pembayaran gagal disimpan. Coba lagi.');
    }
  }

  async function verify(formData: FormData) {
    setOptimisticStatus('verified');
    setError(null);
    try {
      await saveDocumentReviewAction(formData);
    } catch {
      setError('Verifikasi gagal disimpan. Coba lagi.');
    }
  }

  const markerStyles = status === 'missing' ? 'border border-dashed border-slate-300 bg-white' : status === 'verified' ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white';
  return (
    <article
      data-review-state={status}
      className={`flex h-full min-w-0 flex-col rounded-xl border p-3 shadow-sm shadow-slate-950/[0.03] transition-colors ${
        status === 'missing' ? 'border-dashed border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {/* A checkbox-like marker: ticked when verified, empty while waiting, dashed when missing. */}
        <span
          aria-hidden="true"
          data-document-index
          className={`flex size-4 shrink-0 items-center justify-center rounded ${markerStyles}`}
        >
          {status === 'verified' && <Check className="size-3" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-semibold leading-5 text-slate-950">{document.title}</h3>
          {sourceLabel && <p data-document-source className="truncate text-[11px] leading-4 text-slate-500">{sourceLabel}</p>}
        </div>
        {document.path && (
          <ReplaceDocumentButton participantId={participantId} documentId={document.id} title={document.title} hasFile />
        )}
      </div>
      {document.path ? (
        // The verify button takes the spare width so "Terverifikasi" fits; "Lihat" only needs its label.
        <form action={isPayment ? choosePayment : verify} className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 pt-3">
          <input type="hidden" name="participantId" value={participantId} />
          <input type="hidden" name="documentId" value={document.id} />
          {isPayment && <input type="hidden" name="verify" value={String(status !== 'verified')} />}
          {status === 'verified' && (!isPayment || method) ? (
            // A finished state, not a button: undoing it happens in the viewer ("Batalkan verifikasi").
            <span data-payment-method={method ?? undefined} className={`${isPayment && method ? ADMIN_PAYMENT_DONE[method] : ADMIN_DONE_BUTTON} inline-flex w-full min-w-0 items-center justify-center px-2`}>
              <Check aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{isPayment ? PAYMENT_METHODS.find(option => option.value === method)?.label : 'Terverifikasi'}</span>
            </span>
          ) : isPayment ? (
            <div role="group" aria-label={`Metode pembayaran ${document.title}`} className="grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map(option => (
                <Button key={option.value} type="submit" name="method" value={option.value} size="sm" className={`${ADMIN_CHOICE_BUTTON} w-full min-w-0 px-2`}>
                  <span className="truncate">{option.label}</span>
                </Button>
              ))}
            </div>
          ) : (
            <Button
              type="submit"
              name="status"
              value={'verified' satisfies DocumentReviewStatus}
              aria-label={`Verifikasi ${document.title}`}
              size="sm"
              className={`${ADMIN_PRIMARY_BUTTON} w-full min-w-0 px-2`}
            >
              <Check aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">Verifikasi</span>
            </Button>
          )}
          <DocumentPreviewButton
            compact
            participantId={participantId}
            documents={viewerDocuments}
            index={viewerIndex}
          />
          {error && <p role="alert" className="col-span-2 text-[11px] font-semibold leading-4 text-rose-700">{error}</p>}
        </form>
      ) : (
        <div className="mt-auto pt-3">
          <ReplaceDocumentButton participantId={participantId} documentId={document.id} title={document.title} hasFile={false} />
        </div>
      )}
    </article>
  );
}
