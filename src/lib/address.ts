/**
 * Writes addresses the way Indonesian spelling (EYD) does, whatever case the parent typed them in:
 * "jl.melati gg.mawar no 5 rt.02 rw.03" -> "Jl. Melati Gg. Mawar No. 5 RT 02/RW 03".
 * Standard abbreviations are tidied, never expanded. Display only; stored values stay as entered.
 */
import { PRESERVED_ABBREVIATIONS } from './properName';

/** Address abbreviations, written with a capital and a closing period. */
const DOTTED_ABBREVIATIONS: Record<string, string> = {
  jl: 'Jl.', jln: 'Jl.', gg: 'Gg.', no: 'No.', kp: 'Kp.', komp: 'Komp.', blk: 'Blk.',
  ds: 'Ds.', dsn: 'Dsn.', kel: 'Kel.', kec: 'Kec.', kab: 'Kab.', prov: 'Prov.', adm: 'Adm.',
};
const UPPERCASE_WORDS = new Set([...PRESERVED_ABBREVIATIONS, 'BTN', 'DIY', 'DKI', 'KPR']);
const LOWERCASE_WORDS = new Set(['dan', 'di', 'ke', 'dari']);
const ROMAN_NUMERAL = /^(?=[ivx]{2,}$)x{0,3}(ix|iv|v?i{0,3})$/;
const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase('id-ID') + word.slice(1);

export function formatAddress(value: string) {
  let wordIndex = 0;
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/[.,;:]+$/, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[\p{L}\p{N}]+\.?/gu, token => {
      const currentIndex = wordIndex++;
      const word = token.replace(/\.$/, '');
      if (DOTTED_ABBREVIATIONS[word]) return DOTTED_ABBREVIATIONS[word];
      const upper = word.toLocaleUpperCase('id-ID');
      // "rt.02" keeps no period: RT and RW are written without one.
      if (word === 'rt' || word === 'rw') return upper;
      const dot = token.endsWith('.') ? '.' : '';
      // Block and house numbers ("c2", "12a") and Roman numerals ("gg. mawar ii") are written in capitals.
      if (UPPERCASE_WORDS.has(upper) || /\p{N}/u.test(word) || ROMAN_NUMERAL.test(word)) return upper + dot;
      if (currentIndex > 0 && LOWERCASE_WORDS.has(word)) return word + dot;
      return capitalize(word) + dot;
    })
    .replace(/(?<!\p{L})(Jl|Gg|No|Kp|Komp|Blk|Ds|Dsn|Kel|Kec|Kab|Prov|Adm)\.(?=[\p{L}\p{N}])/gu, '$1. ')
    .replace(/\b(RT|RW)\s*(?=\d)/g, '$1 ')
    .replace(/\bRT (\d+)[\s,/]*RW (\d+)/g, 'RT $1/RW $2');
}

/** Region names from the region list arrive in capitals: "DKI JAKARTA" -> "DKI Jakarta", "DI YOGYAKARTA" -> "DI Yogyakarta". */
export function formatRegionName(value: string) {
  return formatAddress(value).replace(/^Di (?=\S)/, 'DI ');
}

const twoDigits = (value: string) => /^\d+$/.test(value.trim()) ? value.trim().replace(/^0+(?=\d)/, '').padStart(2, '0') : value.trim();

/** One ready-to-copy line, rebuilt from the separate address fields so region names are not repeated. */
export function formatHomeAddress(parts: { alamatJalan?: string | null; rt?: string | null; rw?: string | null; kelurahan?: string | null; kecamatan?: string | null; kota?: string | null; provinsi?: string | null }) {
  const present = (value: string | null | undefined): value is string => Boolean(value?.trim());
  const rtRw = [present(parts.rt) && `RT ${twoDigits(parts.rt)}`, present(parts.rw) && `RW ${twoDigits(parts.rw)}`].filter(Boolean).join('/');
  return [
    present(parts.alamatJalan) && formatAddress(parts.alamatJalan),
    rtRw,
    present(parts.kelurahan) && `Kel. ${formatRegionName(parts.kelurahan)}`,
    present(parts.kecamatan) && `Kec. ${formatRegionName(parts.kecamatan)}`,
    present(parts.kota) && formatRegionName(parts.kota),
    present(parts.provinsi) && formatRegionName(parts.provinsi),
  ].filter(Boolean).join(', ');
}
