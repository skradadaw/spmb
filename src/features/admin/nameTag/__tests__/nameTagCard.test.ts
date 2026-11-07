import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNameTagPng, NAME_TAG_HEIGHT, NAME_TAG_WIDTH } from '../nameTagCard';

/** jsdom has no real canvas, so a stand-in records what would be painted. */
function fakeCanvas() {
  const texts: { text: string; y: number }[] = [];
  const drawImage = vi.fn();
  const noop = () => {};
  const context = {
    fillText: (text: string, _x: number, y: number) => texts.push({ text, y }),
    // 40 units per character: 21 characters fit, 22 do not, whatever the real width is.
    measureText: (text: string) => ({ width: text.length * 40 }),
    drawImage,
    fillRect: noop, strokeRect: noop, beginPath: noop, closePath: noop, roundRect: noop, arc: noop, fill: noop, stroke: noop, save: noop, restore: noop, clip: noop,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  return { texts, drawImage };
}

describe('createNameTagPng', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (this: HTMLCanvasElement, callback, type) {
      callback(new Blob([`${this.width}x${this.height}`], { type }));
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const card = { namaLengkap: 'Aisyah Putri', ruangOkb: 'Ruang A', logo: null };

  it('produces a PNG of 1004 x 1299 pixels', async () => {
    fakeCanvas();
    const png = await createNameTagPng(card);
    expect([NAME_TAG_WIDTH, NAME_TAG_HEIGHT]).toEqual([1004, 1299]);
    expect(png.type).toBe('image/png');
    expect(await png.text()).toBe('1004x1299');
  });

  it('paints the school, name, Ruang OKB, then the three Tes OKB from top to bottom', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng(card);
    const order = [...texts].sort((a, b) => a.y - b.y).map(({ text }) => text);
    expect(order.slice(0, 3)).toEqual(['SD Plus 3 Al-Muhajirin', 'Aisyah Putri', 'Ruang OKB']);
    expect(order[3]).toBe('Ruang A');
    expect(order.slice(4).sort()).toEqual(['Literasi', 'Numerasi', 'Tahsin']);
  });

  it('shortens a name that is too wide for the card', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng({ ...card, namaLengkap: 'MUHAMMAD ABDURRAHMAN AL-FATIH RAMADHAN' });
    expect(texts.map(({ text }) => text)).toContain('Muhammad A.A.R.');
  });

  it('shows nothing the spec leaves off the card', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng(card);
    const painted = texts.map(({ text }) => text).join(' ');
    expect(painted).not.toMatch(/OB-|Gelombang|Tahun Pelajaran|Reguler|Bilingual|Tahfizh|Tanggal/);
    expect(texts).toHaveLength(7);
  });

  it('paints the logo when it has one', async () => {
    const { drawImage } = fakeCanvas();
    const logo = document.createElement('canvas');
    await createNameTagPng({ ...card, logo });
    expect(drawImage).toHaveBeenCalledWith(logo, expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number));
  });

  it('still makes the card without a logo', async () => {
    const { drawImage, texts } = fakeCanvas();
    const png = await createNameTagPng(card);
    expect(drawImage).not.toHaveBeenCalled();
    expect(png.size).toBeGreaterThan(0);
    expect(texts.map(({ text }) => text)).toContain('SD Plus 3 Al-Muhajirin');
  });

  it('fails plainly when the browser gives no canvas', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await expect(createNameTagPng(card)).rejects.toThrow();
  });

  it('fails plainly when the PNG cannot be encoded', async () => {
    fakeCanvas();
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) { callback(null); });
    await expect(createNameTagPng(card)).rejects.toThrow();
  });
});
