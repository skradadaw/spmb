import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  repository: {
    getActive: vi.fn(),
    createUploadToken: vi.fn(),
    download: vi.fn(),
    activate: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/announcement/server/templateRepository', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/announcement/server/templateRepository')>(),
  createTemplateRepository: () => mocks.repository,
}));

import { activateTemplateAction, checkTemplateAction, discardTemplateAction, prepareTemplateUploadAction } from '../templateActions';

const template = new Uint8Array(readFileSync(resolve(process.cwd(), 'docs/templates/surat-penerimaan.pdf')));
const path = 'templates/123e4567-e89b-12d3-a456-426614174000.pdf';
const oldPath = 'templates/00000000-0000-4000-8000-000000000000.pdf';

describe('template Surat Penerimaan actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.repository.createUploadToken.mockResolvedValue('token');
    mocks.repository.download.mockResolvedValue(template);
    mocks.repository.getActive.mockResolvedValue(null);
    mocks.repository.activate.mockResolvedValue(null);
    mocks.repository.remove.mockResolvedValue(undefined);
  });

  it('prepares a signed upload for a PDF of at most 5 MB on a fresh path', async () => {
    const result = await prepareTemplateUploadAction({ size: 120_000, type: 'application/pdf' });
    expect(result).toMatchObject({ success: true, token: 'token' });
    expect(result.success && result.path).toMatch(/^templates\/[0-9a-f-]{36}\.pdf$/);
    expect(await prepareTemplateUploadAction({ size: 120_000, type: 'image/png' })).toEqual({ success: false, error: 'Template harus berupa file PDF.' });
    expect(await prepareTemplateUploadAction({ size: 6_000_000, type: 'application/pdf' })).toEqual({ success: false, error: 'Ukuran template maksimal 5 MB.' });
  });

  it('accepts a 2-page template for preview without activating it', async () => {
    expect(await checkTemplateAction(path)).toEqual({ success: true });
    expect(mocks.repository.activate).not.toHaveBeenCalled();
  });

  it('rejects and removes an upload that is not a 2-page PDF', async () => {
    mocks.repository.download.mockResolvedValue(new TextEncoder().encode('bukan pdf'));
    expect(await checkTemplateAction(path)).toEqual({ success: false, error: 'File template bukan PDF yang dapat dibaca.' });
    expect(mocks.repository.remove).toHaveBeenCalledWith(path);
  });

  it('activates the checked template, replaces the old one and refreshes the page', async () => {
    mocks.repository.activate.mockResolvedValue(oldPath);
    expect(await activateTemplateAction(path)).toEqual({ success: true });
    expect(mocks.repository.activate).toHaveBeenCalledWith(path);
    expect(mocks.repository.remove).toHaveBeenCalledWith(oldPath);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengumuman');
  });

  it('never activates or discards a path the system did not create', async () => {
    for (const bad of ['../dokumen_pendaftaran/x.pdf', 'templates/x.pdf', 'registrations/a/aktaKelahiran.pdf']) {
      expect(await activateTemplateAction(bad)).toEqual({ success: false, error: 'Template tidak valid.' });
      expect(await discardTemplateAction(bad)).toEqual({ success: false, error: 'Template tidak valid.' });
    }
    expect(mocks.repository.activate).not.toHaveBeenCalled();
    expect(mocks.repository.remove).not.toHaveBeenCalled();
  });

  it('discards a cancelled upload but never the active template', async () => {
    expect(await discardTemplateAction(path)).toEqual({ success: true });
    expect(mocks.repository.remove).toHaveBeenCalledWith(path);
    mocks.repository.remove.mockClear();
    mocks.repository.getActive.mockResolvedValue({ path, uploadedAt: '2026-10-29T00:00:00Z' });
    expect(await discardTemplateAction(path)).toEqual({ success: false, error: 'Template aktif tidak dapat dibuang.' });
    expect(mocks.repository.remove).not.toHaveBeenCalled();
  });

  it('rejects every step without an admin session', async () => {
    mocks.session.mockResolvedValue(false);
    const denied = { success: false, error: 'Sesi admin tidak valid. Silakan masuk kembali.' };
    expect(await prepareTemplateUploadAction({ size: 1, type: 'application/pdf' })).toEqual(denied);
    expect(await checkTemplateAction(path)).toEqual(denied);
    expect(await activateTemplateAction(path)).toEqual(denied);
    expect(await discardTemplateAction(path)).toEqual(denied);
    expect(mocks.repository.createUploadToken).not.toHaveBeenCalled();
  });
});
