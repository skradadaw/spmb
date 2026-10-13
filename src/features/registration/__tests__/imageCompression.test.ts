import { afterEach, describe, expect, it, vi } from 'vitest';
import { compressImage, scaledSize } from '../imageCompression';

describe('image compression', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('scales the long edge down to 2000 px and never up', () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 2000, height: 1500 });
    expect(scaledSize(3000, 6000)).toEqual({ width: 1000, height: 2000 });
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('leaves PDFs untouched', async () => {
    const pdf = new File(['%PDF-1.7'], 'akta.pdf', { type: 'application/pdf' });
    expect(await compressImage(pdf)).toBe(pdf);
  });

  it('re-encodes a large photo as a smaller JPEG', async () => {
    const close = vi.fn();
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 4000, height: 3000, close }));
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage, fillStyle: '' } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) { callback(new Blob(['small'], { type: 'image/jpeg' })); });
    const photo = new File([new Uint8Array(50_000)], 'kk.png', { type: 'image/png' });
    const result = await compressImage(photo);
    expect(result.name).toBe('kk.jpg');
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBeLessThan(photo.size);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2000, 1500);
    expect(close).toHaveBeenCalled();
  });

  it('keeps the original when decoding fails', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('broken')));
    const photo = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    expect(await compressImage(photo)).toBe(photo);
  });
});
