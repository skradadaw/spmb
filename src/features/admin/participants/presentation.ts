import type { ParticipantFieldGroupName } from './fields';

const PRESERVED_ABBREVIATIONS = new Set(['D1', 'D2', 'D3', 'D4', 'KM', 'MI', 'MTS', 'MA', 'NIK', 'NISN', 'OKB', 'PAUD', 'RW', 'RT', 'SD', 'S1', 'S2', 'S3', 'SMA', 'SMK', 'SMP', 'TK']);
const NAME_PARTICLES = new Set(['al', 'bin', 'binti', 'boru', 'da', 'de', 'del', 'della', 'di', 'du', 'la', 'van', 'von']);
const PROPER_NAME_FIELDS: Partial<Record<ParticipantFieldGroupName, Set<string>>> = {
  identity: new Set(['namaLengkap', 'tempatLahir']),
  school: new Set(['asalSekolah', 'tingkatPrestasi']),
  affiliation: new Set(['namaOrangtuaDirektorat2', 'unitOrangtuaDirektorat2', 'namaSaudaraDirektorat2', 'unitSaudaraDirektorat2']),
  address: new Set(['alamatJalan', 'kelurahan', 'kecamatan', 'kota']),
  father: new Set(['nama', 'alamat']),
  mother: new Set(['nama', 'alamat']),
  referral: new Set(['namaTkPengusul', 'namaPengusul']),
};
const SENTENCE_CASE_FIELDS: Partial<Record<ParticipantFieldGroupName, Set<string>>> = {
  school: new Set(['prestasiAnak']),
  affiliation: new Set(['profesiDiDirektorat2']),
  father: new Set(['pendidikan', 'pekerjaan', 'penghasilan']),
  mother: new Set(['pendidikan', 'pekerjaan', 'penghasilan']),
};

function titleCase(value: string) {
  let wordIndex = 0;
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID').replace(/[\p{L}\p{N}]+/gu, word => {
    const currentIndex = wordIndex++;
    const upperWord = word.toLocaleUpperCase('id-ID');
    if (PRESERVED_ABBREVIATIONS.has(upperWord)) return upperWord;
    if (currentIndex > 0 && NAME_PARTICLES.has(word)) return word;
    return word.charAt(0).toLocaleUpperCase('id-ID') + word.slice(1);
  });
}

function sentenceCase(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
  const sentence = normalized.replace(/^[\p{L}]/u, character => character.toLocaleUpperCase('id-ID'));
  return sentence.replace(/[\p{L}\p{N}]+/gu, word => PRESERVED_ABBREVIATIONS.has(word.toLocaleUpperCase('id-ID')) ? word.toLocaleUpperCase('id-ID') : word);
}

export function formatParticipantFieldValue(name: ParticipantFieldGroupName, key: string, value: string | null) {
  if (!value) return 'Belum diisi';

  if (PROPER_NAME_FIELDS[name]?.has(key)) return titleCase(value);
  if (SENTENCE_CASE_FIELDS[name]?.has(key)) return sentenceCase(value);

  if (name === 'identity' && key === 'tanggalLahir') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return value;
    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return value;
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  }

  if (name === 'school' && key === 'jarakKeSekolah') {
    const match = /^(\d+(?:[.,]\d+)?)\s*(?:km)?$/i.exec(value.trim());
    if (match) return `${match[1]} KM`;
  }

  if (name === 'address' && (key === 'rt' || key === 'rw') && /^\d+$/.test(value.trim())) {
    return value.trim().replace(/^0+(?=\d)/, '').padStart(2, '0');
  }

  return value;
}
