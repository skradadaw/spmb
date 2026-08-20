import 'server-only';

import {
  DOCUMENT_DEFINITIONS,
  type PrepareRegistrationResult,
  type RegistrationActionResult,
  type RegistrationDocumentId,
  type RegistrationFileMetadata,
  type TrustedDocumentMimeType,
} from '../contracts';
import { formSchema } from '../schema';
import { getTrustedDocumentType, validateStoredDocument } from './documentValidation';
import { DuplicateRegistrationError } from './submissionService';
import { matchesSubmissionSecret } from './supabaseAdmin';
import type { SignedUploadRepository } from './signedUploadRepository';

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const MAX_FILE_SIZE = 5_242_880;
const UPLOAD_TTL_MS = 90 * 60 * 1000;
const RATE_LIMIT_ERROR = 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.';
const DUPLICATE_NIK_ERROR = 'Data dengan NIK ini sudah pernah terdaftar. Hubungi panitia jika Anda perlu memperbaiki pendaftaran.';
const GENERIC_ERROR = 'Terjadi kesalahan saat menyimpan data pendaftaran.';
const CLOSED_ERROR = 'Pendaftaran sedang ditutup. Silakan hubungi panitia untuk informasi lebih lanjut.';
const INVALID_ERROR = 'Data pendaftaran atau dokumen tidak valid.';

type Credentials = { submissionId: string; submissionSecret: string };

