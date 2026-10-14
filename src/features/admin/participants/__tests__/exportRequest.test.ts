import { describe, expect, it } from 'vitest';
import { PARTICIPANT_EXPORT_STATUSES, parseExportStatuses, participantExportFilename, participantExportHref } from '../exportRequest';

describe('participant export request', () => {
  it('exports every registered status, never Menunggu Unggahan, when no status is given', () => {
    expect(parseExportStatuses(new URLSearchParams())).toEqual([...PARTICIPANT_EXPORT_STATUSES]);
    expect(PARTICIPANT_EXPORT_STATUSES).not.toContain('Menunggu Unggahan');
  });
  it('keeps chosen statuses in lifecycle order and rejects unknown ones', () => {
    expect(parseExportStatuses(new URLSearchParams('status=Diterima&status=Terverifikasi'))).toEqual(['Terverifikasi', 'Diterima']);
    expect(parseExportStatuses(new URLSearchParams('status=Menunggu+Unggahan'))).toBeNull();
    expect(parseExportStatuses(new URLSearchParams('status=Diterima&status=x'))).toBeNull();
  });
  it('builds links that round-trip through the parser', () => {
    expect(participantExportHref(PARTICIPANT_EXPORT_STATUSES)).toBe('/admin/pendaftar/ekspor');
    const href = participantExportHref(['Sudah OKB', 'Diterima']);
    expect(href).toBe('/admin/pendaftar/ekspor?status=Sudah+OKB&status=Diterima');
    expect(parseExportStatuses(new URL(href, 'http://x').searchParams)).toEqual(['Sudah OKB', 'Diterima']);
  });
  it('names the file after what was exported', () => {
    expect(participantExportFilename(PARTICIPANT_EXPORT_STATUSES, '2026-10-14')).toBe('data-pendaftar-semua-2026-10-14.xlsx');
    expect(participantExportFilename(['Terjadwal OKB'], '2026-10-14')).toBe('data-pendaftar-terjadwal-okb-2026-10-14.xlsx');
    expect(participantExportFilename(['Diterima', 'Ditolak', 'Dibatalkan'], '2026-10-14')).toBe('data-pendaftar-3-status-2026-10-14.xlsx');
  });
});
