import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { unzipSync } from 'fflate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DownloadNameTagZip } from '../DownloadNameTagZip';

const card = vi.hoisted(() => ({
  createNameTagPng: vi.fn(),
  loadNameTagTemplate: vi.fn(),
}));
vi.mock('../../nameTagCard', () => card);

const selected = { tanggal: '2026-11-20', gelombang: 2 as const };
const template = { template: true };
const pngOf = (text: string) => new Blob([text], { type: 'image/png' });
const member = (id: string, namaLengkap: string, ruangOkb: string | null) => ({ id, namaLengkap, ruangOkb });
const button = () => screen.getByRole('button', { name: 'Unduh ZIP Name Tag' }) as HTMLButtonElement;

describe('DownloadNameTagZip', () => {
  let downloads: { fileName: string; blob: Blob }[];
  let lastBlob: Blob;

  const unzipDownload = async (index = 0) => {
    const entries = unzipSync(new Uint8Array(await downloads[index].blob.arrayBuffer()));
    return Object.fromEntries(Object.entries(entries).map(([name, bytes]) => [name, new TextDecoder().decode(bytes)]));
  };

  beforeEach(() => {
    downloads = [];
    card.loadNameTagTemplate.mockReset().mockResolvedValue(template);
    card.createNameTagPng.mockReset().mockImplementation(async ({ namaLengkap }: { namaLengkap: string }) => pngOf(`png of ${namaLengkap}`));
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn((blob: Blob) => { lastBlob = blob; return 'blob:x'; }), revokeObjectURL: vi.fn() }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloads.push({ fileName: this.download, blob: lastBlob }); });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows how many cards it will make and how many Pendaftar have no Ruang OKB', () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A'), member('b', 'Bilal', 'Ruang B'), member('c', 'Citra', null)]} />);

    expect(screen.getByText('2 kartu akan diunduh.')).toBeDefined();
    expect(screen.getByText('1 Pendaftar tanpa Ruang OKB tidak ikut diunduh.')).toBeDefined();
    expect(button().disabled).toBe(false);
  });

  it('disables the download when no card can be made', () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', null), member('b', 'Bilal', '  ')]} />);

    expect(screen.getByText('0 kartu akan diunduh.')).toBeDefined();
    expect(screen.getByText('2 Pendaftar tanpa Ruang OKB tidak ikut diunduh.')).toBeDefined();
    expect(button().disabled).toBe(true);
    fireEvent.click(button());
    expect(card.createNameTagPng).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
  });

  it('downloads one ZIP named after the group, with one PNG per eligible Pendaftar', async () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'AISYAH', 'Ruang A'), member('b', 'Aisyah', 'Ruang A'), member('c', 'Bilal', null), member('d', 'Citra', 'Ruang B')]} />);
    fireEvent.click(button());

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(downloads[0].fileName).toBe('Name Tag 2026-11-20 Gelombang 2.zip');
    expect(downloads[0].blob.type).toBe('application/zip');
    expect(await unzipDownload()).toEqual({
      'Ruang A - Aisyah.png': 'png of AISYAH',
      'Ruang A - Aisyah (2).png': 'png of Aisyah',
      'Ruang B - Citra.png': 'png of Citra',
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('draws every card with the full name, its Ruang OKB, and the template loaded once', async () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A'), member('b', 'Citra', 'Ruang B')]} />);
    fireEvent.click(button());

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(card.loadNameTagTemplate).toHaveBeenCalledTimes(1);
    expect(card.createNameTagPng.mock.calls.map(([arg]) => arg)).toEqual([
      { namaLengkap: 'Aisyah', ruangOkb: 'Ruang A', template },
      { namaLengkap: 'Citra', ruangOkb: 'Ruang B', template },
    ]);
  });

  it('stores the PNGs as they are, because they are already compressed', async () => {
    const compressible = 'a'.repeat(50_000);
    card.createNameTagPng.mockResolvedValue(pngOf(compressible));
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A')]} />);
    fireEvent.click(button());

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(downloads[0].blob.size).toBeGreaterThan(compressible.length);
  });

  it('keeps names outside ASCII readable inside the ZIP', async () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', "Nur'aini Ṣāliḥ", 'Ruang É')]} />);
    fireEvent.click(button());

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(Object.keys(await unzipDownload())).toHaveLength(1);
    expect(Object.keys(await unzipDownload())[0]).toMatch(/^Ruang É - .*\.png$/);
  });

  it('can be downloaded again', async () => {
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A')]} />);
    fireEvent.click(button());
    await waitFor(() => expect(downloads).toHaveLength(1));
    await waitFor(() => expect(button().disabled).toBe(false));
    fireEvent.click(button());
    await waitFor(() => expect(downloads).toHaveLength(2));
  });

  it('says so when an image cannot be made, downloads nothing, and lets the admin retry', async () => {
    card.createNameTagPng.mockRejectedValueOnce(new Error('canvas'));
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A'), member('b', 'Citra', 'Ruang B')]} />);
    fireEvent.click(button());

    expect((await screen.findByRole('alert')).textContent).toBe('ZIP Name Tag gagal dibuat. Silakan coba lagi.');
    expect(downloads).toEqual([]);

    fireEvent.click(button());
    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(Object.keys(await unzipDownload())).toHaveLength(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('says so when the card design cannot be loaded, and downloads nothing', async () => {
    card.loadNameTagTemplate.mockRejectedValueOnce(new Error('missing'));
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A')]} />);
    fireEvent.click(button());

    expect((await screen.findByRole('alert')).textContent).toBe('ZIP Name Tag gagal dibuat. Silakan coba lagi.');
    expect(card.createNameTagPng).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
  });

  it('says so when the ZIP cannot be made', async () => {
    const unreadable = pngOf('png');
    unreadable.arrayBuffer = () => Promise.reject(new Error('unreadable'));
    card.createNameTagPng.mockResolvedValue(unreadable);
    render(<DownloadNameTagZip selected={selected} members={[member('a', 'Aisyah', 'Ruang A')]} />);
    fireEvent.click(button());

    expect((await screen.findByRole('alert')).textContent).toBe('ZIP Name Tag gagal dibuat. Silakan coba lagi.');
    expect(downloads).toEqual([]);
  });
});
