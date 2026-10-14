/**
 * Writes a school name the way Indonesian spelling (EYD) does, whatever case the
 * parent typed it in: "tk islam terpadu al - muhajirin." -> "TK Islam Terpadu Al-Muhajirin".
 * Display only; the stored value is left as entered.
 */

/** Kinds of schools and foundations that are always written in capitals. */
const SCHOOL_ABBREVIATIONS = new Set([
  'ABA', 'BA', 'IT', 'KB', 'KBIT', 'MI', 'MIN', 'MIS', 'NU', 'PAUD', 'PAUDIT', 'PG', 'PGRI', 'RA', 'SD', 'SDIT', 'SDN', 'SDS',
  'SPS', 'TK', 'TKA', 'TKIT', 'TKN', 'TKQ', 'TPA', 'TPQ', 'YPI',
]);
/** Conjunctions and prepositions stay lowercase inside a name. */
const LOWERCASE_WORDS = new Set(['dan', 'di', 'ke', 'dari', 'untuk', 'yang']);
const ROMAN_NUMERAL = /^(?=[ivx]+$)x{0,3}(ix|iv|v?i{0,3})$/;
const VOWEL = /[aiueo]/;

export function formatSchoolName(value: string) {
  const normalized = value
    .trim()
    .replace(/\b(tk|paud|sd|ra|kb|mi)\.(?=\S)/gi, '$1 ') // "TK.Melati" -> "TK Melati"
    .replace(/\s*-\s*/g, '-') // "Al - Muhajirin" -> "Al-Muhajirin"
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/, '')
    .toLocaleLowerCase('id-ID');

  let wordIndex = 0;
  return normalized.replace(/[\p{L}\p{N}]+/gu, word => {
    const currentIndex = wordIndex++;
    const upper = word.toLocaleUpperCase('id-ID');
    if (SCHOOL_ABBREVIATIONS.has(upper) || ROMAN_NUMERAL.test(word)) return upper;
    // Letter runs without vowels are abbreviations too ("pkk", "sdn").
    if (word.length > 1 && /^\p{L}+$/u.test(word) && !VOWEL.test(word)) return upper;
    if (currentIndex > 0 && LOWERCASE_WORDS.has(word)) return word;
    return word.charAt(0).toLocaleUpperCase('id-ID') + word.slice(1);
  });
}
