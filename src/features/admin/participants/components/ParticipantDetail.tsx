import { AlertTriangle, ArrowLeft, Check, ClipboardCheck, Flag } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { saveParticipantAdminNoteAction } from '../actions/saveParticipantAdminNoteAction';
import { saveDocumentReviewAction } from '../actions/saveDocumentReviewAction';
import { setNisnFlagAction } from '../actions/setNisnFlagAction';
import { DocumentPreviewButton, type ViewerDocument } from './DocumentPreviewButton';
import { DocumentPrefetch } from './DocumentPrefetch';
import { StickyAside } from './StickyAside';
import { documentReplacedAt, documentVersion } from '../documentVersion';
import { ParticipantStatusPanel } from './ParticipantStatusPanel';
import { ParticipantStatusBadge } from './ParticipantStatus';
import { ParticipantEditableGroup } from './ParticipantEditableGroup';
import { ReplaceDocumentButton } from './ReplaceDocumentButton';
import { DownloadProofButton } from '@/features/registration/components/DownloadProofButton';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ADMIN_DONE_BUTTON, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON, ADMIN_SECTION_TITLE } from '@/features/admin/components/adminStyles';
import { Textarea } from '@/components/ui/textarea';
import type { DocumentReviewStatus, ParticipantDetail as ParticipantDetailData } from '../contracts';
import { formatParticipantFieldValue } from '../presentation';
import { whatsAppWebHref } from '../whatsapp';

