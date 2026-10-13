import { describe, expect, it } from 'vitest';
import { documentReplacedAt, documentVersion } from '../documentVersion';

describe('document version', () => {
  it('uses the Berkas Pengganti timestamp so a replaced file gets a new cache key', () => {
    expect(documentVersion('registrations/x/pasFoto.jpg')).toBe('o');
    expect(documentVersion('registrations/x/pasFoto-r1760400000000.jpg')).toBe('1760400000000');
    expect(documentReplacedAt('registrations/x/pasFoto.jpg')).toBeNull();
    expect(documentReplacedAt('registrations/x/pasFoto-r1760400000000.jpg')).toBe(new Date(1760400000000).toISOString());
  });
});
