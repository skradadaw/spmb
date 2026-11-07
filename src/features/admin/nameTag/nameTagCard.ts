import { contactInfo, registrationInfo } from '@/features/home/data';
import { abbreviateName } from './nameTag';

/** 8,5 x 11 cm pada 300 dpi. */
export const NAME_TAG_WIDTH = 1004;
export const NAME_TAG_HEIGHT = 1299;

const SCHOOL_NAME = 'SD Plus 3 Al-Muhajirin';
const ACADEMIC_YEAR = `T.A ${registrationInfo.academicYear.replace('/', '-')}`;
const ADDRESS = contactInfo.address.toUpperCase();

/** Ruang kosong di tepi agar isi tidak terpotong saat ukurannya disesuaikan di Word. */
const EDGE = 48;
const CARD_WIDTH = NAME_TAG_WIDTH - EDGE * 2;
const CARD_HEIGHT = NAME_TAG_HEIGHT - EDGE * 2;
const CARD_BOTTOM = EDGE + CARD_HEIGHT;
const CARD_RIGHT = EDGE + CARD_WIDTH;
const CENTER = NAME_TAG_WIDTH / 2;
const TEXT_WIDTH = CARD_WIDTH - 40;

const PANEL = { x: 272, y: 384, width: 460, height: 426 };
const LOGO_LARGE = { centerY: 556, size: 300 };
const LOGO_SMALL = { x: 72, y: 66, size: 72 };
const PLATE = { x: 88, y: 796, width: 828, height: 110 };
const NAME_WIDTH = PLATE.width - 48;

/** Sekitar 1,3 cm, cukup untuk satu stiker bintang kecil dari panitia. */
const STICKER_BOX = 150;
const STICKER_TOP = 1000;
const FOOTER_TOP = 1198;

/** Huruf bawaan sistem yang ramah anak; ukurannya mengikuti huruf yang tersedia di perangkat admin. */
const FONT_FAMILY = '"Comic Sans MS", "Chalkboard SE", "Trebuchet MS", Arial, sans-serif';
const NAME_FONT = `bold 50px ${FONT_FAMILY}`;

const COLOR = {
  forest: '#2b5c45',
  forestDark: '#1f4533',
  outline: '#17352a',
  yellow: '#f7c948',
  red: '#d92d20',
  paper: '#fbf8ef',
  white: '#ffffff',
  ink: '#1e293b',
  trunk: '#cda996',
  trunkDark: '#b98f7b',
  sage: '#bcd398',
  sageLight: '#d3e4b4',
  moss: '#9dbf7d',
  teal: '#8fb3a5',
  tealLight: '#adcabe',
  ground: '#d5e5b0',
  fern: '#6f9f63',
  fernDark: '#4f8152',
};

type Draw = CanvasRenderingContext2D;
type Animal = (context: Draw, x: number, y: number) => void;

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

function drawText(context: Draw, text: string, y: number, font: string, color: string, x = CENTER, maxWidth = TEXT_WIDTH, align: CanvasTextAlign = 'center') {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = 'alphabetic';
  // maxWidth: ruangan 30 karakter berhuruf lebar dirapatkan, tidak terpotong.
  context.fillText(text, x, y, maxWidth);
}

function fillCircle(context: Draw, x: number, y: number, radius: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function fillEllipse(context: Draw, x: number, y: number, radiusX: number, radiusY: number, color: string, rotation = 0) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  context.fill();
}

function fillRounded(context: Draw, x: number, y: number, width: number, height: number, radius: number, color: string, outline?: { color: string; width: number }) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
  if (outline) {
    context.strokeStyle = outline.color;
    context.lineWidth = outline.width;
    context.stroke();
  }
}

/** Mahkota pohon dari beberapa lingkaran, dengan bintik daun yang lebih terang. */
function drawCanopy(context: Draw, blobs: readonly (readonly [number, number, number])[], color: string, dotColor: string) {
  blobs.forEach(([x, y, radius]) => fillCircle(context, x, y, radius, color));
  blobs.forEach(([x, y, radius]) => {
    fillCircle(context, x - radius * 0.35, y - radius * 0.25, radius * 0.16, dotColor);
    fillCircle(context, x + radius * 0.3, y + radius * 0.2, radius * 0.11, dotColor);
    fillCircle(context, x + radius * 0.05, y - radius * 0.5, radius * 0.08, dotColor);
  });
}

