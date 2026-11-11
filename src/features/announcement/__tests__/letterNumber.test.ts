import { describe, expect, it } from 'vitest';
import { formatNomorSurat, parseLetterNumberSettings } from '../letterNumber';

describe('nomor Surat Penerimaan', () => {
  it('puts the running number where {urut} is', () => {
    expect(formatNomorSurat('400.3.10.1/{urut}-SDS3AM/OKB/2026', 350)).toBe('400.3.10.1/350-SDS3AM/OKB/2026');
    expect(formatNomorSurat('400.3.10.1/{urut}-SDS3AM/OKB/2026', 351)).toBe('400.3.10.1/351-SDS3AM/OKB/2026');
  });

  it('accepts a format with one {urut} and a whole starting number, tidying spaces', () => {
    expect(parseLetterNumberSettings({ format: '  400.3.10.1/{urut}-SDS3AM/OKB/2026 ', nomorAwal: ' 350 ' })).toEqual({
      ok: true,
      settings: { format: '400.3.10.1/{urut}-SDS3AM/OKB/2026', nomorAwal: 350 },
    });
  });

  it('rejects a format without exactly one {urut} or with characters a letter number never has', () => {
    for (const format of ['400.3.10.1/350-SDS3AM/OKB/2026', '{urut}/{urut}', '', '400/{urut}-SDS3AM (OKB)', '400/{urut}-№']) {
      expect(parseLetterNumberSettings({ format, nomorAwal: '350' }).ok).toBe(false);
    }
    expect(parseLetterNumberSettings({ format: `${'A'.repeat(60)}{urut}`, nomorAwal: '350' }).ok).toBe(false);
  });

  it('rejects a starting number that is not a whole number from 1', () => {
    for (const nomorAwal of ['', '0', '-3', '3.5', 'abc', '1000000']) {
      expect(parseLetterNumberSettings({ format: '400/{urut}', nomorAwal })).toEqual({ ok: false, error: 'Nomor urut awal harus berupa angka bulat mulai dari 1.' });
    }
  });
});
