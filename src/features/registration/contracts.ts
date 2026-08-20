import type { FormData as RegistrationData } from './schema';

export const DOCUMENT_DEFINITIONS = [
  { id: 'aktaKelahiran', title: 'Akta Kelahiran', desc: 'PDF, JPG, PNG, atau WebP (Maks. 5MB)', dbColumn: 'dokumen_akta_kelahiran' },
  { id: 'kartuKeluarga', title: 'Kartu Keluarga', desc: 'PDF, JPG, PNG, atau WebP (Maks. 5MB)', dbColumn: 'dokumen_kartu_keluarga' },
  { id: 'pasFoto', title: 'Pas Foto Anak (Terbaru)', desc: 'Foto formal anak (Maks. 5MB)', dbColumn: 'dokumen_pas_foto' },
  { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', desc: 'Struk transfer / pembayaran (Maks. 5MB)', dbColumn: 'dokumen_bukti_pembayaran' },
] as const;

export type RegistrationDocumentId = (typeof DOCUMENT_DEFINITIONS)[number]['id'];

export type RegistrationActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type RegistrationFileMetadata = {
  id: RegistrationDocumentId;
  size: number;
  type: TrustedDocumentMimeType;
};

export type SignedUploadTarget = {
  id: RegistrationDocumentId;
  path: string;
  token: string;
};

export type PrepareRegistrationResult =
  | { success: true; uploads: SignedUploadTarget[] }
  | Extract<RegistrationActionResult, { success: false }>;

export type TrustedDocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export type ValidatedDocument = {
  file: File;
  extension: 'pdf' | 'jpg' | 'png' | 'webp';
  mimeType: TrustedDocumentMimeType;
};

export type ValidatedRegistrationSubmission =
  | {
      success: true;
      data: RegistrationData;
      documents: Record<RegistrationDocumentId, ValidatedDocument>;
    }
  | Extract<RegistrationActionResult, { success: false }>;
