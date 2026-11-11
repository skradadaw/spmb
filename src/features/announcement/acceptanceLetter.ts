import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { format, parse, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatProperName } from '@/lib/properName';
import { formatNomorSurat } from './letterNumber';
import { normalizeTemplateText, openPageText, type TextLine } from './templateText';

/** Data yang ditulis sistem ke template Surat Penerimaan (lihat ADR 0002). */
export type AcceptanceLetterData = {
  namaLengkap: string;
  nomorVa: string;
  /** Asal TK/RA (atau sekolah asal untuk Pindahan). */
  asalSekolah: string | null;
  tempatLahir: string | null;
  /** yyyy-MM-dd */
  tanggalLahir: string | null;
  /** Nomor urut surat; kosong selama Pendaftar belum pernah diumumkan. */
  nomorUrutSurat: number | null;
};

export const TEMPLATE_PAGE_COUNT = 2;

/**
 * Teks contoh di template yang diganti sistem (ADR 0002). Template dari Microsoft Word cukup memuat
 * teks ini; sistem menghapusnya dan menulis datanya tepat di posisi itu. Ditulis tanpa spasi, huruf besar.
 */
export const TEMPLATE_MARKERS = {
  /** Baris nomor surat, misalnya "Nomor: 400.3.10.1/{urut}-SDS3AM/OKB/2026"; seluruh barisnya ditulis ulang. */
  nomorSurat: '{URUT}',
  namaAnak: '(NAMASISWA)',
  asalSekolah: '(NAMASEKOLAH)',
  /** Label "Account (VA):" tidak dihapus; Nomor VA ditulis tepat setelahnya. */
  nomorVa: '(VA)',
  /** Halaman 2: baris "Nama Lengkap" dan "Tempat, Tanggal Lahir" calon peserta didik. */
  namaPesertaDidik: 'NAMALENGKAP',
  tempatTanggalLahir: 'TEMPAT,TANGGALLAHIR',
} as const;

/**
 * Posisi cadangan untuk template yang teks contohnya dikosongkan atau tidak terbaca: milimeter dari tepi
 * kiri dan tepi atas halaman A4, diukur dari docs/templates/surat-penerimaan.pdf. y adalah garis dasar teks.
 */
export const LETTER_FIELDS = {
  /** Halaman 1: baris "Nomor: ..." di tengah, di bawah "PENGUMUMAN". */
  nomorSurat: { y: 89.8, size: 12 },
  /** Halaman 1: nama anak di tengah, di atas "Asal TK/RA:". */
  namaAnak: { y: 122.2, size: 20 },
  /** Halaman 1: nama sekolah asal di tengah, di atas "Dinyatakan:". */
  asalSekolah: { y: 139.8, size: 12 },
  /** Halaman 1: setelah label "Account (VA):" di kotak Catatan. */
  nomorVa: { x: 50.3, y: 236.5, size: 10 },
  /** Halaman 2: bagian calon peserta didik, di atas titik-titik (titik-titiknya tidak terbaca, jadi ditutup putih). */
  namaPesertaDidik: { x: 78.5, y: 84.9, width: 104, size: 10 },
  tempatTanggalLahir: { x: 78.5, y: 89.5, width: 104, size: 10 },
} as const;

/** Lebar terbesar teks rata tengah di halaman 1, dan batas bawah pengecilan huruf. */
const CENTERED_MAX_WIDTH_MM = 170;
const MIN_NAME_SIZE = 10;
const MIN_TEXT_SIZE = 7;

/** Biru seperti nama anak pada surat contoh sekolah. */
const NAME_COLOR = rgb(0.12, 0.47, 0.63);
const INK = rgb(0.06, 0.09, 0.16);
const MM = 72 / 25.4;

export class AcceptanceTemplateError extends Error {}

