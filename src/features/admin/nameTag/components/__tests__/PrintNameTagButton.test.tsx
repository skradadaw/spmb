import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrintNameTagButton } from '../PrintNameTagButton';

const card = vi.hoisted(() => ({
  createNameTagPng: vi.fn(),
  loadNameTagTemplate: vi.fn(),
}));
vi.mock('../../nameTagCard', () => card);

const png = new Blob(['png'], { type: 'image/png' });
const template = { template: true };

describe('PrintNameTagButton', () => {
  let downloaded: string[];

  beforeEach(() => {
    downloaded = [];
    card.loadNameTagTemplate.mockReset().mockResolvedValue(template);
    card.createNameTagPng.mockReset().mockResolvedValue(png);
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded.push(this.download); });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('downloads one PNG named after the Ruang OKB and the full name', async () => {
    render(<PrintNameTagButton status="Terjadwal OKB" namaLengkap="AISYAH PUTRI" ruangOkb="Ruang A" />);
    fireEvent.click(screen.getByRole('button', { name: 'Cetak Name Tag' }));
    await waitFor(() => expect(downloaded).toEqual(['Ruang A - Aisyah Putri.png']));
    expect(card.createNameTagPng).toHaveBeenCalledWith({ namaLengkap: 'AISYAH PUTRI', ruangOkb: 'Ruang A', template });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('can be downloaded again', async () => {
    render(<PrintNameTagButton status="Sudah OKB" namaLengkap="Aisyah" ruangOkb="Ruang A" />);
    const button = screen.getByRole('button', { name: 'Cetak Name Tag' });
    fireEvent.click(button);
    await waitFor(() => expect(downloaded).toHaveLength(1));
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
    await waitFor(() => expect(downloaded).toHaveLength(2));
  });

  it('asks for a Ruang OKB first and does not make a card without one', () => {
    render(<PrintNameTagButton status="Terjadwal OKB" namaLengkap="Aisyah" ruangOkb={null} />);
    const button = screen.getByRole('button', { name: 'Cetak Name Tag' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getByText('Isi Ruang OKB terlebih dahulu untuk mencetak Name Tag.')).toBeDefined();
    fireEvent.click(button);
    expect(card.createNameTagPng).not.toHaveBeenCalled();
  });

  it('says so when the image cannot be made, and lets the admin retry', async () => {
    card.createNameTagPng.mockRejectedValueOnce(new Error('canvas'));
    render(<PrintNameTagButton status="Terjadwal OKB" namaLengkap="Aisyah" ruangOkb="Ruang A" />);
    const button = screen.getByRole('button', { name: 'Cetak Name Tag' });
    fireEvent.click(button);
    expect((await screen.findByRole('alert')).textContent).toBe('Name Tag gagal dibuat. Silakan coba lagi.');
    expect(downloaded).toEqual([]);

    fireEvent.click(button);
    await waitFor(() => expect(downloaded).toHaveLength(1));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('says so when the card design cannot be loaded', async () => {
    card.loadNameTagTemplate.mockRejectedValueOnce(new Error('missing'));
    render(<PrintNameTagButton status="Terjadwal OKB" namaLengkap="Aisyah" ruangOkb="Ruang A" />);
    fireEvent.click(screen.getByRole('button', { name: 'Cetak Name Tag' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Name Tag gagal dibuat. Silakan coba lagi.');
    expect(downloaded).toEqual([]);
  });

  it.each(['Terverifikasi', 'Diterima', 'Ditolak', 'Dibatalkan'])('renders nothing while %s', (status) => {
    const { container } = render(<PrintNameTagButton status={status} namaLengkap="Aisyah" ruangOkb="Ruang A" />);
    expect(container.innerHTML).toBe('');
  });
});
