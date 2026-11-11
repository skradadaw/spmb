// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { describe, expect, it } from 'vitest';
import { AcceptanceTemplateError, acceptanceLetterFileName, buildAcceptanceLetter, formatTempatTanggalLahir, LETTER_FIELDS, PREVIEW_SAMPLES } from '../acceptanceLetter';

/** Template sekolah dari Microsoft Word, lengkap dengan teks contohnya (ADR 0002). */
const template = new Uint8Array(readFileSync(resolve(process.cwd(), 'docs/templates/surat-penerimaan.pdf')));
const FORMAT = '400.3.10.1/{urut}-SDS3AM/OKB/2026';
const MM = 72 / 25.4;

/** Teks per halaman, dibaca kembali dari PDF hasil seperti yang dilihat orang tua. */
async function readPages(bytes: Uint8Array) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const standardFontDataUrl = `${resolve(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts')}/`;
  const pdf = await pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: false, standardFontDataUrl }).promise;
  const pages: { width: number; height: number; items: TextItem[]; text: string }[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const items = (await page.getTextContent()).items.filter((item): item is TextItem => 'str' in item);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ width: viewport.width, height: viewport.height, items, text: items.map(item => item.str).join('\n') });
  }
  return pages;
}

type Page = Awaited<ReturnType<typeof readPages>>[number];
const find = (page: Page, str: string) => page.items.find(item => item.str === str)!;
const baseline = (page: Page, str: string) => find(page, str).transform[5];
const offCenter = (page: Page, item: TextItem) => Math.abs(item.transform[4] + item.width / 2 - page.width / 2);