const trustedTypes = new Set<TrustedDocumentMimeType>([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function parseCredentials(input: globalThis.FormData): Credentials | null {
  const submissionId = input.get('submissionId');
  const submissionSecret = input.get('submissionSecret');
  if (
    typeof submissionId !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)
    || typeof submissionSecret !== 'string'
    || !/^[A-Za-z0-9_-]{43,128}$/.test(submissionSecret)
  ) return null;
  return { submissionId, submissionSecret };
}

function parseMetadata(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null;
  try {
    const raw = JSON.parse(value) as unknown;
    if (!Array.isArray(raw) || raw.length !== DOCUMENT_DEFINITIONS.length) return null;
    const result = new Map<RegistrationDocumentId, RegistrationFileMetadata>();
    for (const item of raw) {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Partial<RegistrationFileMetadata>;
      const definition = DOCUMENT_DEFINITIONS.find(({ id }) => id === candidate.id);
      if (
        !definition
        || result.has(definition.id)
        || !Number.isInteger(candidate.size)
        || (candidate.size ?? 0) <= 0
        || (candidate.size ?? 0) > MAX_FILE_SIZE
        || typeof candidate.type !== 'string'
        || !trustedTypes.has(candidate.type as TrustedDocumentMimeType)
      ) return null;
      result.set(definition.id, candidate as RegistrationFileMetadata);
    }
    return result;
  } catch {
    return null;
  }
}

function registrationIsOpen(now = new Date()) {
  const override = process.env.REGISTRATION_OVERRIDE?.trim().toLowerCase();
  if (override === 'open') return true;
  if (override === 'closed') return false;
  const opensAt = new Date(process.env.REGISTRATION_OPENS_AT || '2026-09-01T00:00:00+07:00');
  const closesAt = new Date(process.env.REGISTRATION_CLOSES_AT || '2026-10-10T23:59:59+07:00');
  return Number.isFinite(opensAt.getTime())
    && Number.isFinite(closesAt.getTime())
    && now >= opensAt
    && now <= closesAt;
}

function safeError(error: unknown): Extract<RegistrationActionResult, { success: false }> {
  return {
    success: false,
    error: error instanceof DuplicateRegistrationError ? DUPLICATE_NIK_ERROR : GENERIC_ERROR,
  };
}

async function cleanupPending(
  repository: SignedUploadRepository,
  submissionId: string,
  paths: string[],
) {
  try {
    await repository.removePending(submissionId, paths);
  } catch {
    console.error(`[registration:${submissionId}] pending cleanup failed`);
  }
}

export async function prepareSignedRegistration(
  input: globalThis.FormData,
  rateLimitKey: string | null,
  repository: SignedUploadRepository,
  secretHash: (secret: string) => string,
): Promise<PrepareRegistrationResult> {
  try {
    if (!rateLimitKey) return { success: false, error: GENERIC_ERROR };
    if (!await repository.consumeRateLimit(rateLimitKey, RATE_LIMIT, RATE_LIMIT_WINDOW_SECONDS)) {
      return { success: false, error: RATE_LIMIT_ERROR };
    }
    if (!registrationIsOpen()) return { success: false, error: CLOSED_ERROR };

    const honeypot = input.get('website');
    if (honeypot && (typeof honeypot !== 'string' || honeypot.trim() !== '')) {
      return { success: false, error: 'Permintaan tidak dapat diproses.' };
    }
    const credentials = parseCredentials(input);
    const payload = input.get('payload');
    const metadata = parseMetadata(input.get('metadata'));
    if (!credentials || typeof payload !== 'string' || !metadata) {
      return { success: false, error: INVALID_ERROR };
    }

    let decoded: unknown;
    try { decoded = JSON.parse(payload); } catch { return { success: false, error: INVALID_ERROR }; }
    const registration = formSchema.safeParse(decoded);
    if (!registration.success) return { success: false, error: INVALID_ERROR };

    const { submissionId, submissionSecret } = credentials;
    const expectedHash = secretHash(submissionSecret);
    const extensions = Object.fromEntries([...metadata].map(([id, item]) => [
      id,
      getTrustedDocumentType(item.type)?.extension,
    ])) as Record<RegistrationDocumentId, string>;
    let paths = Object.fromEntries(DOCUMENT_DEFINITIONS.map(({ id }) => [
      id,
      `registrations/${submissionId}/${id}.${extensions[id]}`,
    ])) as Record<RegistrationDocumentId, string>;

    const existing = await repository.getPending(submissionId);
    if (existing) {
      if (!matchesSubmissionSecret(submissionSecret, existing.submission_secret_hash)
        || existing.status !== 'Menunggu Unggahan'
        || new Date(existing.upload_expires_at) <= new Date()) {
        return { success: false, error: INVALID_ERROR };
      }
      paths = repository.pathsFromRow(existing);
    } else {
      await repository.createPending(
        registration.data,
        submissionId,
        expectedHash,
        new Date(Date.now() + UPLOAD_TTL_MS).toISOString(),
        paths,
      );
    }

    try {
      const uploads = await Promise.all(DOCUMENT_DEFINITIONS.map(async ({ id }) => ({
        id,
        path: paths[id],
        token: await repository.createUploadToken(paths[id]),
      })));
      return { success: true, uploads };
    } catch (error) {
      await cleanupPending(repository, submissionId, Object.values(paths));
      throw error;
    }
  } catch (error) {
    return safeError(error);
  }
}

export async function finalizeSignedRegistration(
  input: globalThis.FormData,
  repository: SignedUploadRepository,
): Promise<RegistrationActionResult> {
  const credentials = parseCredentials(input);
  if (!credentials) return { success: false, error: INVALID_ERROR };
  const { submissionId, submissionSecret } = credentials;
  try {
    const pending = await repository.getPending(submissionId);
    if (!pending || !matchesSubmissionSecret(submissionSecret, pending.submission_secret_hash)) {
      return { success: false, error: INVALID_ERROR };
    }
    if (pending.status === 'Menunggu Verifikasi') return { success: true };
    const paths = repository.pathsFromRow(pending);
    if (pending.status !== 'Menunggu Unggahan' || new Date(pending.upload_expires_at) <= new Date()) {
      await cleanupPending(repository, submissionId, Object.values(paths));
      return { success: false, error: 'Sesi unggah telah berakhir. Silakan kirim ulang formulir.' };
    }

    for (const { id } of DOCUMENT_DEFINITIONS) {
      const document = await repository.download(paths[id]);
      if (!await validateStoredDocument(document)) {
        await cleanupPending(repository, submissionId, Object.values(paths));
        return { success: false, error: `Dokumen ${DOCUMENT_DEFINITIONS.find((item) => item.id === id)?.title} tidak valid.` };
      }
    }
    await repository.finalize(submissionId);
    return { success: true };
  } catch (error) {
    if (error instanceof DuplicateRegistrationError) {
      const pending = await repository.getPending(submissionId).catch(() => null);
      if (pending) await cleanupPending(repository, submissionId, Object.values(repository.pathsFromRow(pending)));
    }
    return safeError(error);
  }
}

export async function cancelSignedRegistration(
  input: globalThis.FormData,
  repository: SignedUploadRepository,
): Promise<RegistrationActionResult> {
  const credentials = parseCredentials(input);
  if (!credentials) return { success: false, error: INVALID_ERROR };
  try {
    const pending = await repository.getPending(credentials.submissionId);
    if (!pending || !matchesSubmissionSecret(credentials.submissionSecret, pending.submission_secret_hash)) {
      return { success: false, error: INVALID_ERROR };
    }
    await repository.removePending(credentials.submissionId, Object.values(repository.pathsFromRow(pending)));
    return { success: true };
  } catch (error) {
    return safeError(error);
  }
}
