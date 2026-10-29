import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), getSupabaseAdmin: vi.fn(), findData: vi.fn(), generate: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock('@/features/announcement/server/acceptanceLetterService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/announcement/server/acceptanceLetterService')>(),
  findAdminLetterData: mocks.findData,
  generateAcceptanceLetter: mocks.generate,
}));

import { GET } from '../route';

const id = '123e4567-e89b-12d3-a456-426614174000';
const context = (participantId = id) => ({ params: Promise.resolve({ id: participantId }) });
const request = () => new Request(`https://example.test/admin/pendaftar/${id}/surat-penerimaan`);

describe('admin Surat Penerimaan download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.getSupabaseAdmin.mockReturnValue({});
    mocks.findData.mockResolvedValue({ nomorPendaftaran: 'OB-2027-001', letter: { namaLengkap: 'SITI AMINAH', nomorVa: '7456012627300120', tempatLahir: null, tanggalLahir: null } });
    mocks.generate.mockResolvedValue({ bytes: new Uint8Array([37, 80, 68, 70]), fileName: 'Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf' });
  });

  it('requires an admin session before touching any data', async () => {
    mocks.session.mockResolvedValue(false);
    expect((await GET(request(), context())).status).toBe(401);
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it('serves the letter of a Pendaftar Diterima with a Nomor VA as a download', async () => {
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(mocks.findData).toHaveBeenCalledWith({}, id);
    expect(response.headers.get('content-disposition')).toContain('Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf');
  });

  it('explains when the Pendaftar has no letter or no template is active', async () => {
    expect((await GET(request(), context('bukan-uuid'))).status).toBe(404);
    mocks.findData.mockResolvedValueOnce(null);
    expect((await GET(request(), context())).status).toBe(404);
    mocks.generate.mockResolvedValueOnce(null);
    expect((await GET(request(), context())).status).toBe(409);
  });
});
