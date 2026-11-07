import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNameTagPng, NAME_TAG_HEIGHT, NAME_TAG_WIDTH } from '../nameTagCard';

/** jsdom has no real canvas, so a stand-in records what would be painted. */
function fakeCanvas() {
  const texts: { text: string; y: number }[] = [];
  const drawImage = vi.fn();
  const roundRects: { width: number; height: number }[] = [];
  const noop = () => {};
  const context = {
    fillText: (text: string, _x: number, y: number) => texts.push({ text, y }),
    // 40 units per character: 21 characters fit, 22 do not, whatever the real width is.
    measureText: (text: string) => ({ width: text.length * 40 }),
    drawImage,
    roundRect: (_x: number, _y: number, width: number, height: number) => roundRects.push({ width, height }),
    fillRect: noop, strokeRect: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, quadraticCurveTo: noop, bezierCurveTo: noop, arc: noop, ellipse: noop, fill: noop, stroke: noop, save: noop, restore: noop, clip: noop, translate: noop, rotate: noop, scale: noop,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  return { texts, drawImage, roundRects };
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

  it('paints the school, title, Ruang OKB, name, the three Tes OKB, then the address from top to bottom', async () => {
    const { texts } = fakeCanvas();
    await createNameTagPng(card);
    const order = [...texts].sort((a, b) => a.y - b.y).map(({ text }) => text);
    expect(order.slice(0, 8)).toEqual([
      'SD Plus 3 Al-Muhajirin',
      'KARTU PESERTA',
      'OBSERVASI KESIAPAN',
      'BELAJAR (OKB)',
      'T.A 2027-2028',
      'Ruang OKB',
      'Ruang A',
      'Aisyah Putri',
    ]);
    expect(order.slice(8, 11).sort()).toEqual(['Literasi', 'Numerasi', 'Tahsin']);
    expect(order[11]).toMatch(/^JL\. IPIK GANDAMANAH/);
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
    expect(painted).not.toMatch(/OB-|Gelombang|Reguler|Bilingual|Tahfizh|Tanggal/);
    expect(texts).toHaveLength(12);
  });

  it('paints the logo large in place of a photo, and small beside the school name', async () => {
    const { drawImage } = fakeCanvas();
    const logo = document.createElement('canvas');
    await createNameTagPng({ ...card, logo });
    const sizes = drawImage.mock.calls.map(call => call[3] as number).sort((a, b) => a - b);
    expect(sizes).toHaveLength(2);
    expect(sizes[0]).toBeLessThan(100);
    expect(sizes[1]).toBeGreaterThanOrEqual(280);
  });

  it('leaves three square boxes small enough for one star sticker each', async () => {
    const { roundRects } = fakeCanvas();
    await createNameTagPng(card);
    const boxes = roundRects.filter(({ width, height }) => width === height);
    expect(boxes).toHaveLength(3);
    // 118 pixels per cm on the 8,5 cm card.
    boxes.forEach(({ width }) => expect(width).toBeLessThanOrEqual(1.5 * 118));
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
