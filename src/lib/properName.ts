/**
 * Writes names of people and places in title case whatever case they were typed in:
 * "ARKHA albyandra" -> "Arkha Albyandra". Display only; stored values stay as entered.
 */

export const PRESERVED_ABBREVIATIONS = new Set(['D1', 'D2', 'D3', 'D4', 'KM', 'MI', 'MTS', 'MA', 'NIK', 'NISN', 'OKB', 'PAUD', 'RW', 'RT', 'SD', 'S1', 'S2', 'S3', 'SMA', 'SMK', 'SMP', 'TK']);
const NAME_PARTICLES = new Set(['al', 'bin', 'binti', 'boru', 'da', 'de', 'del', 'della', 'di', 'du', 'la', 'van', 'von']);

export function formatProperName(value: string) {
  let wordIndex = 0;
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID').replace(/[\p{L}\p{N}]+/gu, word => {
    const currentIndex = wordIndex++;
    const upperWord = word.toLocaleUpperCase('id-ID');
    if (PRESERVED_ABBREVIATIONS.has(upperWord)) return upperWord;
    if (currentIndex > 0 && NAME_PARTICLES.has(word)) return word;
    return word.charAt(0).toLocaleUpperCase('id-ID') + word.slice(1);
  });
}
