import { describe, expect, it } from 'vitest';
import { isValidRuangOkb, normalizeRuangOkb, RUANG_OKB_MAX_LENGTH } from '../nameTag';

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