/** Membaca template dan memastikan bentuknya sesuai: PDF yang bisa dibuka, tepat 2 halaman. */
export async function loadAcceptanceTemplate(bytes: Uint8Array) {
  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(bytes);
  } catch {
    throw new AcceptanceTemplateError('File template bukan PDF yang dapat dibaca.');
  }
  if (pdf.getPageCount() !== TEMPLATE_PAGE_COUNT) {
    throw new AcceptanceTemplateError(`Template harus tepat ${TEMPLATE_PAGE_COUNT} halaman; file ini ${pdf.getPageCount()} halaman.`);
  }
  return pdf;
}

/** "PURWAKARTA" + "2020-03-12" menjadi "Purwakarta, 12 Maret 2020". */
export function formatTempatTanggalLahir(tempatLahir: string | null, tanggalLahir: string | null) {
  const date = tanggalLahir ? parse(tanggalLahir.slice(0, 10), 'yyyy-MM-dd', new Date()) : null;
  const tanggal = date && isValid(date) ? format(date, 'd MMMM yyyy', { locale: idLocale }) : null;
  return [tempatLahir?.trim() ? formatProperName(tempatLahir) : null, tanggal].filter(Boolean).join(', ');
}

/** Ukuran huruf terbesar (sampai batas bawah) yang membuat teks muat dalam lebar yang tersedia. */
export function fittedFontSize(font: PDFFont, text: string, maxWidthPt: number, size: number, minSize: number) {
  let fitted = size;
  while (fitted > minSize && font.widthOfTextAtSize(text, fitted) > maxWidthPt) fitted -= 0.5;
  return fitted;
}

const top = (page: PDFPage, yMm: number) => page.getHeight() - yMm * MM;
const tidy = (value: string) => value.trim().replace(/\s+/g, ' ');

/** Posisi baris: dari teks contoh di template bila ada, selain itu dari posisi cadangan. */
function linePlace(page: PDFPage, line: TextLine | null, fallback: { y: number; size: number }) {
  return line ? { y: line.y, size: line.size } : { y: top(page, fallback.y), size: fallback.size };
}

function drawCentered(page: PDFPage, font: PDFFont, text: string, place: { y: number; size: number }, minSize: number, color = INK) {
  const size = fittedFontSize(font, text, CENTERED_MAX_WIDTH_MM * MM, place.size, minSize);
  page.drawText(text, { x: page.getWidth() / 2 - font.widthOfTextAtSize(text, size) / 2, y: place.y, size, font, color });
}

/** Menutup titik-titik isian dengan putih lalu menulis nilainya di atasnya, di garis dasar labelnya bila terbaca. */
function writeOverDots(page: PDFPage, font: PDFFont, text: string, field: { x: number; y: number; width: number; size: number }, label: TextLine | null) {
  const baseline = label?.y ?? top(page, field.y);
  page.drawRectangle({ x: field.x * MM, y: baseline - 1.5 * MM, width: field.width * MM, height: 5 * MM, color: rgb(1, 1, 1) });
  page.drawText(text, { x: field.x * MM, y: baseline, size: fittedFontSize(font, text, field.width * MM, field.size, MIN_TEXT_SIZE), font, color: INK });
}

/**
 * Pembuat Surat Penerimaan: template 2 halaman + data anak menjadi PDF siap unduh.
 * Baris nomor surat hanya ditulis bila format nomor surat sudah diatur dan anak sudah punya nomor urut.
 */
