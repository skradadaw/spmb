'use server';

import { headers } from 'next/headers';
import type { PrepareRegistrationResult, RegistrationActionResult } from './contracts';
import {
  getSourceAddress,
  getSupabaseAdmin,
  hashRegistrationSource,
  hashSubmissionSecret,
  SupabaseConfigurationError,
} from './server/supabaseAdmin';
import { createSignedUploadRepository } from './server/signedUploadRepository';
import {
  cancelSignedRegistration,
  finalizeSignedRegistration,
  prepareSignedRegistration,
} from './server/signedUploadService';

const CONFIGURATION_ERROR = 'Layanan pendaftaran belum dikonfigurasi. Silakan hubungi panitia.';
const BOUNDARY_ERROR = 'Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.';

function boundaryError(error: unknown): Extract<RegistrationActionResult, { success: false }> {
  console.error(
    error instanceof SupabaseConfigurationError
      ? '[registration] server configuration unavailable'
      : '[registration] action boundary failed',
  );
  return { success: false, error: error instanceof SupabaseConfigurationError ? CONFIGURATION_ERROR : BOUNDARY_ERROR };
}

export async function prepareRegistrationAction(input: globalThis.FormData): Promise<PrepareRegistrationResult> {
  try {
    const source = getSourceAddress(await headers() as Headers);
    return await prepareSignedRegistration(
      input,
      source ? hashRegistrationSource(source) : null,
      createSignedUploadRepository(getSupabaseAdmin()),
      hashSubmissionSecret,
    );
  } catch (error) {
    return boundaryError(error);
  }
}

export async function finalizeRegistrationAction(input: globalThis.FormData): Promise<RegistrationActionResult> {
  try {
    return await finalizeSignedRegistration(input, createSignedUploadRepository(getSupabaseAdmin()));
  } catch (error) {
    return boundaryError(error);
  }
}

export async function cancelRegistrationAction(input: globalThis.FormData): Promise<RegistrationActionResult> {
  try {
    return await cancelSignedRegistration(input, createSignedUploadRepository(getSupabaseAdmin()));
  } catch (error) {
    return boundaryError(error);
  }
}
