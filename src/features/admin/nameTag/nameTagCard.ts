import { abbreviateName } from './nameTag';

/** 8,5 x 11 cm pada 300 dpi. */
export const NAME_TAG_WIDTH = 1004;
export const NAME_TAG_HEIGHT = 1299;

/** Desain sekolah tanpa nama dan ruangan; judul, Tahun Pelajaran, logo, Tes OKB, dan alamat sudah ada di dalam gambar. */
const TEMPLATE_SRC = '/images/name-tag/kartu-peserta.png';

const CENTER = NAME_TAG_WIDTH / 2;
const TEXT_COLOR = '#2f5f33';
const FONT_FAMILY = '"Trebuchet MS", Verdana, Arial, sans-serif';

/** Posisi mengikuti papan pada gambar desain. */
const ROOM = { baseline: 673, maxWidth: 265, largestFont: 36, smallestFont: 22 };
const NAME = { baseline: 771, maxWidth: 660, font: `bold 46px ${FONT_FAMILY}` };

type NameTagCard = {
  /** Nama lengkap apa adanya; dirapikan dan disingkat di sini agar sesuai lebar huruf kartu. */
  namaLengkap: string;
  ruangOkb: string;
  template: CanvasImageSource;
};

/** Tanpa desainnya kartu tidak dapat dibuat, jadi kegagalan memuat diteruskan ke pemanggil. Hasilnya dapat dipakai untuk banyak kartu. */
export function loadNameTagTemplate(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Desain kartu tidak dapat dimuat.'));
    image.src = TEMPLATE_SRC;
  });
}

function drawText(context: CanvasRenderingContext2D, text: string, y: number, font: string, maxWidth: number) {
  context.font = font;
  context.fillStyle = TEXT_COLOR;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  // maxWidth: teks yang tetap terlalu lebar dirapatkan, tidak keluar dari papan.
  context.fillText(text, CENTER, y, maxWidth);
}

/** Papan ruangan kecil: huruf diperkecil sampai muat, sampai batas yang masih terbaca. */
function roomFont(context: CanvasRenderingContext2D, ruangOkb: string) {
  for (let size = ROOM.largestFont; size > ROOM.smallestFont; size -= 2) {
    const font = `bold ${size}px ${FONT_FAMILY}`;
    context.font = font;
    if (context.measureText(ruangOkb).width <= ROOM.maxWidth) return font;
  }
  return `bold ${ROOM.smallestFont}px ${FONT_FAMILY}`;
}

function drawCard(context: CanvasRenderingContext2D, { namaLengkap, ruangOkb, template }: NameTagCard) {
  context.drawImage(template, 0, 0, NAME_TAG_WIDTH, NAME_TAG_HEIGHT);

  drawText(context, ruangOkb, ROOM.baseline, roomFont(context, ruangOkb), ROOM.maxWidth);

  context.font = NAME.font;
  const name = abbreviateName(namaLengkap, NAME.maxWidth, text => context.measureText(text).width);
  drawText(context, name, NAME.baseline, NAME.font, NAME.maxWidth);
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
