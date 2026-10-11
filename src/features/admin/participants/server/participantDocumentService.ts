import 'server-only';
import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';

const documentById = new Map(DOCUMENT_DEFINITIONS.map(document => [document.id, document]));
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PATH_PATTERN = /^registrations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(aktaKelahiran|kartuKeluarga|pasFoto|buktiPembayaran)\.(pdf|jpg|png|webp)$/i;

export function isSafeDocumentPath(path: string, submissionId?: string, documentId?: RegistrationDocumentId) {
  const match = PATH_PATTERN.exec(path);
  if (!match) return false;
  if (submissionId && (!UUID_PATTERN.test(submissionId) || match[1].toLowerCase() !== submissionId.toLowerCase())) return false;
  if (documentId && match[2].toLowerCase() !== documentId.toLowerCase()) return false;
  return true;
}

export function getDocumentPath(row: Record<string, unknown>, documentId: RegistrationDocumentId) {
  const document = documentById.get(documentId);
  const path = document ? row[document.dbColumn] : null;
  const submissionId = row.submission_id;
  return typeof path === 'string' && typeof submissionId === 'string' && isSafeDocumentPath(path, submissionId, documentId) ? path : null;
}

export async function createParticipantDocumentUrl(
  participantId: string,
  documentId: RegistrationDocumentId,
  repository: { getDocumentRow: (id: string) => Promise<Record<string, unknown> | null> },
  storage: { createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null; error: unknown | null }> },
) {
  const row = await repository.getDocumentRow(participantId);
  if (!row) return null;
  const path = getDocumentPath(row, documentId);
  if (!path) return null;
  const result = await storage.createSignedUrl(path, 60);
  if (result.error || !result.data?.signedUrl) throw new Error('Dokumen peserta tidak dapat dibuka.');
  return { signedUrl: result.data.signedUrl, path };
}
