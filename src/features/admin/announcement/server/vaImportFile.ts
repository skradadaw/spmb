import 'server-only';
import { inflateRawSync } from 'node:zlib';
import type { VaImportRow } from '../vaImport';

export class VaImportFileError extends Error {}

const HEADER_NOMOR = 'nomor pendaftaran';
const HEADER_VA = 'nomor va';
const normalizeHeader = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

type Cell = { value: string; numeric?: boolean };

/** Membaca CSV/XLSX berkolom "Nomor Pendaftaran" dan "Nomor VA" (judul kolom tidak membedakan huruf besar/kecil). */
export function readVaImportFile(fileName: string, bytes: Uint8Array): VaImportRow[] {
  const rows = /\.xlsx$/i.test(fileName) ? readXlsx(bytes) : /\.csv$/i.test(fileName) ? readCsv(new TextDecoder().decode(bytes)) : null;
  if (!rows) throw new VaImportFileError('File harus berformat Excel (.xlsx) atau CSV.');

  const headerIndex = rows.slice(0, 10).findIndex(row => row.some(cell => normalizeHeader(cell.value) === HEADER_NOMOR) && row.some(cell => normalizeHeader(cell.value) === HEADER_VA));
  if (headerIndex < 0) throw new VaImportFileError('Kolom "Nomor Pendaftaran" dan "Nomor VA" tidak ditemukan di file.');
  const header = rows[headerIndex].map(cell => normalizeHeader(cell.value));
  const nomorColumn = header.indexOf(HEADER_NOMOR);
  const vaColumn = header.indexOf(HEADER_VA);

  const result: VaImportRow[] = [];
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const nomor = row[nomorColumn]?.value.trim() ?? '';
    const va = row[vaColumn];
    if (!nomor && !va?.value.trim()) return;
    // Angka 16 digit di Excel kehilangan digit terakhir (presisi 15 digit) atau tampil sebagai 7.45E+15.
    const numericOverflow = Boolean(va?.numeric && (/e/i.test(va.value) || va.value.replace(/\D/g, '').length > 15));
    result.push({ line: headerIndex + offset + 2, nomorPendaftaran: nomor, nomorVa: va?.value.trim() ?? '', ...(numericOverflow ? { numericOverflow } : {}) });
  });
  if (result.length === 0) throw new VaImportFileError('File tidak berisi baris data.');
  return result;
}

/** CSV dari Excel Indonesia memakai titik koma; selain itu koma. Mendukung sel bertanda kutip. */
function readCsv(text: string): Cell[][] {
  const content = text.replace(/^﻿/, '');
  const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) { row.push({ value: cell }); cell = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[index + 1] === '\n') index += 1;
      row.push({ value: cell });
      rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) { row.push({ value: cell }); rows.push(row); }
  return rows;
}

/** Isi file di dalam arsip zip (XLSX), cukup untuk lembar kerja pertama dan sharedStrings. */
function unzip(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65_557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  }
  if (end < 0) throw new VaImportFileError('File Excel tidak dapat dibaca.');
  const entries = view.getUint16(end + 10, true);
  let pointer = view.getUint32(end + 16, true);
  const files = new Map<string, string>();
  const decoder = new TextDecoder();
  for (let entry = 0; entry < entries; entry += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) throw new VaImportFileError('File Excel tidak dapat dibaca.');
    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));
    pointer += 46 + nameLength + extraLength + commentLength;
    if (name !== 'xl/sharedStrings.xml' && !/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue;
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const data = bytes.subarray(dataStart, dataStart + compressedSize);
    if (method !== 0 && method !== 8) throw new VaImportFileError('File Excel tidak dapat dibaca.');
    files.set(name, decoder.decode(method === 8 ? inflateRawSync(data) : data));
  }
  return files;
}

const decodeXml = (value: string) => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&amp;/g, '&');
const textOf = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(match => decodeXml(match[1])).join('');
const columnIndex = (reference: string) => [...reference.replace(/\d+$/, '')].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;

function readXlsx(bytes: Uint8Array): Cell[][] {
  const files = unzip(bytes);
  const sheetName = [...files.keys()].filter(name => name.startsWith('xl/worksheets/')).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))[0];
  if (!sheetName) throw new VaImportFileError('File Excel tidak berisi lembar kerja.');
  const shared = [...(files.get('xl/sharedStrings.xml') ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(match => textOf(match[1]));

  const rows: Cell[][] = [];
  for (const rowMatch of files.get(sheetName)!.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const row: Cell[] = [];
    for (const cellMatch of (rowMatch[1] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2] ?? '';
      const reference = attributes.match(/\br="([A-Z]+\d+)"/)?.[1];
      const type = attributes.match(/\bt="(\w+)"/)?.[1];
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const cell: Cell = type === 's' ? { value: shared[Number(raw)] ?? '' }
        : type === 'inlineStr' ? { value: textOf(body) }
          : type === 'str' || type === 'b' || type === 'e' ? { value: decodeXml(raw ?? '') }
            : { value: raw ?? '', numeric: raw !== undefined };
      row[reference ? columnIndex(reference) : row.length] = cell;
    }
    rows.push(Array.from(row, cell => cell ?? { value: '' }));
  }
  return rows;
}
