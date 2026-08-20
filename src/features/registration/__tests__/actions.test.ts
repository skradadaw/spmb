import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getHeaders: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  hashRegistrationSource: vi.fn(),
  hashSubmissionSecret: vi.fn(),
  prepare: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: mocks.getHeaders }));
vi.mock('@/features/registration/server/supabaseAdmin', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/registration/server/supabaseAdmin')>(),
  getSupabaseAdmin: mocks.getSupabaseAdmin,
  hashRegistrationSource: mocks.hashRegistrationSource,
  hashSubmissionSecret: mocks.hashSubmissionSecret,
}));
vi.mock('@/features/registration/server/signedUploadService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/registration/server/signedUploadService')>(),
  prepareSignedRegistration: mocks.prepare,
}));

import { prepareRegistrationAction } from '@/features/registration/actions';
import { SupabaseConfigurationError } from '@/features/registration/server/supabaseAdmin';

describe('signed registration actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHeaders.mockResolvedValue(new Headers({
      'x-vercel-forwarded-for': '203.0.113.10, 198.51.100.20',
    }));
    mocks.getSupabaseAdmin.mockReturnValue({});
    mocks.hashRegistrationSource.mockReturnValue('hashed-source');
    mocks.prepare.mockResolvedValue({ success: true, uploads: [] });
  });

  it("declares the module-level 'use server' directive", () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/registration/actions.ts'), 'utf8');
    expect(source).toMatch(/^'use server';\s+import /);
  });

  it('uses the Vercel source header and passes only the small FormData to preparation', async () => {
    const input = new FormData();
    await expect(prepareRegistrationAction(input)).resolves.toEqual({ success: true, uploads: [] });
    expect(mocks.hashRegistrationSource).toHaveBeenCalledWith('203.0.113.10');
    expect(mocks.prepare).toHaveBeenCalledWith(
      input,
      'hashed-source',
      expect.objectContaining({ createUploadToken: expect.any(Function) }),
      mocks.hashSubmissionSecret,
    );
  });

  it('returns a safe configuration error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.getSupabaseAdmin.mockImplementation(() => { throw new SupabaseConfigurationError(); });
    await expect(prepareRegistrationAction(new FormData())).resolves.toEqual({
      success: false,
      error: 'Layanan pendaftaran belum dikonfigurasi. Silakan hubungi panitia.',
    });
  });
});
