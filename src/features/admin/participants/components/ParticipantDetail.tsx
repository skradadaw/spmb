import { ArrowLeft, Check, ClipboardCheck, MessageSquareText } from 'lucide-react';
import { saveParticipantAdminNoteAction } from '../actions/saveParticipantAdminNoteAction';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import { DocumentPreviewButton } from './DocumentPreviewButton';
import { ParticipantStatusPanel } from './ParticipantStatusPanel';
import { ParticipantEditableGroup } from './ParticipantEditableGroup';
import { ReplaceDocumentButton } from './ReplaceDocumentButton';
import { DownloadProofButton } from '@/features/registration/components/DownloadProofButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ADMIN_ACTION_BUTTON } from '@/features/admin/components/adminStyles';
import { Textarea } from '@/components/ui/textarea';
import type { DocumentReviewStatus, ParticipantDetail as ParticipantDetailData } from '../contracts';
import { formatParticipantFieldValue } from '../presentation';

function getDocumentContentType(path: string) {
  const extension = path.match(/\.(pdf|jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png' || extension === 'webp') return 'image/' + extension;
  return 'application/octet-stream';
}

export function ParticipantDetail({ participant, backHref = '/admin/pendaftar' }: { participant: ParticipantDetailData; backHref?: string }) {
  const uploadedDocuments = participant.documents.filter(document => document.path);
  const reviewedCount = uploadedDocuments.filter(document => participant.documentReviews[document.id]).length;
  const followUpCount = uploadedDocuments.filter(document => participant.documentReviews[document.id]?.status === 'follow_up').length;

  return (
    <div>
      <ButtonLink href={backHref} variant="ghost" className="mb-4 -ml-2">
        <ArrowLeft aria-hidden="true" />Kembali ke Data Peserta
      </ButtonLink>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Detail peserta{participant.registration.nomorPendaftaran ? ` · ${participant.registration.nomorPendaftaran}` : ''}</p>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
            {participant.identity.namaLengkap ? formatParticipantFieldValue('identity', 'namaLengkap', participant.identity.namaLengkap) : 'Peserta'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {participant.registration.nomorPendaftaran && (
            <DownloadProofButton
              proof={{
                nomorPendaftaran: participant.registration.nomorPendaftaran,
                namaLengkap: formatParticipantFieldValue('identity', 'namaLengkap', participant.identity.namaLengkap ?? null),
                jenisPendaftaran: participant.registration.jenisPendaftaran ?? '',
                pilihanKelas: participant.registration.pilihanKelas ?? '',
                kelasTujuan: participant.registration.kelasTujuan ?? null,
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            />
          )}
          <Badge>{participant.status}</Badge>
        </div>
      </div>
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_33rem]">
        <Card className="min-w-0 rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
          <CardHeader className="p-5 pb-3"><CardTitle className="text-base">Informasi siswa</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 pb-5 pt-0 sm:px-5" data-detail-groups>
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Identitas anak" name="identity" values={participant.identity} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Pendaftaran" name="registration" values={participant.registration} hiddenFields={participant.registration.jenisPendaftaran === 'Pindahan' ? [] : ['kelasTujuan']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Sekolah dan prestasi" name="school" values={participant.school} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Informasi alamat" name="address" values={participant.address} hiddenFields={['provinsi', 'alamatRumah']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Data ayah" name="father" values={participant.father} fullWidthFields={['alamat']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Data ibu" name="mother" values={participant.mother} fullWidthFields={['alamat']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Afiliasi Direktorat 2" name="affiliation" values={participant.affiliation} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Pengusul / rujukan murid" name="referral" values={participant.referral} />
          </CardContent>
        </Card>
        <div className="grid min-w-0 gap-4 xl:sticky xl:top-4">
          <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
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
                  const numberStyles = status === 'missing' ? 'bg-slate-200 text-slate-600' : status === 'verified' ? 'bg-emerald-600 text-white' : status === 'follow_up' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700';
                  return (
                    <article
                      key={document.id}
                      data-review-state={status}
                      className={`flex min-w-0 flex-col rounded-xl border p-3 shadow-sm shadow-slate-950/[0.03] transition-colors ${
                        status === 'missing'
                          ? 'border-dashed border-slate-300 bg-slate-50'
                          : status === 'follow_up'
                          ? 'border-amber-300 bg-amber-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          data-document-index
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${numberStyles}`}
                        >
                          {status === 'verified' ? <Check className="size-3" strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <h3 className="break-words text-xs font-semibold leading-4 text-slate-950">{document.title}</h3>
                            {document.path && (
                              <ReplaceDocumentButton participantId={participant.id} documentId={document.id} title={document.title} hasFile />
                            )}
                          </div>
                          {/* A verified document says so on its button, so the badge would only repeat it. */}
                          {status !== 'verified' && (
                            <div className="mt-1">
                              <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium leading-3 ${statusStyles}`}>
                                {statusLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {document.path ? (
                        // Full card width with two equal columns so the longer "Terverifikasi" label never pushes "Lihat berkas" out.
                        <form action={saveDocumentReviewAction} className="mt-3 grid grid-cols-2 gap-1.5">
                          <input type="hidden" name="participantId" value={participant.id} />
                          <input type="hidden" name="documentId" value={document.id} />
                          <Button
                            type="submit"
                            name="status"
                            value={'verified' satisfies DocumentReviewStatus}
                            aria-label={`${status === 'verified' ? 'Terverifikasi' : 'Verifikasi'} ${document.title}`}
                            aria-pressed={status === 'verified'}
                            size="sm"
                            className={`${ADMIN_ACTION_BUTTON} w-full min-w-0 px-2 ${
                              status === 'verified'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            <Check aria-hidden="true" className="size-3 shrink-0" />
                            <span className="truncate">{status === 'verified' ? 'Terverifikasi' : 'Verifikasi'}</span>
                          </Button>
                          <DocumentPreviewButton
                            compact
                            className="w-full min-w-0"
                            href={`/admin/pendaftar/${participant.id}/dokumen/${document.id}?contentType=${encodeURIComponent(
                              getDocumentContentType(document.path),
                            )}`}
                            title={document.title}
                          />
                        </form>
                      ) : (
                        <div className="mt-3">
                          <ReplaceDocumentButton participantId={participant.id} documentId={document.id} title={document.title} hasFile={false} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
              <form action={saveParticipantAdminNoteAction} className="space-y-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 shadow-sm shadow-blue-950/[0.03]">
                <input type="hidden" name="participantId" value={participant.id} />
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><MessageSquareText aria-hidden="true" className="size-4" /></span>
                  <Label htmlFor="participant-admin-note" className="font-semibold text-slate-900">Catatan admin</Label>
                </div>
                <p className="text-xs leading-5 text-slate-600">Catatan internal untuk membantu tindak lanjut berkas melalui WhatsApp.</p>
                <Textarea id="participant-admin-note" name="adminNote" maxLength={1000} defaultValue={participant.adminNote ?? ''} rows={3} placeholder="Contoh: Hubungi orang tua untuk meminta ulang berkas yang belum jelas." className="min-h-20 resize-y bg-white shadow-sm" />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="h-8 rounded-lg bg-slate-900 px-3 text-xs text-white hover:bg-slate-700">Simpan catatan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <ParticipantStatusPanel
            participantId={participant.id}
            status={participant.status}
            previousStatus={participant.previousStatus}
            jadwalTanggal={participant.okb.jadwalTanggal ?? null}
            jadwalSesi={participant.okb.jadwalSesi ?? null}
            pilihanKelas={participant.registration.pilihanKelas ?? null}
            kelasPenempatan={participant.decision.kelasPenempatan ?? null}
          />
        </div>
      </div>
    </div>
  );
}
