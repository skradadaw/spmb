import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const CONFIGURATION_ERROR = 'Supabase server configuration is unavailable';

let supabaseAdmin: SupabaseClient | undefined;

export class SupabaseConfigurationError extends Error {
  constructor() {
    super(CONFIGURATION_ERROR);
    this.name = 'SupabaseConfigurationError';
  }
}

function requireEnvironmentValue(value: string | undefined) {
  if (!value?.trim()) {
    throw new SupabaseConfigurationError();
  }

  return value;
}

export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const url = requireEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = requireEnvironmentValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseAdmin;
}

export function hashRegistrationSource(source: string) {
  const serviceRoleKey = requireEnvironmentValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return createHmac('sha256', serviceRoleKey).update(source).digest('hex');
}

export function hashSubmissionSecret(secret: string) {
  const serviceRoleKey = requireEnvironmentValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return createHmac('sha256', serviceRoleKey).update(`submission:${secret}`).digest('hex');
}

export function matchesSubmissionSecret(secret: string, expectedHash: string) {
  const actual = Buffer.from(hashSubmissionSecret(secret), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function getSourceAddress(headers: Headers) {
  const vercelAddress = headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if (vercelAddress) {
    return vercelAddress;
  }

  if (process.env.NODE_ENV !== 'production') {
    return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headers.get('x-real-ip')?.trim()
      || 'local-development';
  }

  return null;
}
