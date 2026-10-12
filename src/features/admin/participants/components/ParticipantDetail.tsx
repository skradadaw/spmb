import Link from 'next/link';
import { ArrowLeft, Check, ClipboardCheck, MessageSquareText } from 'lucide-react';
import { saveParticipantAdminNoteAction } from '../actions/saveParticipantAdminNoteAction';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import { DocumentPreviewButton } from './DocumentPreviewButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DocumentReviewStatus, ParticipantDetail as ParticipantDetailData } from '../contracts';
import { PARTICIPANT_FIELDS, type ParticipantFieldGroupName } from '../fields';
import { formatParticipantFieldValue } from '../presentation';

function getDocumentContentType(path: string) {
  const extension = path.match(/\.(pdf|jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png' || extension === 'webp') return 'image/' + extension;
  return 'application/octet-stream';
}

type GroupProps = {
  title: string;
  name: ParticipantFieldGroupName;
  values: Record<string, string | null>;
  hiddenFields?: string[];
  fullWidthFields?: string[];
};

function Group({ title, name, values, hiddenFields = [], fullWidthFields = [] }: GroupProps) {
  const entries = PARTICIPANT_FIELDS[name]
    .filter(([key]) => !hiddenFields.includes(key))
    .map(([key, , label]) => [key, label, values[key]] as const);

  return (
    <section aria-labelledby={`participant-${name}-heading`} data-detail-group className="grid min-w-0 gap-2 border-b border-slate-200/70 pb-4 last:border-b-0 last:pb-0">
      <h3 id={`participant-${name}-heading`} className="text-sm font-semibold">{title}</h3>
      <dl className="grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 sm:grid-cols-3">
        {entries.map(([key, label, value]) => (
          <div key={key} className={`min-w-0 px-3 py-2.5 ${fullWidthFields.includes(key) ? 'col-span-full' : ''}`}>
            <dt className="text-xs font-medium leading-5 text-[var(--admin-muted)]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium leading-6 text-slate-900">{formatParticipantFieldValue(name, key, value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ParticipantDetail({ participant, backHref = '/admin/pendaftar' }: { participant: ParticipantDetailData; backHref?: string }) {
  const uploadedDocuments = participant.documents.filter(document => document.path);
  const reviewedCount = uploadedDocuments.filter(document => participant.documentReviews[document.id]).length;
  const followUpCount = uploadedDocuments.filter(document => participant.documentReviews[document.id]?.status === 'follow_up').length;

  return (
    <div>
      <Button render={<Link href={backHref} />} variant="ghost" className="mb-4 -ml-2">
        <ArrowLeft aria-hidden="true" />Kembali ke Data Peserta
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Detail peserta</p>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
            {participant.identity.namaLengkap ? formatParticipantFieldValue('identity', 'namaLengkap', participant.identity.namaLengkap) : 'Peserta'}
          </h1>
        </div>
        <Badge>{participant.status}</Badge>
      </div>
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_33rem]">
        <Card className="min-w-0 rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
          <CardHeader className="p-5 pb-3"><CardTitle className="text-base">Informasi siswa</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 pb-5 pt-0 sm:px-5" data-detail-groups>
            <Group title="Identitas anak" name="identity" values={participant.identity} />
            <Group title="Pendaftaran" name="registration" values={participant.registration} />
            <Group title="Sekolah dan prestasi" name="school" values={participant.school} />
            <Group title="Informasi alamat" name="address" values={participant.address} hiddenFields={['provinsi', 'alamatRumah']} />
            <Group title="Data ayah" name="father" values={participant.father} fullWidthFields={['alamat']} />
            <Group title="Data ibu" name="mother" values={participant.mother} fullWidthFields={['alamat']} />
            <Group title="Afiliasi Direktorat 2" name="affiliation" values={participant.affiliation} />
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
          <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight text-slate-950">Dokumen terunggah</CardTitle>
                <p className="mt-1 text-xs leading-4 text-slate-600">{reviewedCount} dari {uploadedDocuments.length} berkas sudah diperiksa</p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><ClipboardCheck aria-hidden="true" className="size-4" /></span>
            </div>
            {followUpCount > 0 && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{followUpCount} berkas perlu ditindaklanjuti</p>}
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-4">
            <div data-testid="document-grid" data-density="compact" className="grid gap-2 md:grid-cols-2">
              {participant.documents.map((document, index) => {
                const review = participant.documentReviews[document.id];
                const status = !document.path ? 'missing' : review?.status ?? 'pending';
                const statusLabel = status === 'missing' ? 'Belum tersedia' : status === 'verified' ? 'Terverifikasi' : status === 'follow_up' ? 'Perlu ditindaklanjuti' : 'Belum diperiksa';
                const statusStyles = status === 'missing' ? 'bg-slate-200 text-slate-700' : status === 'verified' ? 'bg-emerald-100 text-emerald-800' : status === 'follow_up' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700';
                const numberStyles = status === 'missing' ? 'bg-slate-200 text-slate-600' : status === 'verified' ? 'bg-emerald-100 text-emerald-800' : status === 'follow_up' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';
                return (
                  <article
                    key={document.id}
                    data-review-state={status}
                    className={`flex min-w-0 flex-col justify-between rounded-xl border p-2.5 transition-colors ${
                      status === 'missing'
                        ? 'border-slate-300 bg-slate-100'
                        : status === 'follow_up'
                        ? 'border-amber-300 bg-amber-50'
                        : status === 'verified'
                        ? 'border-emerald-400 bg-emerald-100/80'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        data-document-index
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${numberStyles}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-xs font-semibold leading-4 text-slate-950">{document.title}</h3>
                        <div className="mt-1">
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium leading-3 ${statusStyles}`}>
                            {statusLabel}
                          </span>
                        </div>
                        {document.path && (
                          <form action={saveDocumentReviewAction} className="mt-2.5 flex flex-nowrap items-center gap-1.5">
                            <input type="hidden" name="participantId" value={participant.id} />
                            <input type="hidden" name="documentId" value={document.id} />
                            <Button
                              type="submit"
                              name="status"
                              value={'verified' satisfies DocumentReviewStatus}
                              aria-label={`Verifikasi ${document.title}`}
                              aria-pressed={status === 'verified'}
                              size="sm"
                              className={`h-8 shrink-0 gap-1 rounded-md px-2 text-[11px] font-semibold shadow-none ${
                                status === 'verified'
                                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                : 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              <Check aria-hidden="true" className="size-3" />
                              Verifikasi
                            </Button>
                            <DocumentPreviewButton
                              compact
                              href={`/admin/pendaftar/${participant.id}/dokumen/${document.id}?contentType=${encodeURIComponent(
                                getDocumentContentType(document.path),
                              )}`}
                              title={document.title}
                            />
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <form action={saveParticipantAdminNoteAction} className="space-y-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 shadow-sm shadow-blue-950/[0.03]">
              <input type="hidden" name="participantId" value={participant.id} />
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><MessageSquareText aria-hidden="true" className="size-4" /></span>
                <label htmlFor="participant-admin-note" className="text-sm font-semibold text-slate-900">Catatan admin</label>
              </div>
              <p className="text-xs leading-5 text-slate-600">Catatan internal untuk membantu tindak lanjut berkas melalui WhatsApp.</p>
              <textarea id="participant-admin-note" name="adminNote" maxLength={1000} defaultValue={participant.adminNote ?? ''} rows={3} placeholder="Contoh: Hubungi orang tua untuk meminta ulang berkas yang belum jelas." className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-slate-900 shadow-sm outline-none transition focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100" />
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-8 rounded-lg bg-slate-900 px-3 text-xs text-white hover:bg-slate-700">Simpan catatan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
