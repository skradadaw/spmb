import { decodePDFRawStream, PDFArray, PDFName, PDFRawStream, PDFRef, type PDFDocument, type PDFPage } from 'pdf-lib';

/** Sepotong teks template: posisi garis dasar (pt dari kiri-bawah halaman), ukuran huruf, dan isinya. */
export type TextBlock = { x: number; y: number; size: number; text: string };
/** Potongan-potongan teks yang berada di satu baris. */
export type TextLine = { y: number; size: number; text: string; blocks: TextBlock[] };

type Located = TextBlock & { ref: PDFRef; start: number; end: number };

const NUMBER = '(-?\\d*\\.?\\d+)';
const TM_PATTERN = new RegExp(`${Array(6).fill(NUMBER).join('\\s+')}\\s+Tm`);
const TD_PATTERN = new RegExp(`${NUMBER}\\s+${NUMBER}\\s+T[dD]`);
const FONT_PATTERN = new RegExp(`/\\S+\\s+${NUMBER}\\s+Tf`);
const STRING_PATTERN = /\((?:\\[\s\S]|[^\\()])*\)/g;

// Isi halaman dibaca per byte (bukan UTF-8) agar byte lain di dalamnya tidak berubah saat ditulis ulang.
const fromBytes = (bytes: Uint8Array) => {
  let text = '';
  for (let index = 0; index < bytes.length; index += 8192) text += String.fromCharCode(...bytes.subarray(index, index + 8192));
  return text;
};
const toBytes = (text: string) => Uint8Array.from(text, char => char.charCodeAt(0));

function unescape(literal: string) {
  return literal.slice(1, -1).replace(/\\(?:([0-7]{1,3})|([\s\S]))/g, (_match, octal: string | undefined, char: string) => {
    if (octal) return String.fromCharCode(parseInt(octal, 8));
    return '()\\'.includes(char) ? char : ' ';
  });
}

function contentRefs(pdf: PDFDocument, page: PDFPage): PDFRef[] {
  const raw = page.node.get(PDFName.of('Contents'));
  const target = raw instanceof PDFRef ? pdf.context.lookup(raw) : raw;
  if (target instanceof PDFArray) return target.asArray().filter((item): item is PDFRef => item instanceof PDFRef);
  return raw instanceof PDFRef ? [raw] : [];
}

/** Teks template yang cocok dipakai sebagai penanda, tanpa spasi dan tanpa beda huruf besar/kecil. */
export const normalizeTemplateText = (text: string) => text.replace(/\s+/g, '').toUpperCase();

/**
 * Membaca teks sebuah halaman template langsung dari isinya, supaya teks contoh seperti "(NAMA SISWA)"
 * bisa ditemukan posisinya lalu dihapus. Hanya teks yang tersimpan sebagai huruf biasa (seperti PDF dari
 * Microsoft Word) yang terbaca; untuk PDF lain daftarnya kosong dan pembuat surat memakai posisi tetap.
 */
export function openPageText(pdf: PDFDocument, page: PDFPage) {
  const sources = new Map<PDFRef, string>();
  const blocks: Located[] = [];

  for (const ref of contentRefs(pdf, page)) {
    const stream = pdf.context.lookup(ref);
    if (!(stream instanceof PDFRawStream)) continue;
    let source: string;
    try {
      source = fromBytes(decodePDFRawStream(stream).decode());
    } catch {
      continue;
    }
    sources.set(ref, source);
    for (const match of source.matchAll(/\bBT\b[\s\S]*?\bET\b/g)) {
      const body = match[0];
      const matrix = TM_PATTERN.exec(body);
      const offset = matrix ? null : TD_PATTERN.exec(body);
      const font = FONT_PATTERN.exec(body);
      const text = (body.match(STRING_PATTERN) ?? []).map(unescape).join('');
      if (!font || (!matrix && !offset) || !text) continue;
      blocks.push({
        ref,
        start: match.index,
        end: match.index + body.length,
        x: Number(matrix ? matrix[5] : offset![1]),
        y: Number(matrix ? matrix[6] : offset![2]),
        size: Number(font[1]),
        text,
      });
    }
  }

  const lines: TextLine[] = [];
  for (const block of blocks) {
    const line = lines.find(candidate => Math.abs(candidate.y - block.y) < 1);
    if (line) line.blocks.push(block);
    else lines.push({ y: block.y, size: 0, text: '', blocks: [block] });
  }
  for (const line of lines) {
    line.blocks.sort((a, b) => a.x - b.x);
    line.text = line.blocks.map(block => block.text).join('');
    line.size = Math.max(...line.blocks.filter(block => block.text.trim()).map(block => block.size), 0) || line.blocks[0].size;
  }

  return {
    blocks: blocks as readonly TextBlock[],
    lines: lines as readonly TextLine[],
    /** Baris pertama yang memuat penanda (sudah dinormalkan dengan normalizeTemplateText). */
    findLine(marker: string) {
      return lines.find(line => normalizeTemplateText(line.text).includes(marker)) ?? null;
    },
    /** Menghapus potongan teks dari halaman. Panggil paling banyak sekali, sebelum menulis apa pun ke halaman. */
    erase(targets: readonly TextBlock[]) {
      const located = blocks.filter(block => targets.includes(block));
      for (const [ref, source] of sources) {
        const ranges = located.filter(block => block.ref === ref).sort((a, b) => b.start - a.start);
        if (!ranges.length) continue;
        let next = source;
        for (const range of ranges) next = next.slice(0, range.start) + next.slice(range.end);
        pdf.context.assign(ref, pdf.context.flateStream(toBytes(next)));
      }
    },
  };
}

export type PageText = ReturnType<typeof openPageText>;
