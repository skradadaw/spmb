import Link from 'next/link';
import { ArrowLeft, ClipboardCheck, MessageSquareText } from 'lucide-react';
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
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
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
        <Card className="min-w-0 overflow-hidden rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm xl:sticky xl:top-4">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Dokumen terunggah</CardTitle>
                <p className="mt-1.5 text-xs text-[var(--admin-muted)]">{reviewedCount} dari {uploadedDocuments.length} berkas sudah diperiksa</p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ClipboardCheck aria-hidden="true" className="size-4" /></span>
            </div>
            {followUpCount > 0 && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{followUpCount} berkas perlu ditindaklanjuti</p>}
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-5">
            <div className="space-y-2.5">
              {participant.documents.map(document => {
                const review = participant.documentReviews[document.id];
                return (
                  <article key={document.id} className={`rounded-xl border p-3 transition-colors ${!document.path ? 'border-slate-100 bg-slate-50/60' : review?.status === 'follow_up' ? 'border-amber-200 bg-amber-50/40' : review?.status === 'verified' ? 'border-emerald-100 bg-emerald-50/25' : 'border-slate-200 bg-white'}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold leading-5 text-slate-900">{document.title}</h3>
                        <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${!document.path ? 'bg-slate-100 text-slate-500' : review?.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : review?.status === 'follow_up' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                          {!document.path ? 'Belum tersedia' : review?.status === 'verified' ? 'Terverifikasi' : review?.status === 'follow_up' ? 'Perlu ditindaklanjuti' : 'Belum diperiksa'}
                        </span>
                      </div>
                      {document.path && <DocumentPreviewButton href={`/admin/pendaftar/${participant.id}/dokumen/${document.id}?contentType=${encodeURIComponent(getDocumentContentType(document.path))}`} title={document.title} />}
                    </div>
                    {document.path && (
                      <form action={saveDocumentReviewAction} className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2.5">
                        <input type="hidden" name="participantId" value={participant.id} />
                        <input type="hidden" name="documentId" value={document.id} />
                        <Button type="submit" name="status" value={'verified' satisfies DocumentReviewStatus} variant="outline" size="sm" className="h-8 rounded-lg border-emerald-200 px-2.5 text-xs text-emerald-800 hover:bg-emerald-50">Tandai terverifikasi</Button>
                        <Button type="submit" name="status" value={'follow_up' satisfies DocumentReviewStatus} variant="outline" size="sm" className="h-8 rounded-lg border-amber-200 px-2.5 text-xs text-amber-800 hover:bg-amber-50">Perlu ditindaklanjuti</Button>
                      </form>
                    )}
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