function drawTrunk(context: Draw, baseX: number, topX: number, topY: number, width: number) {
  context.fillStyle = COLOR.trunk;
  context.beginPath();
  context.moveTo(baseX - width, FOOTER_TOP);
  context.quadraticCurveTo(baseX - width * 0.5, (FOOTER_TOP + topY) / 2, topX - width * 0.35, topY);
  context.lineTo(topX + width * 0.35, topY);
  context.quadraticCurveTo(baseX + width * 0.5, (FOOTER_TOP + topY) / 2, baseX + width, FOOTER_TOP);
  context.closePath();
  context.fill();
}

function drawBranch(context: Draw, fromX: number, fromY: number, toX: number, toY: number, width: number) {
  context.strokeStyle = COLOR.trunk;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.quadraticCurveTo((fromX + toX) / 2, fromY - 10, toX, toY);
  context.stroke();
}

function drawFern(context: Draw, x: number, y: number, height: number, lean: number, color: string) {
  context.strokeStyle = color;
  context.lineCap = 'round';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(x, y);
  context.quadraticCurveTo(x + lean * 0.3, y - height * 0.6, x + lean, y - height);
  context.stroke();
  for (let step = 1; step <= 5; step++) {
    const t = step / 6;
    const stemX = x + lean * t * t;
    const stemY = y - height * t;
    const size = 26 * (1.15 - t);
    fillEllipse(context, stemX - size * 0.7, stemY - 2, size, size * 0.34, color, 0.5);
    fillEllipse(context, stemX + size * 0.7, stemY - 2, size, size * 0.34, color, -0.5);
  }
}

function drawBird(context: Draw, x: number, y: number, facing: 1 | -1, body: string, wing: string, belly: string) {
  context.save();
  context.translate(x, y);
  context.scale(facing, 1);

  context.fillStyle = wing;
  context.beginPath();
  context.moveTo(-34, 6);
  context.lineTo(-88, -6);
  context.lineTo(-78, 12);
  context.lineTo(-92, 24);
  context.lineTo(-30, 22);
  context.closePath();
  context.fill();

  fillEllipse(context, 0, 6, 44, 28, body, -0.15);
  fillEllipse(context, 10, 16, 26, 14, belly, -0.1);
  fillCircle(context, 36, -14, 22, body);

  context.fillStyle = COLOR.yellow;
  context.beginPath();
  context.moveTo(54, -20);
  context.lineTo(78, -11);
  context.lineTo(54, -3);
  context.closePath();
  context.fill();

  fillCircle(context, 41, -19, 7, COLOR.white);
  fillCircle(context, 43, -19, 3.5, COLOR.outline);

  context.fillStyle = wing;
  context.beginPath();
  context.moveTo(14, -6);
  context.quadraticCurveTo(-16, -62, -58, -60);
  context.quadraticCurveTo(-44, -26, -22, 8);
  context.closePath();
  context.fill();

  context.restore();
}

/** Latar hutan. Isi kartu digambar di atasnya, dan tidak ada yang digambar di dalam kotak stiker. */
function drawForest(context: Draw) {
  context.fillStyle = COLOR.paper;
  context.fillRect(EDGE, EDGE, CARD_WIDTH, CARD_HEIGHT);

  // Bukit di bawah kotak stiker.
  context.fillStyle = COLOR.ground;
  context.beginPath();
  context.moveTo(EDGE, 1030);
  context.quadraticCurveTo(EDGE + CARD_WIDTH / 4, 980, CENTER, 1024);
  context.quadraticCurveTo(EDGE + (CARD_WIDTH * 3) / 4, 1066, CARD_RIGHT, 1002);
  context.lineTo(CARD_RIGHT, CARD_BOTTOM);
  context.lineTo(EDGE, CARD_BOTTOM);
  context.closePath();
  context.fill();

  drawTrunk(context, 92, 118, 200, 42);
  drawBranch(context, 110, 560, 240, 470, 18);
  drawBranch(context, 104, 760, 214, 700, 14);
  drawTrunk(context, 912, 886, 200, 42);
  drawBranch(context, 894, 500, 770, 430, 18);
  drawBranch(context, 900, 780, 800, 716, 14);

  drawCanopy(context, [[70, 72, 86], [188, 44, 78], [306, 30, 66], [58, 214, 74]], COLOR.sage, COLOR.sageLight);
  drawCanopy(context, [[938, 80, 92], [812, 44, 80], [692, 28, 64], [950, 232, 72]], COLOR.moss, COLOR.sage);
  drawCanopy(context, [[92, 660, 84], [190, 712, 62], [62, 770, 58]], COLOR.sage, COLOR.sageLight);
  drawCanopy(context, [[918, 590, 80], [828, 640, 58], [944, 690, 56]], COLOR.teal, COLOR.tealLight);
  drawCanopy(context, [[226, 462, 36], [778, 424, 36]], COLOR.moss, COLOR.sage);

  drawBird(context, 806, 330, -1, COLOR.red, '#a61b12', '#fde2c8');
  drawBird(context, 158, 590, 1, '#2f7fd1', '#1d5ca3', '#dff0fb');
}

