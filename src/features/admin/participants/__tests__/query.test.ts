import { describe, expect, it } from 'vitest';
import { parseParticipantListQuery, participantListHref, escapeSearch, hasActiveFilters, paginationPages } from '../query';

describe('participant query', () => {
  it('normalizes invalid pages and allowlists filters', () => {
    expect(parseParticipantListQuery(new URLSearchParams('page=-2&kelas=invalid&jenis=invalid'))).toEqual({ search: '', classFilter: null, statusFilter: null, attentionFilter: null, okbMissed: false, waveFilter: null, announcementFilter: null, paymentFilter: null, page: 1, pageSize: 20 });
    expect(parseParticipantListQuery(new URLSearchParams('page=2.5')).page).toBe(1);
  });
  it('allowlists the Perlu Perhatian filter and keeps it in links', () => {
    const query = parseParticipantListQuery(new URLSearchParams('perhatian=nisn'));
    expect(query.attentionFilter).toBe('nisn');
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?perhatian=nisn&page=2');
    expect(parseParticipantListQuery(new URLSearchParams('perhatian=__all__')).attentionFilter).toBeNull();
  });
  it('allowlists the Pengumuman filter, keeps it in links and counts it as active', () => {
    const query = parseParticipantListQuery(new URLSearchParams('pengumuman=belum&status=Diterima'));
    expect(query.announcementFilter).toBe('belum');
    expect(participantListHref(query)).toBe('/admin/pendaftar?status=Diterima&pengumuman=belum');
    expect(hasActiveFilters(parseParticipantListQuery(new URLSearchParams('pengumuman=sudah')))).toBe(true);
    expect(parseParticipantListQuery(new URLSearchParams('pengumuman=kemarin')).announcementFilter).toBeNull();
  });

  it('allowlists the Pembayaran filter, keeps it in links and counts it as active', () => {
    const query = parseParticipantListQuery(new URLSearchParams('bayar=cash'));
    expect(query.paymentFilter).toBe('cash');
    expect(participantListHref(query)).toBe('/admin/pendaftar?bayar=cash');
    expect(hasActiveFilters(query)).toBe(true);
    expect(parseParticipantListQuery(new URLSearchParams('bayar=kartu')).paymentFilter).toBeNull();
  });

  it('allowlists the Gelombang OKB filter and keeps it in links', () => {
    const query = parseParticipantListQuery(new URLSearchParams('gelombang=2&kelas=Reguler'));
    expect(query.waveFilter).toBe(2);
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?kelas=Reguler&gelombang=2&page=2');
    for (const value of ['0', '4', 'satu', '']) expect(parseParticipantListQuery(new URLSearchParams({ gelombang: value })).waveFilter).toBeNull();
  });
  it('bounds searches and escapes wildcard input', () => {
    expect(parseParticipantListQuery(new URLSearchParams({ q: ' x'.repeat(200) })).search.length).toBe(100);
    expect(escapeSearch('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });
  it('builds internal links preserving filters', () => {
    const query = parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler&page=3'));
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?q=Ani&kelas=Reguler&page=2');
  });
  it('accepts Pindahan as a class and only the offered page sizes', () => {
    expect(parseParticipantListQuery(new URLSearchParams('kelas=Pindahan')).classFilter).toBe('Pindahan');
    expect(parseParticipantListQuery(new URLSearchParams('per=37')).pageSize).toBe(20);
    const query = parseParticipantListQuery(new URLSearchParams('per=50&kelas=Tahfizh'));
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?kelas=Tahfizh&per=50&page=2');
    expect(participantListHref({ ...query, pageSize: 20 })).toBe('/admin/pendaftar?kelas=Tahfizh');
  });
  it('keeps the link-only Tidak hadir OKB filter in links', () => {
    const query = parseParticipantListQuery(new URLSearchParams('okb=terlewat'));
    expect(query.okbMissed).toBe(true);
    expect(participantListHref(query, 2)).toBe('/admin/pendaftar?okb=terlewat&page=2');
    expect(parseParticipantListQuery(new URLSearchParams('okb=lain')).okbMissed).toBe(false);
  });
  it('lists page numbers with gaps around the current page', () => {
    expect(paginationPages(1, 1)).toEqual([1]);
    expect(paginationPages(1, 5)).toEqual([1, 2, null, 5]);
    expect(paginationPages(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
    expect(paginationPages(4, 12)).toEqual([1, 2, 3, 4, 5, null, 12]);
    expect(paginationPages(12, 12)).toEqual([1, null, 11, 12]);
  });
  it('ignores status values that are not in the supported list', () => {
    expect(parseParticipantListQuery(new URLSearchParams('status=Unknown'))).toMatchObject({ statusFilter: null });
    expect(parseParticipantListQuery(new URLSearchParams('status=Menunggu+Verifikasi'))).toMatchObject({ statusFilter: 'Menunggu Verifikasi' });
  });
});