describe('Surat Penerimaan', () => {
  it('replaces the sample name with the child\'s name in capitals and writes the Nomor VA after its label, keeping 2 pages', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, { ...PREVIEW_SAMPLES.biasa, namaLengkap: 'Siti  aminah' }));
    expect(pages).toHaveLength(2);
    expect(pages[0].text).toContain('SITI AMINAH');
    expect(pages[0].text).not.toContain('NAMA SISWA');
    const label = find(pages[0], 'Account (VA):');
    const va = find(pages[0], '7456012627300120');
    expect(va.transform[5]).toBeCloseTo(label.transform[5], 0);
    expect(va.transform[4]).toBeGreaterThan(label.transform[4] + label.width);
    expect(va.transform[4]).toBeLessThan(label.transform[4] + label.width + 10);
    expect(pages[1].text).not.toContain('7456012627300120');
  });

  it('rewrites the whole letter number line, centered where the template had {urut}', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, { ...PREVIEW_SAMPLES.biasa, nomorUrutSurat: 351 }, FORMAT));
    const line = find(pages[0], 'Nomor: 400.3.10.1/351-SDS3AM/OKB/2026');
    expect(line).toBeDefined();
    expect(offCenter(pages[0], line)).toBeLessThan(1);
    expect(line.transform[5]).toBeLessThan(baseline(pages[0], 'PENGUMUMAN'));
    expect(line.transform[5]).toBeGreaterThan(baseline(pages[0], 'SITI AMINAH'));
    expect(pages[0].text).not.toContain('{urut}');
    expect(pages[0].items.filter(item => item.str.includes('Nomor:'))).toHaveLength(1);
    expect(pages[1].text).not.toContain('Nomor: 400');
  });

  it('leaves the letter number line empty until the child has a number and the format is set', async () => {
    for (const unnumbered of [
      await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa, FORMAT),
      await buildAcceptanceLetter(template, { ...PREVIEW_SAMPLES.biasa, nomorUrutSurat: 351 }),
    ]) {
      const text = (await readPages(unnumbered))[0].text;
      expect(text).not.toContain('Nomor:');
      expect(text).not.toContain('{urut}');
    }
  });

  it('replaces the sample school with Asal TK/RA, or a dash when it is unknown', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa));
    const school = find(pages[0], 'TK AL-MUHAJIRIN');
    expect(offCenter(pages[0], school)).toBeLessThan(1);
    expect(school.transform[5]).toBeLessThan(baseline(pages[0], 'Asal TK/RA:'));
    expect(school.transform[5]).toBeGreaterThan(baseline(pages[0], 'Dinyatakan:'));
    expect(pages[0].text).not.toContain('NAMA SEKOLAH');

    const unknown = await readPages(await buildAcceptanceLetter(template, { ...PREVIEW_SAMPLES.biasa, asalSekolah: null }));
    expect(unknown[0].text).not.toContain('NAMA SEKOLAH');
    const dash = unknown[0].items.find(item => item.str === '-' && Math.abs(item.transform[5] - school.transform[5]) < 1);
    expect(dash).toBeDefined();
  });

  it('fills the child\'s name and tempat/tanggal lahir on the Surat Pernyataan, leaving the parent lines blank', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa));
    // "Nama Lengkap" muncul dua kali: orang tua/wali (atas) dan calon peserta didik (bawah).
    const nameLabels = pages[1].items.filter(item => item.str === 'Nama Lengkap').map(item => item.transform[5]).sort((a, b) => b - a);
    expect(nameLabels).toHaveLength(2);
    expect(baseline(pages[1], 'Siti Aminah')).toBeCloseTo(nameLabels[1], 0);
    const birthLabel = find(pages[1], 'Tempat, Tanggal Lahir');
    expect(baseline(pages[1], 'Purwakarta, 12 Maret 2020')).toBeCloseTo(birthLabel.transform[5], 0);
    expect(find(pages[1], 'Siti Aminah').transform[4]).toBeGreaterThan(birthLabel.transform[4] + birthLabel.width);
  });

  it('shrinks a very long name and school to one line within the page', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.panjang));
    for (const [str, fullSize] of [[PREVIEW_SAMPLES.panjang.namaLengkap, 20], [PREVIEW_SAMPLES.panjang.asalSekolah, 12]] as const) {
      const line = find(pages[0], str);
      expect(line).toBeDefined();
      const [size, , , , x] = line.transform;
      expect(size).toBeLessThan(fullSize);
      expect(x).toBeGreaterThan(0);
      expect(x + line.width).toBeLessThan(pages[0].width);
    }
  });

  it('keeps a normal name at the size of the sample name, centered between PENGUMUMAN and Asal TK/RA', async () => {
    const pages = await readPages(await buildAcceptanceLetter(template, PREVIEW_SAMPLES.biasa));
    const line = find(pages[0], 'SITI AMINAH');
    expect(line.transform[0]).toBeCloseTo(20, 0);
    expect(offCenter(pages[0], line)).toBeLessThan(1);
    expect(line.transform[5]).toBeLessThan(baseline(pages[0], 'PENGUMUMAN'));
    expect(line.transform[5]).toBeGreaterThan(baseline(pages[0], 'Asal TK/RA:'));
  });

  it('falls back to the measured positions when the template has no readable sample text', async () => {
    const blank = await PDFDocument.create();
    blank.addPage([595.32, 841.92]);
    blank.addPage([595.32, 841.92]);
    const pages = await readPages(await buildAcceptanceLetter(await blank.save(), { ...PREVIEW_SAMPLES.biasa, nomorUrutSurat: 350 }, FORMAT));
    const fromTop = (page: Page, str: string) => (page.height - baseline(page, str)) / MM;
    expect(fromTop(pages[0], 'Nomor: 400.3.10.1/350-SDS3AM/OKB/2026')).toBeCloseTo(LETTER_FIELDS.nomorSurat.y, 0);
    expect(fromTop(pages[0], 'SITI AMINAH')).toBeCloseTo(LETTER_FIELDS.namaAnak.y, 0);
    expect(fromTop(pages[0], 'TK AL-MUHAJIRIN')).toBeCloseTo(LETTER_FIELDS.asalSekolah.y, 0);
    expect(fromTop(pages[0], '7456012627300120')).toBeCloseTo(LETTER_FIELDS.nomorVa.y, 0);
    expect(fromTop(pages[1], 'Siti Aminah')).toBeCloseTo(LETTER_FIELDS.namaPesertaDidik.y, 0);
    expect(fromTop(pages[1], 'Purwakarta, 12 Maret 2020')).toBeCloseTo(LETTER_FIELDS.tempatTanggalLahir.y, 0);
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
