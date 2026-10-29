import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), generate: vi.fn() }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-vercel-forwarded-for': '203.0.113.7' }) }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({}),
  getSourceAddress: (headers: Headers) => headers.get('x-vercel-forwarded-for'),
  hashRegistrationSource: (source: string) => `hash:${source}`,
}));
vi.mock('@/features/announcement/server/resultCheckRepository', () => ({ createResultCheckRepository: () => ({}) }));
vi.mock('@/features/announcement/resultCheck', () => ({ authorizeAcceptanceLetter: mocks.authorize }));
vi.mock('@/features/announcement/server/acceptanceLetterService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/announcement/server/acceptanceLetterService')>(),
  generateAcceptanceLetter: mocks.generate,
}));

import { POST } from '../route';

const letter = { namaLengkap: 'SITI AMINAH', nomorVa: '7456012627300120', tempatLahir: 'PURWAKARTA', tanggalLahir: '2020-03-12' };

function request() {
  const body = new FormData();
  body.set('nomorPendaftaran', 'OB-2027-001');
  body.set('tanggalLahir', '2020-03-12');
  return new Request('https://example.test/hasil-okb/surat', { method: 'POST', body });
}

describe('parent Surat Penerimaan download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({ allowed: true, nomorPendaftaran: 'OB-2027-001', letter });
    mocks.generate.mockResolvedValue({ bytes: new Uint8Array([37, 80, 68, 70]), fileName: 'Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf' });
  });

  it('rechecks the Nomor Pendaftaran and birth date from the POST body, per client', async () => {
    const response = await POST(request());
    expect(mocks.authorize).toHaveBeenCalledWith({ nomorPendaftaran: 'OB-2027-001', tanggalLahir: '2020-03-12' }, 'hash:cek-hasil:203.0.113.7', {});
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf"');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('refuses when the result is not an announced Diterima any more', async () => {
    mocks.authorize.mockResolvedValue({ allowed: false, view: { kind: 'stage', stage: 'Menunggu Pengumuman' } });
    const response = await POST(request());
    expect(response.status).toBe(403);
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('answers a locked client with 429', async () => {
    mocks.authorize.mockResolvedValue({ allowed: false, view: { kind: 'locked' } });
    expect((await POST(request())).status).toBe(429);
  });

  it('says the letter is being prepared while no template is active', async () => {
    mocks.generate.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe('Surat Penerimaan sedang disiapkan panitia.');
  });
});
