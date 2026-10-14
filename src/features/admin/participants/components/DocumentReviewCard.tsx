'use client';

import { useOptimistic, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_DONE_BUTTON, ADMIN_PRIMARY_BUTTON } from '@/features/admin/components/adminStyles';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import type { DocumentReviewStatus, ParticipantDocument } from '../contracts';
import { DocumentPreviewButton, type ViewerDocument } from './DocumentPreviewButton';
import { ReplaceDocumentButton } from './ReplaceDocumentButton';

export type DocumentReviewState = 'missing' | 'pending' | 'verified';

/**
 * One Berkas card. Verifikasi shows as done the moment it is clicked; saving and the page refresh take
 * several round trips, and the card goes back (with a message) only if the server refuses.
 */
export function DocumentReviewCard({ participantId, document, status: savedStatus, sourceLabel, viewerDocuments, viewerIndex }: {
  participantId: string;
  document: ParticipantDocument;
  status: DocumentReviewState;
  sourceLabel: string;
  viewerDocuments: ViewerDocument[];
  viewerIndex: number;
}) {
  const [status, setOptimisticStatus] = useOptimistic(savedStatus);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex min-w-0 items-start gap-2.5">
        {/* A checkbox-like marker: ticked when verified, empty while waiting, dashed when missing. */}
        <span
          aria-hidden="true"
          data-document-index
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded ${markerStyles}`}
        >
          {status === 'verified' && <Check className="size-3" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            {/* Two lines reserved so a long title does not make its card taller than its neighbour. */}
            <h3 className="min-h-8 break-words text-xs font-semibold leading-4 text-slate-950">{document.title}</h3>
            {document.path && (
              <ReplaceDocumentButton participantId={participantId} documentId={document.id} title={document.title} hasFile />
            )}
          </div>
          <p data-document-source className="text-[11px] leading-4 text-slate-500">{sourceLabel}</p>
        </div>
      </div>
      {document.path ? (
        // The verify button takes the spare width so "Terverifikasi" fits; "Lihat" only needs its label.
        <form action={verify} className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 pt-3">
          <input type="hidden" name="participantId" value={participantId} />
          <input type="hidden" name="documentId" value={document.id} />
          <Button
            type="submit"
            name="status"
            value={'verified' satisfies DocumentReviewStatus}
            aria-label={`${status === 'verified' ? 'Terverifikasi' : 'Verifikasi'} ${document.title}`}
            aria-pressed={status === 'verified'}
            size="sm"
            className={`${status === 'verified' ? ADMIN_DONE_BUTTON : ADMIN_PRIMARY_BUTTON} w-full min-w-0 px-2`}
          >
            <Check aria-hidden="true" className="size-3 shrink-0" />
            <span className="truncate">{status === 'verified' ? 'Terverifikasi' : 'Verifikasi'}</span>
          </Button>
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
