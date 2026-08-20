import 'server-only';

import {
  DOCUMENT_DEFINITIONS,
  type RegistrationDocumentId,
  type TrustedDocumentMimeType,
  type ValidatedDocument,
  type ValidatedRegistrationSubmission,
} from '../contracts';
import { formSchema } from '../schema';

const MAX_FILE_SIZE = 5_242_880;

const isPdf = (header: Uint8Array) =>
  header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46 && header[4] === 0x2d;

const isJpeg = (header: Uint8Array) =>
  header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;

const isPng = (header: Uint8Array) =>
  header[0] === 0x89 &&
  header[1] === 0x50 &&
  header[2] === 0x4e &&
  header[3] === 0x47 &&
  header[4] === 0x0d &&
  header[5] === 0x0a &&
  header[6] === 0x1a &&
  header[7] === 0x0a;

const isWebp = (header: Uint8Array) =>
  header[0] === 0x52 &&
  header[1] === 0x49 &&
  header[2] === 0x46 &&
  header[3] === 0x46 &&
  header[8] === 0x57 &&
  header[9] === 0x45 &&
  header[10] === 0x42 &&
  header[11] === 0x50;

const TRUSTED_FILE_TYPES = {
  'application/pdf': { extension: 'pdf', matches: isPdf },
  'image/jpeg': { extension: 'jpg', matches: isJpeg },
  'image/png': { extension: 'png', matches: isPng },
  'image/webp': { extension: 'webp', matches: isWebp },
} as const;

export function getTrustedDocumentType(type: string) {
  return TRUSTED_FILE_TYPES[type as TrustedDocumentMimeType];
}

export async function validateStoredDocument(file: Blob) {
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return false;
  const fileType = getTrustedDocumentType(file.type);
  if (!fileType) return false;

  try {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    return fileType.matches(header);
  } catch {
    return false;
  }
}

const invalid = (error: string): ValidatedRegistrationSubmission => ({ success: false, error });

const isFile = (value: FormDataEntryValue | null): value is File =>
  typeof File !== 'undefined' && value instanceof File;

export async function parseRegistrationSubmission(
  input: globalThis.FormData,
): Promise<ValidatedRegistrationSubmission> {
  const payload = input.get('payload');
  if (typeof payload !== 'string') {
    return invalid('Format data pendaftaran tidak valid.');
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(payload);
  } catch {
    return invalid('Format data pendaftaran tidak valid.');
  }

  const registration = formSchema.safeParse(rawData);
  if (!registration.success) {
    return invalid('Data pendaftaran tidak valid.');
  }

  const honeypot = input.get('website');
  if (honeypot && (typeof honeypot !== 'string' || honeypot.trim() !== '')) {
    return invalid('Permintaan tidak dapat diproses.');
  }

  const documents = {} as Record<RegistrationDocumentId, ValidatedDocument>;
  for (const definition of DOCUMENT_DEFINITIONS) {
    const value = input.get(definition.id);
    if (!isFile(value)) {
      return invalid(`Dokumen ${definition.title} wajib diunggah.`);
    }

    if (value.size === 0) {
      return invalid(`Dokumen ${definition.title} tidak boleh kosong.`);
    }

    if (value.size > MAX_FILE_SIZE) {
      return invalid(`Ukuran dokumen ${definition.title} melebihi batas 5 MB.`);
    }

    const fileType = getTrustedDocumentType(value.type);
    if (!fileType) {
      return invalid(`Jenis file dokumen ${definition.title} tidak didukung.`);
    }

    let header: Uint8Array;
    try {
      header = new Uint8Array(await value.slice(0, 12).arrayBuffer());
    } catch {
      return invalid(`Dokumen ${definition.title} tidak dapat diperiksa.`);
    }

    if (!fileType.matches(header)) {
      return invalid(`Isi dokumen ${definition.title} tidak sesuai dengan jenis file.`);
    }

    documents[definition.id] = {
      file: value,
      extension: fileType.extension,
      mimeType: value.type as TrustedDocumentMimeType,
    };
  }

  return { success: true, data: registration.data, documents };
}
