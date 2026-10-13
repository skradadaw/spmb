import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { registrationInfo } from '@/features/home/data';
import type { RegistrationProof } from './contracts';

const SCHOOL_NAME = 'SD Plus 3 Al-Muhajirin';
const BRAND_GREEN: [number, number, number] = [0, 122, 16];
const PAGE_WIDTH = 210;
const MARGIN = 20;

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

export function proofFileName(proof: RegistrationProof) {
  return `Bukti-Pendaftaran-${proof.nomorPendaftaran}.pdf`;
}

/** Disusun terpisah dari unduhan agar isi PDF dapat diuji tanpa browser. */
export async function buildRegistrationProofPdf(proof: RegistrationProof, logoDataUrl: string | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const center = PAGE_WIDTH / 2;

  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', MARGIN, 16, 22, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, MARGIN + 28, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Open Booking Pendaftaran Tahun Pelajaran ${registrationInfo.academicYear}`, MARGIN + 28, 32);
  doc.setDrawColor(...BRAND_GREEN);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 44, PAGE_WIDTH - MARGIN, 44);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BUKTI PENDAFTARAN', center, 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text('Nomor Pendaftaran', center, 72, { align: 'center' });
  doc.setTextColor(...BRAND_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(proof.nomorPendaftaran, center, 84, { align: 'center' });
  doc.setTextColor(0);

  const qr = await QRCode.toDataURL(proof.nomorPendaftaran, { errorCorrectionLevel: 'M', margin: 1, width: 512 });
  doc.addImage(qr, 'PNG', center - 30, 92, 60, 60);

  const rows: Array<[string, string]> = [
    ['Nama Lengkap', proof.namaLengkap],
    ['Jenis Pendaftaran', proof.jenisPendaftaran],
    ['Pilihan Kelas', proof.pilihanKelas],
  ];
  if (proof.jenisPendaftaran === 'Pindahan' && proof.kelasTujuan) rows.push(['Kelas Tujuan', `Kelas ${proof.kelasTujuan}`]);

  let y = 168;
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text(label, MARGIN + 4, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(value, 100) as string[], MARGIN + 60, y);
    doc.line(MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4);
    y += 12;
  }

  y += 8;
  const notes = [
    'Jadwal OKB (Observasi Kesiapan Belajar) akan dikabarkan melalui WhatsApp setelah berkas diverifikasi.',
    'Tunjukkan bukti ini, dicetak atau dari layar HP, kepada panitia saat datang OKB untuk dipindai.',
    'Simpan bukti ini dengan baik. Hubungi panitia bila bukti hilang.',
  ];
  doc.setFillColor(243, 250, 244);
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 40, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Petunjuk', MARGIN + 6, y + 8);
  doc.setFont('helvetica', 'normal');
  let noteY = y + 15;
  for (const note of notes) {
    const lines = doc.splitTextToSize(`• ${note}`, PAGE_WIDTH - MARGIN * 2 - 12) as string[];
    doc.text(lines, MARGIN + 6, noteY);
    noteY += lines.length * 5;
  }

  return doc;
}

export async function downloadRegistrationProof(proof: RegistrationProof) {
  const doc = await buildRegistrationProofPdf(proof, await loadLogo());
  doc.save(proofFileName(proof));
}
