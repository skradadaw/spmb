// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { describe, expect, it } from 'vitest';
import { AcceptanceTemplateError, acceptanceLetterFileName, buildAcceptanceLetter, formatTempatTanggalLahir, PREVIEW_SAMPLES } from '../acceptanceLetter';

/** Template sekolah yang posisinya diukur (ADR 0002); ganti bersama LETTER_FIELDS bila tata letaknya berubah. */
const template = new Uint8Array(readFileSync(resolve(process.cwd(), 'docs/templates/surat-penerimaan.pdf')));


/** Teks per halaman, dibaca kembali dari PDF hasil seperti yang dilihat orang tua. */
async function readPages(bytes: Uint8Array) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const standardFontDataUrl = `${resolve(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts')}/`;
  const pdf = await pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: false, standardFontDataUrl }).promise;
  const pages: { width: number; items: TextItem[]; text: string }[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const items = (await page.getTextContent()).items.filter((item): item is TextItem => 'str' in item);
    pages.push({ width: page.getViewport({ scale: 1 }).width, items, text: items.map(item => item.str).join('\n') });
  }
  return pages;
}

describe('Surat Penerimaan', () => {
  it('writes the child\'s name in capitals and the Nomor VA on page 1, and keeps 2 pages', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, { namaLengkap: 'Siti  aminah', nomorVa: '7456012627300120', tempatLahir: 'PURWAKARTA', tanggalLahir: '2020-03-12' }));
    expect(pages).toHaveLength(2);
    expect(pages[0].text).toContain('SITI AMINAH');
    expect(pages[0].text).toContain('7456012627300120');
    expect(pages[1].text).not.toContain('7456012627300120');
  });

  it('fills the child\'s name and tempat/tanggal lahir on the Surat Pernyataan, leaving the parent lines blank', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa));
    const baseline = (str: string) => pages[1].items.find(item => item.str === str)?.transform[5];
    // Ditulis di baris calon peserta didik (dua baris terakhir isian), bukan di baris orang tua/wali.
    const dotLines = pages[1].items.filter(item => /^: \.{20,}/.test(item.str)).map(item => item.transform[5]).sort((a, b) => b - a);
    expect(dotLines).toHaveLength(5);
    expect(baseline('Siti Aminah')).toBeCloseTo(dotLines[3], 0);
    expect(baseline('Purwakarta, 12 Maret 2020')).toBeCloseTo(dotLines[4], 0);
  });

  it('shrinks a very long name to one line within the page', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.panjang));
    const name = PREVIEW_SAMPLES.panjang.namaLengkap;
    const line = pages[0].items.find(item => item.str === name);
    expect(line).toBeDefined();
    const [size, , , , x] = line!.transform;
    expect(size).toBeLessThan(20);
    expect(x).toBeGreaterThan(0);
    expect(x + line!.width).toBeLessThan(pages[0].width);
  });

  it('keeps a normal name at full size, centered', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa));
    const line = pages[0].items.find(item => item.str === 'SITI AMINAH')!;
    const [size, , , , x] = line.transform;
    expect(size).toBe(20);
    expect(Math.abs(x + line.width / 2 - pages[0].width / 2)).toBeLessThan(1);
  });

  it('rejects a template that is not a readable 2-page PDF', async () => {
    const onePage = await PDFDocument.create();
    onePage.addPage();
    await expect(buildAcceptanceLetter(await onePage.save(), PREVIEW_SAMPLES.biasa)).rejects.toThrow('Template harus tepat 2 halaman; file ini 1 halaman.');
    await expect(buildAcceptanceLetter(new TextEncoder().encode('bukan pdf'), PREVIEW_SAMPLES.biasa)).rejects.toBeInstanceOf(AcceptanceTemplateError);
  });

  it('names the file after the Nomor Pendaftaran and the child', () => {
    expect(acceptanceLetterFileName('OB-2027-001', 'SITI AMINAH')).toBe('Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf');
    expect(acceptanceLetterFileName('OB-2027-002', "MUH. 'ALI AL-FATIH")).toBe('Surat-Penerimaan-OB-2027-002-Muh-Ali-al-Fatih.pdf');
  });

  it('writes tempat and tanggal lahir the Indonesian way, skipping what is missing', () => {
    expect(formatTempatTanggalLahir('KAB. PURWAKARTA', '2019-12-31')).toBe('Kab. Purwakarta, 31 Desember 2019');
    expect(formatTempatTanggalLahir(null, '2019-12-31')).toBe('31 Desember 2019');
    expect(formatTempatTanggalLahir('Purwakarta', null)).toBe('Purwakarta');
  });
});
