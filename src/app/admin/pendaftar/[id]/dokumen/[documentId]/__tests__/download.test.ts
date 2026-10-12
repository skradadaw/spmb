import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAdminSession: vi.fn(), getSupabaseAdmin: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

import { GET } from '../route';

const id = '123e4567-e89b-12d3-a456-426614174000';
const context = { params: Promise.resolve({ id, documentId: 'pasFoto' }) };
const request = (query = '') => new Request(`https://example.test/admin/pendaftar/${id}/dokumen/pasFoto${query}`);

describe('participant document route downloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
  });

  it('marks requested private document responses as attachments', async () => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id, submission_id: id, dokumen_pas_foto: `registrations/${id}/pasFoto.png` }, error: null }) };
    const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.example/signed-secret' }, error: null });
    mocks.getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => query), storage: { from: vi.fn(() => ({ createSignedUrl })) } });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('image-content', { status: 200 }));
    const response = await GET(request('?download=1'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toBe(`attachment; filename="${id}-pasFoto.png"`);
    expect(response.headers.get('cache-control')).toContain('no-store');
    fetchMock.mockRestore();
  });

  it('serves PDF.js preview bytes as a generic binary stream', async () => {
    const pdfContext = { params: Promise.resolve({ id, documentId: 'aktaKelahiran' }) };
    const pdfRequest = new Request(`https://example.test/admin/pendaftar/${id}/dokumen/aktaKelahiran?preview=pdfjs`);
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id, submission_id: id, dokumen_akta_kelahiran: `registrations/${id}/aktaKelahiran.pdf` }, error: null }) };
    const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.example/signed-pdf' }, error: null });
    mocks.getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => query), storage: { from: vi.fn(() => ({ createSignedUrl })) } });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('pdf-content', { status: 200 }));

    const response = await GET(pdfRequest, pdfContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/octet-stream');
    expect(response.headers.get('content-disposition')).toBeNull();
    fetchMock.mockRestore();
  });
});
