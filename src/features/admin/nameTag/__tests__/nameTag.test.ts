import { describe, expect, it } from 'vitest';
import { abbreviateName, isValidRuangOkb, nameTagFileName, nameTagPrintState, normalizeRuangOkb, RUANG_OKB_MAX_LENGTH } from '../nameTag';

/** One unit per character, so the max width is the longest string that fits. */
const byLength = (text: string) => text.length;

describe('abbreviateName', () => {
  const full = 'Muhammad Abdurrahman Al-Fatih Ramadhan';

  it.each([
    [38, 'Muhammad Abdurrahman Al-Fatih Ramadhan'],
    [37, 'Muhammad Abdurrahman Al-Fatih R.'],
    [32, 'Muhammad Abdurrahman Al-Fatih R.'],
    [31, 'Muhammad Abdurrahman A.R.'],
    [25, 'Muhammad Abdurrahman A.R.'],
    [24, 'Muhammad A.A.R.'],
    [15, 'Muhammad A.A.R.'],
    [14, 'M.A.A.R.'],
  ])('shortens from the last word and stops as soon as it fits (width %i)', (width, expected) => {
    expect(abbreviateName(full, width, byLength)).toBe(expected);
  });

  it('returns every initial when even that does not fit', () => {
    expect(abbreviateName(full, 3, byLength)).toBe('M.A.A.R.');
  });

  it('leaves a short name unchanged', () => {
    expect(abbreviateName('Aisyah Putri', 40, byLength)).toBe('Aisyah Putri');
  });

  it('tidies the case first, whatever the parent typed', () => {
    expect(abbreviateName('  MUHAMMAD   abdurrahman AL-FATIH ramadhan ', 38, byLength)).toBe(full);
    expect(abbreviateName('AISYAH PUTRI', 40, byLength)).toBe('Aisyah Putri');
  });

  it('counts a hyphenated word as one word with one capital initial', () => {
    expect(abbreviateName('Siti AL-ZAHRA Nur-Aini', 16, byLength)).toBe('Siti Al-Zahra N.');
    expect(abbreviateName('Siti AL-ZAHRA Nur-Aini', 9, byLength)).toBe('Siti A.N.');
    expect(abbreviateName('Siti AL-ZAHRA Nur-Aini', 8, byLength)).toBe('S.A.N.');
  });

  it('keeps bin and binti whole and does not count them as a word', () => {
    expect(abbreviateName('Ahmad Fauzi bin Yusuf', 21, byLength)).toBe('Ahmad Fauzi bin Yusuf');
    expect(abbreviateName('Ahmad Fauzi bin Yusuf', 20, byLength)).toBe('Ahmad Fauzi bin Y.');
    expect(abbreviateName('Ahmad Fauzi bin Yusuf', 16, byLength)).toBe('Ahmad F. bin Y.');
    expect(abbreviateName('Ahmad Fauzi bin Yusuf', 3, byLength)).toBe('A.F. bin Y.');
    expect(abbreviateName('AISYAH RAHMA BINTI YUSUF HAKIM', 15, byLength)).toBe('A.R. binti Y.H.');
  });

  it('writes a word already typed as an initial without doubling its dot', () => {
    expect(abbreviateName('M. Fatih Ramadhan', 10, byLength)).toBe('M. F.R.');
    expect(abbreviateName('M. Fatih Ramadhan', 6, byLength)).toBe('M.F.R.');
  });

  it('measures with the function it is given', () => {
    expect(abbreviateName('Aisyah Putri', 100, text => text.length * 10)).toBe('Aisyah P.');
  });
});

describe('nameTagPrintState', () => {
  it.each(['Terjadwal OKB', 'Sudah OKB'])('is ready for %s with a Ruang OKB', (status) => {
    expect(nameTagPrintState(status, 'Ruang A')).toBe('ready');
  });

  it.each([null, '', '   '])('asks for a Ruang OKB when it is %j', (ruangOkb) => {
    expect(nameTagPrintState('Terjadwal OKB', ruangOkb)).toBe('needs-ruang');
    expect(nameTagPrintState('Sudah OKB', ruangOkb)).toBe('needs-ruang');
  });

  it.each(['Menunggu Unggahan', 'Menunggu Verifikasi', 'Terverifikasi', 'Diterima', 'Ditolak', 'Dibatalkan'])('is unavailable for %s, even with a Ruang OKB', (status) => {
    expect(nameTagPrintState(status, 'Ruang A')).toBe('unavailable');
  });
});

describe('nameTagFileName', () => {
  it('joins the Ruang OKB and the full, unabbreviated name', () => {
    expect(nameTagFileName('Ruang A', 'Muhammad Abdurrahman Al-Fatih Ramadhan')).toBe('Ruang A - Muhammad Abdurrahman Al-Fatih Ramadhan.png');
  });

  it('tidies the name as it appears on the card', () => {
    expect(nameTagFileName('Ruang A', 'AISYAH   putri')).toBe('Ruang A - Aisyah Putri.png');
    expect(nameTagFileName('Ruang A', 'MUHAMMAD AL-FATIH')).toBe('Ruang A - Muhammad Al-Fatih.png');
  });

  it('removes characters a file name cannot hold', () => {
    expect(nameTagFileName('Lab/1: "Atas"', 'Aisyah\\Putri*?<>|\u0007')).toBe('Lab 1 Atas - Aisyah Putri.png');
  });

  it('cannot climb out of a folder', () => {
    expect(nameTagFileName('../../Ruang', 'Aisyah')).toBe('.. .. Ruang - Aisyah.png');
  });

  it('still names the file when a part is empty after cleaning', () => {
    expect(nameTagFileName('Ruang A', '///')).toBe('Ruang A.png');
    expect(nameTagFileName('***', 'Aisyah')).toBe('Aisyah.png');
    expect(nameTagFileName('', '')).toBe('Name Tag.png');
  });

  it('keeps a very long name to a safe length', () => {
    const fileName = nameTagFileName('Ruang A', 'a'.repeat(200));
    expect(fileName.length).toBeLessThanOrEqual(100);
    expect(fileName.endsWith('.png')).toBe(true);
  });
});

describe('Ruang OKB name rules', () => {
  it('trims the ends and collapses repeated whitespace', () => {
    expect(normalizeRuangOkb('  Ruang   A\t 1\n')).toBe('Ruang A 1');
  });

  it('turns a whitespace-only name into an empty value', () => {
    expect(normalizeRuangOkb('   ')).toBe('');
  });

  it('keeps the letter case the admin typed', () => {
    expect(normalizeRuangOkb('LAB Komputer')).toBe('LAB Komputer');
  });

  it('allows at most 30 characters', () => {
    expect(RUANG_OKB_MAX_LENGTH).toBe(30);
    expect(isValidRuangOkb('x'.repeat(30))).toBe(true);
    expect(isValidRuangOkb('x'.repeat(31))).toBe(false);
  });
});
