import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNameTagPng, NAME_TAG_HEIGHT, NAME_TAG_WIDTH } from '../nameTagCard';

const sizeOf = (font: string) => Number(/(\d+)px/.exec(font)![1]);

/** jsdom has no real canvas, so a stand-in records what would be painted. */
function fakeCanvas() {
  const texts: { text: string; x: number; y: number; font: string; maxWidth: number }[] = [];
  const drawImage = vi.fn();
  const context = {
    font: '',
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
    fillText: (text: string, x: number, y: number, maxWidth: number) => texts.push({ text, x, y, font: context.font, maxWidth }),
    // Each character is 0.6 of the font size wide, whatever the real width is.
    measureText: (text: string) => ({ width: text.length * sizeOf(context.font) * 0.6 }),
    drawImage,
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

  const template = document.createElement('canvas');
  const card = { namaLengkap: 'Aisyah Putri', ruangOkb: 'Ruang A', template };

  it('produces a PNG of 1004 x 1299 pixels', async () => {
    fakeCanvas();
    const png = await createNameTagPng(card);
    expect([NAME_TAG_WIDTH, NAME_TAG_HEIGHT]).toEqual([1004, 1299]);
    expect(png.type).toBe('image/png');
    expect(await png.text()).toBe('1004x1299');
  });

  it('paints the design across the whole card, under the text', async () => {
    const { drawImage } = fakeCanvas();
    await createNameTagPng(card);
    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith(template, 0, 0, 1004, 1299);
  });

  it('writes only the Ruang OKB and then the name below it, centered', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng(card);
    expect(texts.map(({ text }) => text)).toEqual(['Ruang A', 'Aisyah Putri']);
    expect(texts[0].y).toBeLessThan(texts[1].y);
    texts.forEach(({ x }) => expect(x).toBe(502));
  });

  it('shortens a name that is too wide for its label', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng({ ...card, namaLengkap: 'MUHAMMAD ABDURRAHMAN AL-FATIH RAMADHAN' });
    expect(texts.map(({ text }) => text)).toContain('Muhammad A.A.R.');
  });

  it('keeps the usual size for a short room', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng(card);
    expect(sizeOf(texts[0].font)).toBe(36);
  });

  it('makes a long room smaller so it stays inside its plate', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng({ ...card, ruangOkb: 'Lab Komputer Atas' });
    const [room] = texts;
    expect(sizeOf(room.font)).toBeLessThan(36);
    expect('Lab Komputer Atas'.length * sizeOf(room.font) * 0.6).toBeLessThanOrEqual(room.maxWidth);
  });

  it('never makes a very long room smaller than is readable, and squeezes it instead', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng({ ...card, ruangOkb: 'Laboratorium Komputer Lantai 2' });
    const [room] = texts;
    expect(sizeOf(room.font)).toBeGreaterThanOrEqual(22);
    expect(room.maxWidth).toBeLessThanOrEqual(270);
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
