import { describe, expect, it } from 'vitest';
import { parseParticipantListQuery, participantListHref, escapeSearch } from '../query';

describe('participant query', () => {
  it('normalizes invalid pages and allowlists filters', () => {
    expect(parseParticipantListQuery(new URLSearchParams('page=-2&kelas=invalid&jenis=invalid'))).toEqual({ search: '', classFilter: null, typeFilter: null, statusFilter: null, attentionFilter: null, page: 1 });
    expect(parseParticipantListQuery(new URLSearchParams('page=2.5')).page).toBe(1);
  });
  it('allowlists the Perlu Perhatian filter and keeps it in links', () => {
    const query = parseParticipantListQuery(new URLSearchParams('perhatian=nisn'));
    expect(query.attentionFilter).toBe('nisn');
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?perhatian=nisn&page=2');
    expect(parseParticipantListQuery(new URLSearchParams('perhatian=__all__')).attentionFilter).toBeNull();
  });
  it('bounds searches and escapes wildcard input', () => {
    expect(parseParticipantListQuery(new URLSearchParams({ q: ' x'.repeat(200) })).search.length).toBe(100);
    expect(escapeSearch('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });
  it('builds internal links preserving filters', () => {
    const query = parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler&page=3'));
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?q=Ani&kelas=Reguler&page=2');
  });
  it('ignores status values that are not in the supported list', () => {
    expect(parseParticipantListQuery(new URLSearchParams('status=Unknown'))).toMatchObject({ statusFilter: null });
    expect(parseParticipantListQuery(new URLSearchParams('status=Menunggu+Verifikasi'))).toMatchObject({ statusFilter: 'Menunggu Verifikasi' });
  });
});
