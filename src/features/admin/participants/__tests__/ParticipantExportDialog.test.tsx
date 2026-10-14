import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParticipantExportDialog } from '../components/ParticipantExportDialog';

const counts = { 'Menunggu Verifikasi': 20, Terverifikasi: 15, 'Terjadwal OKB': 40, 'Sudah OKB': 12, Diterima: 50, Ditolak: 0, Dibatalkan: 5 };
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Ekspor Excel' }));

describe('Ekspor Data Pendaftar modal', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('defaults to every applicant and shows the total on the export button', () => {
    render(<ParticipantExportDialog counts={counts} />);
    open();
    expect(screen.getByRole('radio', { name: /Semua pendaftar/ }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('button', { name: 'Ekspor 142 pendaftar' })).toBeDefined();
    expect(screen.queryByText('Menunggu Unggahan')).toBeNull();
    expect((screen.getByRole('checkbox', { name: /Diterima/ }) as HTMLInputElement).disabled).toBe(true);
  });

  it('exports only the checked statuses, disables empty ones, and downloads the file', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Blob(['x']), { headers: { 'Content-Disposition': 'attachment; filename="data-pendaftar-2-status-2026-10-14.xlsx"' } }));
    vi.stubGlobal('fetch', fetch);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ParticipantExportDialog counts={counts} />);
    open();
    fireEvent.click(screen.getByRole('radio', { name: /Pilih status/ }));
    expect((screen.getByRole('checkbox', { name: /Ditolak/ }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /Ekspor 0 pendaftar/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Diterima/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Sudah OKB/ }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Ekspor 62 pendaftar' })));
    expect(fetch).toHaveBeenCalledWith('/admin/pendaftar/ekspor?status=Sudah+OKB&status=Diterima');
    expect(click).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the modal open with a message when the export fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    render(<ParticipantExportDialog counts={null} />);
    open();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Ekspor' })));
    expect(screen.getByRole('alert').textContent).toContain('belum dapat diekspor');
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});
