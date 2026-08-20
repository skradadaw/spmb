import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegistrationDocumentId } from '../contracts';
import type { FormData as RegistrationData } from '../schema';
import { DuplicateRegistrationError } from './submissionService';
import { toPendaftarRow } from './supabaseRegistrationRepository';

const DOCUMENT_BUCKET = 'dokumen_pendaftaran';

export type PendingRegistration = {
  submission_id: string;
  submission_secret_hash: string;
  upload_expires_at: string;
  status: string;
  dokumen_akta_kelahiran: string;
  dokumen_kartu_keluarga: string;
  dokumen_pas_foto: string;
  dokumen_bukti_pembayaran: string;
};

function fail(): never {
  throw new Error('Registration persistence operation failed');
}

function pathsFromRow(row: PendingRegistration) {
  return {
    aktaKelahiran: row.dokumen_akta_kelahiran,
    kartuKeluarga: row.dokumen_kartu_keluarga,
    pasFoto: row.dokumen_pas_foto,
    buktiPembayaran: row.dokumen_bukti_pembayaran,
  } satisfies Record<RegistrationDocumentId, string>;
}

export function createSignedUploadRepository(client: SupabaseClient) {
  const getPending = async (submissionId: string) => {
    const { data, error } = await client
      .from('pendaftar')
      .select('submission_id,submission_secret_hash,upload_expires_at,status,dokumen_akta_kelahiran,dokumen_kartu_keluarga,dokumen_pas_foto,dokumen_bukti_pembayaran')
      .eq('submission_id', submissionId)
      .maybeSingle();
    if (error) fail();
    return data as PendingRegistration | null;
  };

  return {
    async consumeRateLimit(key: string, limit: number, windowSeconds: number) {
      const { data, error } = await client.rpc('consume_registration_rate_limit', {
        p_identifier_hash: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) fail();
      return data === true;
    },

    getPending,

    async createPending(
      data: RegistrationData,
      submissionId: string,
      secretHash: string,
      expiresAt: string,
      documentPaths: Record<RegistrationDocumentId, string>,
    ) {
      const { error } = await client.from('pendaftar').insert([{
        ...toPendaftarRow(data, documentPaths),
        submission_id: submissionId,
        submission_secret_hash: secretHash,
        upload_expires_at: expiresAt,
        status: 'Menunggu Unggahan',
      }]);
      if (error?.code === '23505' && error.message?.includes('uq_pendaftar_nik')) {
        throw new DuplicateRegistrationError();
      }
      if (error) fail();
    },

    async createUploadToken(path: string) {
      const { data, error } = await client.storage
        .from(DOCUMENT_BUCKET)
        .createSignedUploadUrl(path, { upsert: true });
      if (error || !data?.token) fail();
      return data.token;
    },

    async download(path: string) {
      const { data, error } = await client.storage.from(DOCUMENT_BUCKET).download(path);
      if (error || !data) fail();
      return data;
    },

    async finalize(submissionId: string) {
      const { error } = await client
        .from('pendaftar')
        .update({ status: 'Menunggu Verifikasi' })
        .eq('submission_id', submissionId)
        .eq('status', 'Menunggu Unggahan');
      if (error?.code === '23505' && error.message?.includes('uq_pendaftar_nik')) {
        throw new DuplicateRegistrationError();
      }
      if (error) fail();
    },

    async removePending(submissionId: string, paths: string[]) {
      const { error: storageError } = await client.storage.from(DOCUMENT_BUCKET).remove(paths);
      if (storageError) fail();
      const { error: deleteError } = await client
        .from('pendaftar')
        .delete()
        .eq('submission_id', submissionId)
        .eq('status', 'Menunggu Unggahan');
      if (deleteError) fail();
    },

    pathsFromRow,
  };
}

export type SignedUploadRepository = ReturnType<typeof createSignedUploadRepository>;
