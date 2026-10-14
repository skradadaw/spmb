import { GState, jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { contactInfo, registrationInfo } from '@/features/home/data';
import { formatProperName } from '@/lib/properName';
import { formatSchoolName } from '@/lib/schoolName';
import type { RegistrationProof } from './contracts';

type Rgb = [number, number, number];

const SCHOOL_NAME = 'SD Plus 3 Al-Muhajirin';
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Mirrors the public site tokens in globals.css (--public-*, --class-*). */
const COLOR = {
  deep: [6, 78, 27],
  green: [0, 122, 16],
  mint: [216, 238, 219],
  tint: [234, 246, 232],
  line: [196, 227, 200],
  ink: [15, 23, 42],
  muted: [71, 85, 105],
  amber: [251, 191, 36],
  white: [255, 255, 255],
} satisfies Record<string, Rgb>;

const CLASS_COLOR: Record<string, Rgb> = {
  Bilingual: [11, 93, 91],
  Tahfizh: [63, 90, 20],
};

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Named after the child so the file is easy to recognise when sent over WhatsApp;
 * the number stays because two children can share a name.
 */
export function proofFileName(proof: RegistrationProof) {
  const name = formatProperName(proof.namaLengkap.replace(/[\\/:*?"<>|\p{Cc}]/gu, ' ')).slice(0, 80).trim();
  return name ? `Bukti Pendaftaran ${name} (${proof.nomorPendaftaran}).pdf` : `Bukti Pendaftaran (${proof.nomorPendaftaran}).pdf`;
}

/** Siswa Baru come from a TK/PAUD; Pindahan come from another SD. */
export function originSchoolLabel(proof: RegistrationProof) {
  return proof.jenisPendaftaran === 'Pindahan' ? 'Asal Sekolah' : 'Asal TK';
}

function withOpacity(doc: jsPDF, opacity: number, draw: () => void) {
  doc.setGState(new GState({ opacity }));
  draw();
  doc.setGState(new GState({ opacity: 1 }));
}

/** Small four-point sparkle, as on the homepage hero. */
function sparkle(doc: jsPDF, x: number, y: number, r: number) {
  const k = r * 0.22;
  const points = [[0, -r], [k, -k], [r, 0], [k, k], [0, r], [-k, k], [-r, 0], [-k, -k]];
  const steps = points.slice(1).map(([px, py], i) => [px - points[i][0], py - points[i][1]]);
  doc.lines(steps, x, y - r, [1, 1], 'F', true);
}

function drawHeader(doc: jsPDF, logoDataUrl: string | null) {
  doc.setFillColor(...COLOR.deep);
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F');

  withOpacity(doc, 0.35, () => {
    doc.setFillColor(...COLOR.green);
    doc.circle(PAGE_WIDTH - 18, 6, 34, 'F');
    doc.circle(PAGE_WIDTH - 70, 44, 12, 'F');
  });
  withOpacity(doc, 0.12, () => {
    doc.setFillColor(...COLOR.mint);
    doc.circle(4, 40, 12, 'F');
  });
  doc.setFillColor(...COLOR.amber);
  sparkle(doc, PAGE_WIDTH - 40, 20, 3);
  withOpacity(doc, 0.7, () => sparkle(doc, PAGE_WIDTH - 30, 34, 1.8));

  // Wave edge into the white page, like SectionWave on the site.
  doc.setFillColor(...COLOR.white);
  doc.lines([[50, 7, 110, 9, 155, 1], [25, -4, 45, -6, 57, -4], [0, 16], [-PAGE_WIDTH - 2, 0]], 0, 50, [1, 1], 'F', true);

  doc.setFillColor(...COLOR.white);
  doc.circle(MARGIN + 12, 25, 13, 'F');
  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', MARGIN + 1.5, 14.5, 21, 21);

  doc.setTextColor(...COLOR.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(SCHOOL_NAME, MARGIN + 31, 23);
  doc.setTextColor(...COLOR.mint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Open Booking Pendaftaran Tahun Pelajaran ${registrationInfo.academicYear}`, MARGIN + 31, 30);
}

function drawTitle(doc: jsPDF, y: number) {
  doc.setTextColor(...COLOR.green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PENDAFTARAN BERHASIL', MARGIN, y, { charSpace: 0.4 });
  doc.setTextColor(...COLOR.deep);
  doc.setFontSize(22);
  doc.text('BUKTI PENDAFTARAN', MARGIN, y + 10);
  doc.setFillColor(...COLOR.amber);
  doc.roundedRect(MARGIN, y + 14, 14, 1.4, 0.7, 0.7, 'F');
}

type Field = { label: string; value: string; color?: Rgb; full?: boolean };

/** Lays fields out two per row; `full` fields take the whole row. Returns the height used. */
function drawFields(doc: jsPDF, fields: Field[], x: number, y: number, width: number) {
  const gap = 8;
  const half = (width - gap) / 2;
  let rowY = y;
  let i = 0;
  while (i < fields.length) {
    const row = fields[i].full || !fields[i + 1] || fields[i + 1].full ? [fields[i]] : [fields[i], fields[i + 1]];
    let rowHeight = 0;
    row.forEach((field, column) => {
      const cellX = x + column * (half + gap);
      const cellWidth = row.length === 1 ? width : half;
      doc.setTextColor(...COLOR.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(field.label, cellX, rowY);
      doc.setTextColor(...(field.color ?? COLOR.ink));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(field.value || '-', cellWidth) as string[];
      doc.text(lines, cellX, rowY + 6.5);
      rowHeight = Math.max(rowHeight, 6.5 + lines.length * 5.2);
    });
    rowY += rowHeight + 5;
    i += row.length;
  }
  return rowY - y - 5;
}

async function drawProofCard(doc: jsPDF, proof: RegistrationProof, y: number) {
  const pad = 7;
  const qrBox = 44;
  const topHeight = qrBox + pad * 2;

  const fields: Field[] = [
    { label: 'Nama Lengkap', value: proof.namaLengkap, full: true },
    { label: 'Jenis Pendaftaran', value: proof.jenisPendaftaran },
    { label: 'Pilihan Kelas', value: proof.pilihanKelas, color: CLASS_COLOR[proof.pilihanKelas] ?? COLOR.green },
    { label: originSchoolLabel(proof), value: proof.asalSekolah ? formatSchoolName(proof.asalSekolah) : '', full: !(proof.jenisPendaftaran === 'Pindahan' && proof.kelasTujuan) },
  ];
  if (proof.jenisPendaftaran === 'Pindahan' && proof.kelasTujuan) fields.push({ label: 'Kelas Tujuan', value: `Kelas ${proof.kelasTujuan}` });

  // Measure the fields first so the card can be drawn behind them.
  const measure = new jsPDF({ unit: 'mm', format: 'a4' });
  const fieldsHeight = drawFields(measure, fields, 0, 0, CONTENT_WIDTH - pad * 2);
  const cardHeight = topHeight + pad * 2 + fieldsHeight + 4;

  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardHeight, 4, 4, 'FD');
  doc.setFillColor(...COLOR.tint);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, topHeight, 4, 4, 'F');
  doc.rect(MARGIN, y + topHeight - 4, CONTENT_WIDTH, 4, 'F');
  doc.setDrawColor(...COLOR.line);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardHeight, 4, 4, 'S');

  doc.setTextColor(...COLOR.green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('NOMOR PENDAFTARAN', MARGIN + pad, y + pad + 6, { charSpace: 0.4 });
  doc.setTextColor(...COLOR.deep);
  doc.setFontSize(28);
  doc.text(proof.nomorPendaftaran, MARGIN + pad, y + pad + 19);
  doc.setTextColor(...COLOR.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(doc.splitTextToSize('Tunjukkan kode QR ini kepada panitia untuk dipindai saat datang OKB.', 82) as string[], MARGIN + pad, y + pad + 30);

  const qrX = MARGIN + CONTENT_WIDTH - pad - qrBox;
  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.line);
  doc.roundedRect(qrX, y + pad, qrBox, qrBox, 3, 3, 'FD');
  const qr = await QRCode.toDataURL(proof.nomorPendaftaran, { errorCorrectionLevel: 'M', margin: 1, width: 512 });
  doc.addImage(qr, 'PNG', qrX + 3, y + pad + 3, qrBox - 6, qrBox - 6);

  // Ticket perforation between the number and the details.
  doc.setDrawColor(...COLOR.line);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(MARGIN + 6, y + topHeight, MARGIN + CONTENT_WIDTH - 6, y + topHeight);
  doc.setLineDashPattern([], 0);

  drawFields(doc, fields, MARGIN + pad, y + topHeight + pad + 3, CONTENT_WIDTH - pad * 2);
  return cardHeight;
}

function drawNextSteps(doc: jsPDF, y: number) {
  const steps = [
    'Jadwal OKB (Observasi Kesiapan Belajar) akan dikabarkan melalui WhatsApp setelah berkas diverifikasi.',
    'Tunjukkan bukti ini, dicetak atau dari layar HP, kepada panitia saat datang OKB untuk dipindai.',
    'Simpan bukti ini dengan baik. Hubungi panitia bila bukti hilang.',
  ];
  doc.setTextColor(...COLOR.deep);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Petunjuk', MARGIN, y);

  let stepY = y + 9;
  steps.forEach((step, index) => {
    doc.setFillColor(...COLOR.green);
    doc.circle(MARGIN + 3.5, stepY - 1.2, 3.5, 'F');
    doc.setTextColor(...COLOR.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(index + 1), MARGIN + 3.5, stepY + 0.2, { align: 'center' });
    doc.setTextColor(...COLOR.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(step, CONTENT_WIDTH - 12) as string[];
    doc.text(lines, MARGIN + 11, stepY);
    stepY += Math.max(lines.length * 5, 5) + 3;
  });
}

function drawFooter(doc: jsPDF) {
  const top = PAGE_HEIGHT - 24;
  doc.setFillColor(...COLOR.deep);
  doc.lines([[60, -6, 140, 2, PAGE_WIDTH, -4], [0, 30], [-PAGE_WIDTH, 0]], 0, top + 2, [1, 1], 'F', true);

  doc.setTextColor(...COLOR.mint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ada pertanyaan? Hubungi panitia melalui WhatsApp', MARGIN, top + 11);
  doc.setTextColor(...COLOR.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(contactInfo.whatsappLabel, MARGIN, top + 17);
  doc.setFontSize(10);
  doc.text(SCHOOL_NAME, PAGE_WIDTH - MARGIN, top + 11, { align: 'right' });
  doc.setTextColor(...COLOR.mint);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tahun Pelajaran ${registrationInfo.academicYear}`, PAGE_WIDTH - MARGIN, top + 17, { align: 'right' });
}

/** Disusun terpisah dari unduhan agar isi PDF dapat diuji tanpa browser. */
export async function buildRegistrationProofPdf(proof: RegistrationProof, logoDataUrl: string | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawHeader(doc, logoDataUrl);
  drawTitle(doc, 68);
  const cardHeight = await drawProofCard(doc, proof, 90);
  drawNextSteps(doc, 90 + cardHeight + 12);
  drawFooter(doc);
  return doc;
}

export async function downloadRegistrationProof(proof: RegistrationProof) {
  const doc = await buildRegistrationProofPdf(proof, await loadLogo());
  doc.save(proofFileName(proof));
}
