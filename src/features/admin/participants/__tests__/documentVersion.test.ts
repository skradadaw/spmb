import { describe, expect, it } from 'vitest';
import { documentFetchHref, documentReplacedAt, documentVersion } from '../documentVersion';

describe('document version', () => {
  it('uses the Berkas Pengganti timestamp so a replaced file gets a new cache key', () => {
    expect(documentVersion('registrations/x/pasFoto.jpg')).toBe('o');
    expect(documentVersion('registrations/x/pasFoto-r1760400000000.jpg')).toBe('1760400000000');
    expect(documentReplacedAt('registrations/x/pasFoto.jpg')).toBeNull();
    expect(documentReplacedAt('registrations/x/pasFoto-r1760400000000.jpg')).toBe(new Date(1760400000000).toISOString());
  });

  it('downloads PDFs through the binary preview variant so download managers ignore them', () => {
    expect(documentFetchHref('/admin/pendaftar/a/dokumen/aktaKelahiran?contentType=application%2Fpdf&v=o')).toBe('/admin/pendaftar/a/dokumen/aktaKelahiran?contentType=application%2Fpdf&v=o&preview=pdfjs');
    expect(documentFetchHref('/admin/pendaftar/a/dokumen/pasFoto?contentType=image%2Fjpeg&v=o')).toBe('/admin/pendaftar/a/dokumen/pasFoto?contentType=image%2Fjpeg&v=o');
  });
});