export async function buildAcceptanceLetter(templateBytes: Uint8Array, data: AcceptanceLetterData, nomorSuratFormat: string | null = null): Promise<Uint8Array> {
  const pdf = await loadAcceptanceTemplate(templateBytes);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const [first, second] = pdf.getPages();

  // Teks contoh dicari dan dihapus lebih dulu; setelah itu barulah data ditulis.
  const firstText = openPageText(pdf, first);
  const numberLine = firstText.findLine(TEMPLATE_MARKERS.nomorSurat);
  const nameLine = firstText.findLine(TEMPLATE_MARKERS.namaAnak);
  const schoolLine = firstText.findLine(TEMPLATE_MARKERS.asalSekolah);
  const vaLabel = firstText.blocks.find(block => normalizeTemplateText(block.text).includes(TEMPLATE_MARKERS.nomorVa)) ?? null;
  firstText.erase([numberLine, nameLine, schoolLine].flatMap(line => line?.blocks ?? []));

  const secondText = openPageText(pdf, second);
  const birthLine = secondText.findLine(TEMPLATE_MARKERS.tempatTanggalLahir);
  // "Nama Lengkap" muncul dua kali (orang tua dan anak); milik anak adalah yang tepat di atas baris tempat/tanggal lahir.
  const childNameLine = birthLine
    ? secondText.lines
      .filter(line => line.y > birthLine.y && normalizeTemplateText(line.text).includes(TEMPLATE_MARKERS.namaPesertaDidik))
      .sort((a, b) => a.y - b.y)[0] ?? null
    : null;

  if (nomorSuratFormat && data.nomorUrutSurat !== null) {
    drawCentered(first, regular, `Nomor: ${formatNomorSurat(nomorSuratFormat, data.nomorUrutSurat)}`, linePlace(first, numberLine, LETTER_FIELDS.nomorSurat), MIN_TEXT_SIZE);
  }

  const nama = tidy(data.namaLengkap).toLocaleUpperCase('id-ID');
  drawCentered(first, bold, nama, linePlace(first, nameLine, LETTER_FIELDS.namaAnak), MIN_NAME_SIZE, NAME_COLOR);

  const sekolah = tidy(data.asalSekolah ?? '').toLocaleUpperCase('id-ID') || '-';
  drawCentered(first, bold, sekolah, linePlace(first, schoolLine, LETTER_FIELDS.asalSekolah), MIN_TEXT_SIZE);

  const va = vaLabel
    ? { x: vaLabel.x + bold.widthOfTextAtSize(`${vaLabel.text.trimEnd()} `, vaLabel.size), y: vaLabel.y, size: vaLabel.size }
    : { x: LETTER_FIELDS.nomorVa.x * MM, y: top(first, LETTER_FIELDS.nomorVa.y), size: LETTER_FIELDS.nomorVa.size };
  first.drawText(data.nomorVa, { ...va, font: bold, color: INK });

  writeOverDots(second, regular, formatProperName(nama), LETTER_FIELDS.namaPesertaDidik, childNameLine);
  writeOverDots(second, regular, formatTempatTanggalLahir(data.tempatLahir, data.tanggalLahir), LETTER_FIELDS.tempatTanggalLahir, birthLine);

  pdf.setTitle(`Surat Penerimaan ${formatProperName(nama)}`);
  return pdf.save();
}

/** Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf: mudah dicari di HP orang tua. */
export function acceptanceLetterFileName(nomorPendaftaran: string, namaLengkap: string) {
  const name = formatProperName(namaLengkap).normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return ['Surat-Penerimaan', nomorPendaftaran.replace(/[^A-Za-z0-9-]/g, ''), name].filter(Boolean).join('-') + '.pdf';
}

/** Data contoh untuk pratinjau template; nama panjang menguji pengecilan huruf. */
export const PREVIEW_SAMPLES = {
  biasa: { namaLengkap: 'SITI AMINAH', nomorVa: '7456012627300120', asalSekolah: 'TK AL-MUHAJIRIN', tempatLahir: 'PURWAKARTA', tanggalLahir: '2020-03-12', nomorUrutSurat: null },
  panjang: { namaLengkap: 'MUHAMMAD RAFFASYA AL-FATIH ABDURRAHMAN KUSUMANINGRAT WIJAYAKUSUMA', nomorVa: '7456012627300999', asalSekolah: 'RAUDHATUL ATHFAL TERPADU AL-MUHAJIRIN KAMPUS 3 CISEUREUH PURWAKARTA', tempatLahir: 'KABUPATEN PURWAKARTA', tanggalLahir: '2019-12-31', nomorUrutSurat: null },
} satisfies Record<string, AcceptanceLetterData>;
export type PreviewSample = keyof typeof PREVIEW_SAMPLES;
