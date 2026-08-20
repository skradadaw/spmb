import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from './contracts';
import type { FormData as RegistrationData } from './schema';

type SubmissionLock = { current: boolean };
export type RegistrationFiles = Partial<Record<RegistrationDocumentId, File>>;
export type SubmissionCredentials = { submissionId: string; submissionSecret: string };

export function createSubmissionCredentials(): SubmissionCredentials {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const submissionSecret = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return { submissionId: crypto.randomUUID(), submissionSecret };
}

export function buildRegistrationPreparation(
  data: RegistrationData,
  files: RegistrationFiles,
  honeypot: string,
  credentials: SubmissionCredentials,
) {
  const metadata = DOCUMENT_DEFINITIONS.map((definition) => {
    const file = files[definition.id];
    if (!file) throw new Error(`Dokumen ${definition.title} wajib dipilih sebelum mengirim.`);
    return { id: definition.id, size: file.size, type: file.type };
  });
  const submission = new globalThis.FormData();
  submission.set('payload', JSON.stringify(data));
  submission.set('metadata', JSON.stringify(metadata));
  submission.set('website', honeypot);
  submission.set('submissionId', credentials.submissionId);
  submission.set('submissionSecret', credentials.submissionSecret);
  return submission;
}

export function buildSubmissionCredentials(credentials: SubmissionCredentials) {
  const submission = new globalThis.FormData();
  submission.set('submissionId', credentials.submissionId);
  submission.set('submissionSecret', credentials.submissionSecret);
  return submission;
}

export function acquireSubmissionLock(lock: SubmissionLock) {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

export function releaseSubmissionLock(lock: SubmissionLock) {
  lock.current = false;
}