const shortDate = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value));

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
  // The version in the URL changes when a Berkas Pengganti is uploaded, so the browser may cache each file.
  const viewerDocuments: ViewerDocument[] = uploadedDocuments.map(document => ({
    id: document.id,
    title: document.title,
    href: `/admin/pendaftar/${participant.id}/dokumen/${document.id}?contentType=${encodeURIComponent(getDocumentContentType(document.path!))}&v=${documentVersion(document.path!)}`,
    verified: participant.documentReviews[document.id]?.status === 'verified',
    replacedAt: documentReplacedAt(document.path!),
  }));
  const childName = participant.identity.namaLengkap ? formatParticipantFieldValue('identity', 'namaLengkap', participant.identity.namaLengkap) : 'ananda';
  const greeting = `Assalamu'alaikum Bapak/Ibu, kami dari panitia SPMB ingin menghubungi terkait pendaftaran ${childName}${participant.registration.nomorPendaftaran ? ` (${participant.registration.nomorPendaftaran})` : ''}.`;
  const fatherHref = whatsAppWebHref(participant.father.telepon, greeting);
  const motherHref = whatsAppWebHref(participant.mother.telepon, greeting);
  // Parents often share one number; show a single button then.
  const contacts = fatherHref && fatherHref === motherHref
    ? [{ label: 'WA orang tua', href: fatherHref }]
    : [{ label: 'WA ayah', href: fatherHref }, { label: 'WA ibu', href: motherHref }].filter((contact): contact is { label: string; href: string } => Boolean(contact.href));

  return (
    <div>
      <ButtonLink href={backHref} variant="ghost" className="mb-4 -ml-2">
        <ArrowLeft aria-hidden="true" />Kembali ke Data Pendaftar
      </ButtonLink>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Detail pendaftar{participant.registration.nomorPendaftaran ? ` · ${participant.registration.nomorPendaftaran}` : ''}</p>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
            {participant.identity.namaLengkap ? formatParticipantFieldValue('identity', 'namaLengkap', participant.identity.namaLengkap) : 'Pendaftar'}
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
              className={ADMIN_SECONDARY_BUTTON}
            />
          )}
          <ParticipantStatusBadge status={participant.status} />
        </div>
      </div>
      {participant.nisnMismatch && (
        <div role="status" className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p><span className="font-semibold">NISN tidak sesuai.</span> Hubungi orang tua agar meminta NISN yang benar dari TK asal, lalu perbarui di Identitas anak.</p>
        </div>
      )}
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_33rem]">
        <Card className="min-w-0 rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
          <CardHeader className="p-5 pb-3"><CardTitle className="text-base">Informasi siswa</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 pb-5 pt-0 sm:px-5" data-detail-groups>
            <ParticipantEditableGroup
              participantId={participant.id}
              formValues={participant.formValues}
              title="Identitas anak"
              name="identity"
              values={participant.identity}
              warningFields={participant.nisnMismatch ? ['nisn'] : []}
              fieldAddons={{ nisn: <NisnFlagForm participantId={participant.id} flagged={participant.nisnMismatch} /> }}
            />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Pendaftaran" name="registration" values={participant.registration} hiddenFields={participant.registration.jenisPendaftaran === 'Pindahan' ? [] : ['kelasTujuan']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Sekolah dan prestasi" name="school" values={participant.school} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Informasi alamat" name="address" values={participant.address} hiddenFields={['provinsi', 'alamatRumah']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Data ayah" name="father" values={participant.father} fullWidthFields={['alamat']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Data ibu" name="mother" values={participant.mother} fullWidthFields={['alamat']} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Afiliasi Direktorat 2" name="affiliation" values={participant.affiliation} />
            <ParticipantEditableGroup participantId={participant.id} formValues={participant.formValues} title="Pengusul / rujukan murid" name="referral" values={participant.referral} />
          </CardContent>
        </Card>
        <StickyAside className="grid min-w-0 gap-4">
          <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-slate-950">Dokumen terunggah</CardTitle>
                  <p className="mt-1 text-xs leading-4 text-slate-600">{reviewedCount} dari {participant.documents.length} berkas terverifikasi</p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><ClipboardCheck aria-hidden="true" className="size-4" /></span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-3 sm:p-4">
              <DocumentPrefetch hrefs={viewerDocuments.map(document => document.href)} />
              <div data-testid="document-grid" data-density="compact" className="grid gap-2 md:grid-cols-2">
                {participant.documents.map(document => {
                  const review = participant.documentReviews[document.id];
                  const status = !document.path ? 'missing' : review?.status ?? 'pending';
                  const replacedAt = document.path ? documentReplacedAt(document.path) : null;
                  // Same second line on every card: where the file came from, not a status the buttons already show.
                  const sourceLabel = !document.path ? 'Belum diunggah' : replacedAt ? `Diganti admin, ${shortDate(replacedAt)}` : 'Dari pendaftaran';
                  const markerStyles = status === 'missing' ? 'border border-dashed border-slate-300 bg-white' : status === 'verified' ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white';
                  return (
                    <article
                      key={document.id}
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
                              <ReplaceDocumentButton participantId={participant.id} documentId={document.id} title={document.title} hasFile />
                            )}
                          </div>
                          <p data-document-source className="text-[11px] leading-4 text-slate-500">{sourceLabel}</p>
                        </div>
                      </div>
                      {document.path ? (
                        // The verify button takes the spare width so "Terverifikasi" fits; "Lihat" only needs its label.
                        <form action={saveDocumentReviewAction} className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 pt-3">
                          <input type="hidden" name="participantId" value={participant.id} />
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
                            participantId={participant.id}
                            documents={viewerDocuments}
                            index={viewerDocuments.findIndex(item => item.id === document.id)}
                          />
                        </form>
                      ) : (
                        <div className="mt-auto pt-3">
                          <ReplaceDocumentButton participantId={participant.id} documentId={document.id} title={document.title} hasFile={false} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
              <form action={saveParticipantAdminNoteAction} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <input type="hidden" name="participantId" value={participant.id} />
                <Label htmlFor="participant-admin-note" className={ADMIN_SECTION_TITLE}>Catatan admin</Label>
                <Textarea id="participant-admin-note" name="adminNote" maxLength={1000} defaultValue={participant.adminNote ?? ''} rows={2} placeholder="Catatan internal, mis. berkas yang perlu diminta ulang." className="min-h-14 resize-y bg-white text-xs md:text-xs" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {contacts.map(contact => (
                      <a
                        key={contact.label}
                        href={contact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Hubungi ${contact.label.replace('WA ', '')} lewat WhatsApp Web`}
                        className={`${ADMIN_SECONDARY_BUTTON} inline-flex items-center`}
                      >
                        <WhatsAppIcon className="size-3.5 text-[#25D366]" />{contact.label}
                      </a>
                    ))}
                  </div>
                  <Button type="submit" className={ADMIN_PRIMARY_BUTTON}>Simpan catatan</Button>
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
        </StickyAside>
      </div>
    </div>
  );
}

/** NISN Tidak Sesuai toggle under the NISN value; editing the NISN clears it automatically. */
function NisnFlagForm({ participantId, flagged }: { participantId: string; flagged: boolean }) {
  return (
    <form action={setNisnFlagAction} className="space-y-1.5">
      <input type="hidden" name="participantId" value={participantId} />
      <input type="hidden" name="flagged" value={flagged ? 'false' : 'true'} />
      {flagged ? (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-7 items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 text-xs font-semibold text-amber-800">
              <AlertTriangle aria-hidden="true" className="size-3.5" />Ditandai tidak sesuai
            </span>
            <Button type="submit" className={`${ADMIN_SECONDARY_BUTTON} h-7 px-2.5`}>
              <Check aria-hidden="true" className="size-3.5" />NISN sudah benar
            </Button>
          </div>
          <p className="text-[11px] leading-4 text-amber-800/80">Tanda hilang otomatis setelah NISN diperbarui lewat Edit.</p>
        </>
      ) : (
        <Button type="submit" className={`${ADMIN_SECONDARY_BUTTON} h-7 px-2.5 text-amber-800 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900`}>
          <Flag aria-hidden="true" className="size-3.5" />Tandai NISN tidak sesuai
        </Button>
      )}
    </form>
  );
}
