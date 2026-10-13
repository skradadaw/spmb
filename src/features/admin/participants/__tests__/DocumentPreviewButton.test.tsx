import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ review: vi.fn() }));
vi.mock('../actions/saveDocumentReviewAction', () => ({ saveDocumentReviewAction: mocks.review }));
vi.mock('../actions/replaceDocumentActions', () => ({ prepareDocumentReplacementAction: vi.fn(), commitDocumentReplacementAction: vi.fn() }));

import { DocumentPreviewButton, formatFileSize, nextUnverifiedIndex, type ViewerDocument } from '../components/DocumentPreviewButton';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const base = `/admin/pendaftar/${participantId}/dokumen`;
const documents: ViewerDocument[] = [
  { id: 'aktaKelahiran', title: 'Akta Kelahiran', href: `${base}/aktaKelahiran?contentType=image%2Fjpeg&v=o`, verified: false, replacedAt: null },
  { id: 'kartuKeluarga', title: 'Kartu Keluarga', href: `${base}/kartuKeluarga?contentType=image%2Fpng&v=1760400000000`, verified: true, replacedAt: '2025-10-14T00:00:00.000Z' },
  { id: 'pasFoto', title: 'Pas Foto Anak', href: `${base}/pasFoto?contentType=image%2Fjpeg&v=o`, verified: false, replacedAt: null },
];

function imageResponse(type = 'image/jpeg') {
  return new Response(new Uint8Array(2048), { status: 200, headers: { 'content-type': type, 'content-length': '2048' } });
}

describe('document viewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.review.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn(async (input: string) => imageResponse(input.includes('image%2Fpng') ? 'image/png' : 'image/jpeg')));
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.unstubAllGlobals());

  async function open(index = 0) {
    render(<DocumentPreviewButton participantId={participantId} documents={documents} index={index} />);
    fireEvent.click(screen.getByRole('button', { name: `Lihat berkas ${documents[index].title}` }));
    return screen.findByRole('dialog', { name: `Berkas ${documents[index].title}` });
  }

  it('loads the versioned file through the browser cache and shows its info', async () => {
    const dialog = await open();
    expect(fetch).toHaveBeenCalledWith(documents[0].href, expect.objectContaining({ credentials: 'same-origin' }));
    expect(await screen.findByRole('img', { name: 'Akta Kelahiran' })).toBeTruthy();
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('blob:preview');
    expect(dialog.querySelector('[data-document-info]')?.textContent).toContain('2 KB');
    expect(dialog.querySelector('[data-document-info]')?.textContent).toContain('Dari pendaftaran');
    expect(screen.getByText('1 dari 3')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Unduh berkas Akta Kelahiran' }).getAttribute('href')).toBe(`${documents[0].href}&download=1`);
  });

  it('fetches PDFs through the binary preview variant so no download is triggered', async () => {
    const pdf: ViewerDocument = { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', href: `${base}/buktiPembayaran?contentType=application%2Fpdf&v=o`, verified: false, replacedAt: null };
    vi.mocked(fetch).mockResolvedValue(new Response(new Uint8Array(16), { status: 200, headers: { 'content-type': 'application/octet-stream' } }));
    render(<DocumentPreviewButton participantId={participantId} documents={[pdf]} index={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat pratinjau PDF Bukti Pembayaran OKB' }));
    await screen.findByRole('dialog', { name: 'Berkas Bukti Pembayaran OKB' });
    expect(fetch).toHaveBeenCalledWith(`${pdf.href}&preview=pdfjs&as=text`, expect.anything());
    expect(screen.getByRole('link', { name: 'Unduh berkas Bukti Pembayaran OKB' }).getAttribute('href')).toBe(`${pdf.href}&download=1`);
  });

  it('moves between documents with buttons and arrow keys', async () => {
    const dialog = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Berkas berikutnya' }));
    expect(await screen.findByRole('dialog', { name: 'Berkas Kartu Keluarga' })).toBeTruthy();
    expect(screen.getByText(/Diganti admin, 14 Okt 2025/)).toBeTruthy();
    fireEvent.keyDown(dialog.firstElementChild as HTMLElement, { key: 'ArrowRight' });
    expect(await screen.findByRole('dialog', { name: 'Berkas Pas Foto Anak' })).toBeTruthy();
    fireEvent.keyDown(dialog.firstElementChild as HTMLElement, { key: 'ArrowRight' });
    expect(await screen.findByRole('dialog', { name: 'Berkas Akta Kelahiran' })).toBeTruthy();
  });

  it('zooms and rotates with toolbar and keyboard shortcuts', async () => {
    const dialog = await open();
    const image = await screen.findByRole('img', { name: 'Akta Kelahiran' });
    fireEvent.keyDown(dialog.firstElementChild as HTMLElement, { key: '+' });
    expect(screen.getByText('120%')).toBeTruthy();
    fireEvent.keyDown(dialog.firstElementChild as HTMLElement, { key: 'r' });
    expect(image.getAttribute('style')).toContain('rotate(90deg)');
    fireEvent.keyDown(dialog.firstElementChild as HTMLElement, { key: '0' });
    expect(screen.getByText('100%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Perbesar' }));
    expect(image.getAttribute('style')).toContain('scale(1.2)');
  });

  it('verifies and jumps to the next unverified document', async () => {
    await open();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Verifikasi Akta Kelahiran' })); });
    const sent = mocks.review.mock.calls[0][0] as FormData;
    expect(sent.get('status')).toBe('verified');
    expect(sent.get('documentId')).toBe('aktaKelahiran');
    // Kartu Keluarga is already verified, so the viewer skips to Pas Foto.
    expect(await screen.findByRole('dialog', { name: 'Berkas Pas Foto Anak' })).toBeTruthy();
  });

  it('can undo a verification and offers replacement in the viewer', async () => {
    await open(1);
    expect(screen.getByRole('button', { name: 'Ganti berkas Kartu Keluarga' })).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Batalkan verifikasi Kartu Keluarga' })); });
    expect((mocks.review.mock.calls[0][0] as FormData).get('status')).toBe('unverified');
  });

  it('offers a retry when the file cannot be loaded', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('x', { status: 502 }));
    await open();
    expect(await screen.findByText('Berkas gagal dimuat')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await waitFor(() => expect(screen.getByRole('img', { name: 'Akta Kelahiran' })).toBeTruthy());
  });

  it('formats sizes and picks the next unverified document', () => {
    expect(formatFileSize(350 * 1024)).toBe('350 KB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1,5 MB');
    expect(nextUnverifiedIndex(documents, 0)).toBe(2);
    expect(nextUnverifiedIndex(documents.map(item => ({ ...item, verified: true })), 0)).toBe(-1);
  });
});
