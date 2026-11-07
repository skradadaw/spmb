import { abbreviateName } from './nameTag';

/** 8,5 x 11 cm pada 300 dpi. */
export const NAME_TAG_WIDTH = 1004;
export const NAME_TAG_HEIGHT = 1299;

const SCHOOL_NAME = 'SD Plus 3 Al-Muhajirin';
const TES_OKB = ['Literasi', 'Numerasi', 'Tahsin'];

/** Ruang kosong di tepi agar isi tidak terpotong saat ukurannya disesuaikan di Word. */
const EDGE = 48;
const CARD_WIDTH = NAME_TAG_WIDTH - EDGE * 2;
const CARD_HEIGHT = NAME_TAG_HEIGHT - EDGE * 2;
const CENTER = NAME_TAG_WIDTH / 2;
const TEXT_WIDTH = CARD_WIDTH - 40;

const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const NAME_FONT = `bold 58px ${FONT_FAMILY}`;

/** Sama dengan warna Bukti Pendaftaran (--public-*). */
const COLOR = {
  deep: '#064e1b',
  green: '#007a10',
  tint: '#eaf6e8',
  line: '#c4e3c8',
  ink: '#0f172a',
  muted: '#475569',
  amber: '#fbbf24',
  white: '#ffffff',
};

type NameTagCard = {
  /** Nama lengkap apa adanya; dirapikan dan disingkat di sini agar sesuai lebar huruf kartu. */
  namaLengkap: string;
  ruangOkb: string;
  logo: CanvasImageSource | null;
};

/** Logo yang gagal dimuat tidak menggagalkan kartu. Hasilnya dapat dipakai untuk banyak kartu. */
export function loadNameTagLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = '/logo.png';
  });
}

function drawText(context: CanvasRenderingContext2D, text: string, y: number, font: string, color: string, x = CENTER) {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  // maxWidth: ruangan 30 karakter berhuruf lebar dirapatkan, tidak terpotong.
  context.fillText(text, x, y, TEXT_WIDTH);
}

function drawCard(context: CanvasRenderingContext2D, { namaLengkap, ruangOkb, logo }: NameTagCard) {
  context.fillStyle = COLOR.white;
  context.fillRect(0, 0, NAME_TAG_WIDTH, NAME_TAG_HEIGHT);

  // Kepala kartu mengikuti garis tepi yang membulat.
  context.save();
  context.beginPath();
  context.roundRect(EDGE, EDGE, CARD_WIDTH, CARD_HEIGHT, 36);
  context.clip();
  context.fillStyle = COLOR.deep;
  context.fillRect(EDGE, EDGE, CARD_WIDTH, 340);
  context.restore();

  context.beginPath();
  context.roundRect(EDGE, EDGE, CARD_WIDTH, CARD_HEIGHT, 36);
  context.strokeStyle = COLOR.deep;
  context.lineWidth = 6;
  context.stroke();

  context.fillStyle = COLOR.white;
  context.beginPath();
  context.arc(CENTER, 178, 98, 0, Math.PI * 2);
  context.fill();
  if (logo) context.drawImage(logo, CENTER - 80, 98, 160, 160);
  drawText(context, SCHOOL_NAME, 346, `bold 48px ${FONT_FAMILY}`, COLOR.white);

  context.font = NAME_FONT;
  const name = abbreviateName(namaLengkap, TEXT_WIDTH, text => context.measureText(text).width);
  drawText(context, name, 530, NAME_FONT, COLOR.ink);

  context.fillStyle = COLOR.amber;
  context.beginPath();
  context.roundRect(CENTER - 60, 572, 120, 10, 5);
  context.fill();

  drawText(context, 'Ruang OKB', 670, `bold 32px ${FONT_FAMILY}`, COLOR.muted);
  drawText(context, ruangOkb, 742, `bold 56px ${FONT_FAMILY}`, COLOR.green);

  const box = 220;
  const inset = 48;
  const gap = (CARD_WIDTH - inset * 2 - box * TES_OKB.length) / (TES_OKB.length - 1);
  TES_OKB.forEach((label, index) => {
    const x = EDGE + inset + index * (box + gap);
    context.beginPath();
    context.roundRect(x, 870, box, box, 20);
    context.fillStyle = COLOR.white;
    context.fill();
    context.strokeStyle = COLOR.deep;
    context.lineWidth = 8;
    context.stroke();
    drawText(context, label, 1158, `bold 40px ${FONT_FAMILY}`, COLOR.ink, x + box / 2);
  });
}

/** Satu kartu sebagai PNG. Hanya berjalan di browser. */
export function createNameTagPng(card: NameTagCard): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = NAME_TAG_WIDTH;
  canvas.height = NAME_TAG_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Canvas tidak tersedia.'));

  drawCard(context, card);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('PNG gagal dibuat.'))), 'image/png');
  });
}
