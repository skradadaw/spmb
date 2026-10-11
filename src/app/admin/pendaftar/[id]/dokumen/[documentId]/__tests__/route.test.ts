import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAdminSession: vi.fn(), getSupabaseAdmin: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

import { GET } from '../route';

const id = '123e4567-e89b-12d3-a456-426614174000';
const request = () => new Request(`https://example.test/admin/pendaftar/${id}/dokumen/pasFoto`);
const context = (participantId = id, documentId = 'pasFoto') => ({ params: Promise.resolve({ id: participantId, documentId }) });

describe('participant document route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
  });

  it('denies unauthenticated access before initializing storage', async () => {
    mocks.getAdminSession.mockResolvedValue(false);
    const response = await GET(request(), context());
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('rejects invalid participant and document IDs without storage access', async () => {
    const response = await GET(request(), context('bad-id', 'unknown'));
    expect(response.status).toBe(404);
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('streams private content without exposing the signed URL', async () => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id, submission_id: id, dokumen_pas_foto: `registrations/${id}/pasFoto.png` }, error: null }) };
    const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.example/signed-secret' }, error: null });
    mocks.getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => query), storage: { from: vi.fn(() => ({ createSignedUrl })) } });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('image-content', { status: 200 }));
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(await response.text()).toBe('image-content');
    expect(createSignedUrl).toHaveBeenCalledWith(`registrations/${id}/pasFoto.png`, 60);
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/signed-secret', { cache: 'no-store', redirect: 'error' });
    fetchMock.mockRestore();
  });

  it('returns not found when document row has no safe path', async () => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id, dokumen_pas_foto: 'https://evil.test/file.png' }, error: null }) };
    const createSignedUrl = vi.fn();
    mocks.getSupabaseAdmin.mockReturnValue({ from: vi.fn(() => query), storage: { from: vi.fn(() => ({ createSignedUrl })) } });
    const response = await GET(request(), context());
    expect(response.status).toBe(404);
    expect(createSignedUrl).not.toHaveBeenCalled();
  });
});