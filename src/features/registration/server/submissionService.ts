import 'server-only';

import {
  DOCUMENT_DEFINITIONS,
  type RegistrationActionResult,
  type RegistrationDocumentId,
  type ValidatedDocument,
} from '../contracts';
import type { FormData as RegistrationData } from '../schema';
import { parseRegistrationSubmission } from './documentValidation';

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const RATE_LIMIT_ERROR = 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.';
const DUPLICATE_NIK_ERROR = 'Data dengan NIK ini sudah pernah terdaftar di sistem. Mohon gunakan NIK yang belum terdaftar.';
const SUBMISSION_ERROR = 'Terjadi kesalahan saat menyimpan data pendaftaran.';

export interface RegistrationPersistence {
  consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  uploadDocument(path: string, document: ValidatedDocument): Promise<void>;
  removeDocuments(paths: string[]): Promise<void>;
  insertRegistration(
    data: RegistrationData,
    documentPaths: Record<RegistrationDocumentId, string>,
  ): Promise<void>;
}

export class DuplicateRegistrationError extends Error {
  constructor() {
    super('Duplicate registration');
    this.name = 'DuplicateRegistrationError';
  }
}

const errorResult = (error: unknown): RegistrationActionResult => ({
  success: false,
  error: error instanceof DuplicateRegistrationError ? DUPLICATE_NIK_ERROR : SUBMISSION_ERROR,
});

export async function processRegistrationSubmission(
  input: globalThis.FormData,
  rateLimitKey: string | null,
  persistence: RegistrationPersistence,
  createId: () => string = () => crypto.randomUUID(),
): Promise<RegistrationActionResult> {
  const parsed = await parseRegistrationSubmission(input);
  if (!parsed.success) {
    return parsed;
  }

  const { data, documents } = parsed;
  const uploadedPaths: string[] = [];

  try {
    const submissionId = createId();
    const documentPaths = Object.fromEntries(
      DOCUMENT_DEFINITIONS.map(({ id }) => [
        id,
        `registrations/${submissionId}/${id}.${documents[id].extension}`,
      ]),
    ) as Record<RegistrationDocumentId, string>;

    if (rateLimitKey !== null) {
      const isAllowed = await persistence.consumeRateLimit(
        rateLimitKey,
        RATE_LIMIT,
        RATE_LIMIT_WINDOW_SECONDS,
      );
      if (!isAllowed) {
        return { success: false, error: RATE_LIMIT_ERROR };
      }
    }

    for (const { id } of DOCUMENT_DEFINITIONS) {
      const path = documentPaths[id];
      await persistence.uploadDocument(path, documents[id]);
      uploadedPaths.push(path);
    }

    await persistence.insertRegistration(data, documentPaths);
    return { success: true };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      try {
        await persistence.removeDocuments(uploadedPaths);
      } catch {
        // Preserve the primary user-facing error when best-effort cleanup fails.
      }
    }
    return errorResult(error);
  }
}