function drawForestFloor(context: Draw) {
  ([
    // Di sela label Tes OKB, agar tulisannya tetap terbaca.
    [64, 1198, 120, -14, COLOR.fern], [100, 1198, 84, 6, COLOR.fernDark],
    [338, 1198, 96, -14, COLOR.fern], [376, 1198, 68, 8, COLOR.fernDark],
    [628, 1198, 96, 14, COLOR.fern], [668, 1198, 68, -8, COLOR.fernDark],
    [894, 1198, 84, -6, COLOR.fernDark], [940, 1198, 120, 14, COLOR.fern],
  ] as const).forEach(([x, y, height, lean, color]) => drawFern(context, x, y, height, lean, color));
}

function drawEyes(context: Draw, x: number, y: number, gap: number) {
  fillCircle(context, x - gap, y, 7, COLOR.outline);
  fillCircle(context, x + gap, y, 7, COLOR.outline);
  fillCircle(context, x - gap + 2, y - 2, 2.2, COLOR.white);
  fillCircle(context, x + gap + 2, y - 2, 2.2, COLOR.white);
}

const drawLion: Animal = (context, x, y) => {
  for (let tuft = 0; tuft < 14; tuft++) {
    const angle = (tuft * Math.PI * 2) / 14;
    fillCircle(context, x + Math.cos(angle) * 50, y + Math.sin(angle) * 50, 17, '#d98a2b');
  }
  fillCircle(context, x - 32, y - 36, 13, '#eeb35c');
  fillCircle(context, x + 32, y - 36, 13, '#eeb35c');
  fillCircle(context, x, y, 45, '#f3c67a');
  drawEyes(context, x, y - 6, 18);
};

const drawPanda: Animal = (context, x, y) => {
  fillCircle(context, x - 40, y - 38, 20, COLOR.outline);
  fillCircle(context, x + 40, y - 38, 20, COLOR.outline);
  fillCircle(context, x, y, 56, COLOR.white);
  context.strokeStyle = '#cbd5d1';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x, y, 56, 0, Math.PI * 2);
  context.stroke();
  fillEllipse(context, x - 21, y - 6, 15, 18, COLOR.outline, 0.4);
  fillEllipse(context, x + 21, y - 6, 15, 18, COLOR.outline, -0.4);
  fillCircle(context, x - 21, y - 7, 5, COLOR.white);
  fillCircle(context, x + 21, y - 7, 5, COLOR.white);
};

function drawAntler(context: Draw, x: number, y: number, side: 1 | -1) {
  context.strokeStyle = '#8a6242';
  context.lineWidth = 6;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x, y);
  context.quadraticCurveTo(x + side * 20, y - 14, x + side * 46, y - 26);
  context.moveTo(x + side * 16, y - 8);
  context.lineTo(x + side * 20, y - 30);
  context.moveTo(x + side * 32, y - 18);
  context.lineTo(x + side * 42, y - 38);
  context.stroke();
}

const drawDeer: Animal = (context, x, y) => {
  drawAntler(context, x - 24, y - 36, -1);
  drawAntler(context, x + 24, y - 36, 1);
  fillEllipse(context, x - 54, y - 10, 22, 10, '#c98f5e', 0.35);
  fillEllipse(context, x + 54, y - 10, 22, 10, '#c98f5e', -0.35);
  fillEllipse(context, x, y, 44, 50, '#dba873');
  fillCircle(context, x - 14, y - 34, 4, '#f6e3c8');
  fillCircle(context, x + 12, y - 38, 3.5, '#f6e3c8');
  drawEyes(context, x, y - 8, 20);
};

/** Tiap Tes OKB punya satu hewan yang mengintip dari balik kotak; kotaknya polos agar tidak terlihat sudah terisi. */
const STICKER_COLUMNS: readonly { label: string; x: number; animal: Animal }[] = [
  { label: 'Literasi', x: CENTER - 280, animal: drawLion },
  { label: 'Numerasi', x: CENTER, animal: drawPanda },
  { label: 'Tahsin', x: CENTER + 280, animal: drawDeer },
];

function drawAnimals(context: Draw) {
  STICKER_COLUMNS.forEach(({ x, animal }) => animal(context, x, STICKER_TOP - 40));
}

