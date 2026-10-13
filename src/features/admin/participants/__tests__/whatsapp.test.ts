import { describe, expect, it } from 'vitest';
import { toWhatsAppNumber, whatsAppWebHref } from '../whatsapp';

describe('WhatsApp links', () => {
  it('normalises Indonesian numbers to the 62 prefix', () => {
    expect(toWhatsAppNumber('081234567890')).toBe('6281234567890');
    expect(toWhatsAppNumber('+62 812-3456-7890')).toBe('6281234567890');
    expect(toWhatsAppNumber('6281234567890')).toBe('6281234567890');
    expect(toWhatsAppNumber('81234567890')).toBe('6281234567890');
  });

  it('rejects empty or malformed numbers', () => {
    expect(toWhatsAppNumber(null)).toBeNull();
    expect(toWhatsAppNumber('')).toBeNull();
    expect(toWhatsAppNumber('12345')).toBeNull();
  });

  it('builds a WhatsApp Web link with an optional message', () => {
    expect(whatsAppWebHref('081234567890')).toBe('https://web.whatsapp.com/send?phone=6281234567890');
    expect(whatsAppWebHref('081234567890', 'Halo Bapak/Ibu')).toBe('https://web.whatsapp.com/send?phone=6281234567890&text=Halo%20Bapak%2FIbu');
    expect(whatsAppWebHref('')).toBeNull();
  });
});
