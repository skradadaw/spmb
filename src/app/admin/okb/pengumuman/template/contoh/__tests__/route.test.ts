// @vitest-environment node
import { PDFDocument } from 'pdf-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn() }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));

import { GET } from '../route';

describe('contoh template Surat Penerimaan', () => {
  beforeEach(() => mocks.session.mockResolvedValue(true));

  it('lets an admin download the 2-page example template', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="contoh-template-surat-penerimaan.pdf"');
    expect((await PDFDocument.load(await response.arrayBuffer())).getPageCount()).toBe(2);
  });

  it('refuses anyone without an admin session', async () => {
    mocks.session.mockResolvedValue(false);
    expect((await GET()).status).toBe(401);
  });
});
