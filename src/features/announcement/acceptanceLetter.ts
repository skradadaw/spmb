import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { format, parse, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatProperName } from '@/lib/properName';

/** Data yang ditulis sistem ke template Surat Penerimaan (lihat ADR 0002). */
export type AcceptanceLetterData = {
  namaLengkap: string;
  nomorVa: string;
  tempatLahir: string | null;
  /** yyyy-MM-dd */
  tanggalLahir: string | null;
};

export const TEMPLATE_PAGE_COUNT = 2;

/**
 * Posisi isian dalam milimeter dari tepi kiri dan tepi atas halaman A4, diukur dari
 * docs/templates/surat-penerimaan.pdf. Bila sekolah mengganti tata letak template,
 * cukup ukur ulang angka di sini (ADR 0002). y adalah garis dasar teks.
 */
export const LETTER_FIELDS = {
  /** Halaman 1: nama anak di tengah, di atas "Dinyatakan:". */
  namaAnak: { page: 0, centerX: 105, y: 121, maxWidth: 170, size: 20, minSize: 10 },
  /** Halaman 1: setelah label "Account (VA):" di kotak Catatan. */
  nomorVa: { page: 0, x: 46.7, y: 218, size: 9 },
  /** Halaman 2: bagian calon peserta didik, di atas titik-titik. */
  namaPesertaDidik: { page: 1, x: 75, y: 85, width: 115, size: 10 },
  tempatTanggalLahir: { page: 1, x: 75, y: 90, width: 115, size: 10 },
} as const;

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

function top(page: PDFPage, yMm: number) {
  return page.getHeight() - yMm * MM;
}

/** Menutup titik-titik isian dengan putih lalu menulis nilainya di atasnya. */
function writeOverDots(page: PDFPage, font: PDFFont, text: string, field: { x: number; y: number; width: number; size: number }) {
  const baseline = top(page, field.y);
  page.drawRectangle({ x: field.x * MM, y: baseline - 1.5 * MM, width: field.width * MM, height: 5 * MM, color: rgb(1, 1, 1) });
  page.drawText(text, { x: field.x * MM, y: baseline, size: fittedFontSize(font, text, field.width * MM, field.size, 7), font, color: INK });
}

/** Pembuat Surat Penerimaan: template 2 halaman + data anak menjadi PDF siap unduh. */
export async function buildAcceptanceLetter(templateBytes: Uint8Array, data: AcceptanceLetterData): Promise<Uint8Array> {
  const pdf = await loadAcceptanceTemplate(templateBytes);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  const nama = data.namaLengkap.trim().replace(/\s+/g, ' ').toLocaleUpperCase('id-ID');
  const nameField = LETTER_FIELDS.namaAnak;
  const namePage = pages[nameField.page];
  const nameSize = fittedFontSize(bold, nama, nameField.maxWidth * MM, nameField.size, nameField.minSize);
  namePage.drawText(nama, {
    x: nameField.centerX * MM - bold.widthOfTextAtSize(nama, nameSize) / 2,
    y: top(namePage, nameField.y),
    size: nameSize,
    font: bold,
    color: NAME_COLOR,
  });

  const vaField = LETTER_FIELDS.nomorVa;
  const vaPage = pages[vaField.page];
  vaPage.drawText(data.nomorVa, { x: vaField.x * MM, y: top(vaPage, vaField.y), size: vaField.size, font: bold, color: INK });

  const statementPage = pages[LETTER_FIELDS.namaPesertaDidik.page];
  writeOverDots(statementPage, regular, formatProperName(nama), LETTER_FIELDS.namaPesertaDidik);
  writeOverDots(statementPage, regular, formatTempatTanggalLahir(data.tempatLahir, data.tanggalLahir), LETTER_FIELDS.tempatTanggalLahir);

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
  biasa: { namaLengkap: 'SITI AMINAH', nomorVa: '7456012627300120', tempatLahir: 'PURWAKARTA', tanggalLahir: '2020-03-12' },
  panjang: { namaLengkap: 'MUHAMMAD RAFFASYA AL-FATIH ABDURRAHMAN KUSUMANINGRAT WIJAYAKUSUMA', nomorVa: '7456012627300999', tempatLahir: 'KABUPATEN PURWAKARTA', tanggalLahir: '2019-12-31' },
} satisfies Record<string, AcceptanceLetterData>;
export type PreviewSample = keyof typeof PREVIEW_SAMPLES;