function drawStickerBoxes(context: Draw) {
  STICKER_COLUMNS.forEach(({ label, x }) => {
    fillRounded(context, x - STICKER_BOX / 2, STICKER_TOP, STICKER_BOX, STICKER_BOX, 18, COLOR.white, { color: COLOR.outline, width: 6 });
    drawText(context, label, 1186, `bold 34px ${FONT_FAMILY}`, COLOR.outline, x, 260);
  });
}

function drawHeader(context: Draw, logo: CanvasImageSource | null) {
  if (logo) context.drawImage(logo, LOGO_SMALL.x, LOGO_SMALL.y, LOGO_SMALL.size, LOGO_SMALL.size);
  drawText(context, SCHOOL_NAME, 112, `bold 30px ${FONT_FAMILY}`, COLOR.outline, LOGO_SMALL.x + LOGO_SMALL.size + 12, 480, 'left');

  fillRounded(context, CENTER - 280, 130, 560, 92, 30, COLOR.yellow);
  drawText(context, 'KARTU PESERTA', 197, `bold 64px ${FONT_FAMILY}`, COLOR.forest, CENTER, 520);
  drawText(context, 'OBSERVASI KESIAPAN', 272, `bold 46px ${FONT_FAMILY}`, COLOR.forest, CENTER, 640);
  drawText(context, 'BELAJAR (OKB)', 326, `bold 46px ${FONT_FAMILY}`, COLOR.forest, CENTER, 480);
  drawText(context, ACADEMIC_YEAR, 370, `bold 32px ${FONT_FAMILY}`, COLOR.forest, CENTER, 480);
}

function drawLogoPanel(context: Draw, logo: CanvasImageSource | null) {
  context.beginPath();
  context.roundRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 64);
  context.fillStyle = COLOR.forest;
  context.fill();
  fillCircle(context, CENTER, LOGO_LARGE.centerY, LOGO_LARGE.size / 2 + 10, COLOR.white);
  if (logo) context.drawImage(logo, CENTER - LOGO_LARGE.size / 2, LOGO_LARGE.centerY - LOGO_LARGE.size / 2, LOGO_LARGE.size, LOGO_LARGE.size);
}

function drawNamePlate(context: Draw, namaLengkap: string, ruangOkb: string) {
  fillRounded(context, PLATE.x, PLATE.y, PLATE.width, PLATE.height, 44, COLOR.yellow, { color: COLOR.outline, width: 5 });

  drawText(context, 'Ruang OKB', 742, `bold 28px ${FONT_FAMILY}`, COLOR.white, CENTER, PANEL.width - 40);
  const roomFont = `bold 42px ${FONT_FAMILY}`;
  context.font = roomFont;
  const roomWidth = Math.min(Math.max(context.measureText(ruangOkb).width + 72, 260), PLATE.width - 80);
  fillRounded(context, CENTER - roomWidth / 2, 752, roomWidth, 64, 22, COLOR.red, { color: COLOR.outline, width: 5 });
  drawText(context, ruangOkb, 798, roomFont, COLOR.white, CENTER, roomWidth - 40);

  context.font = NAME_FONT;
  const name = abbreviateName(namaLengkap, NAME_WIDTH, text => context.measureText(text).width);
  drawText(context, name, 878, NAME_FONT, COLOR.forestDark, CENTER, NAME_WIDTH);
}

function drawFooter(context: Draw) {
  context.fillStyle = COLOR.forest;
  context.fillRect(EDGE, FOOTER_TOP, CARD_WIDTH, CARD_BOTTOM - FOOTER_TOP);
  drawText(context, ADDRESS, 1232, `bold 22px ${FONT_FAMILY}`, COLOR.white, CENTER, CARD_WIDTH - 72);
}

function drawCard(context: Draw, { namaLengkap, ruangOkb, logo }: NameTagCard) {
  context.fillStyle = COLOR.white;
  context.fillRect(0, 0, NAME_TAG_WIDTH, NAME_TAG_HEIGHT);

  context.save();
  context.beginPath();
  context.roundRect(EDGE, EDGE, CARD_WIDTH, CARD_HEIGHT, 48);
  context.clip();
  drawForest(context);
  drawAnimals(context);
  drawForestFloor(context);
  drawHeader(context, logo);
  drawLogoPanel(context, logo);
  drawNamePlate(context, namaLengkap, ruangOkb);
  drawStickerBoxes(context);
  drawFooter(context);
  context.restore();

  context.beginPath();
  context.roundRect(EDGE, EDGE, CARD_WIDTH, CARD_HEIGHT, 48);
  context.strokeStyle = COLOR.forest;
  context.lineWidth = 8;
  context.stroke();
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
