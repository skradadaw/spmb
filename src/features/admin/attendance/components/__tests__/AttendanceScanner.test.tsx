import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ scan: vi.fn(), updateStatus: vi.fn() }));
vi.mock('../../actions/scanAttendanceAction', () => ({ scanAttendanceAction: mocks.scan }));
vi.mock('@/features/admin/participants/actions/updateParticipantStatusAction', () => ({ updateParticipantStatusAction: mocks.updateStatus }));

import { AttendanceScanner } from '../AttendanceScanner';

const applicant = { id: '123e4567-e89b-12d3-a456-426614174000', nomorPendaftaran: 'OB-2027-001', namaLengkap: 'Siti Aminah', status: 'Sudah OKB', jadwalTanggal: '2026-11-07', jadwalGelombang: 'Gelombang 1' };

function scanManually(nomor = 'OB-2027-001') {
  fireEvent.change(screen.getByLabelText('Nomor Pendaftaran'), { target: { value: nomor } });
  fireEvent.click(screen.getByRole('button', { name: 'Catat' }));
}

describe('AttendanceScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scan.mockResolvedValue({ outcome: 'present', message: 'Hadir tercatat.', applicant });
  });

  it('lets the admin undo a wrong scan right from the latest result', async () => {
    mocks.updateStatus.mockResolvedValue({ status: 'success', message: 'Kehadiran dibatalkan. Pendaftar kembali Terjadwal OKB.' });
    render(<AttendanceScanner />);
    scanManually();
    fireEvent.click(await screen.findByRole('button', { name: 'Batalkan' }));

    await screen.findByText('Kehadiran dibatalkan. Pendaftar kembali Terjadwal OKB.');
    // Not "Dibatalkan", which is a Status Pendaftar (see CONTEXT.md).
    expect(screen.queryByText(/^Dibatalkan/)).toBeNull();
    const formData = mocks.updateStatus.mock.calls[0][1] as FormData;
    expect(formData.get('intent')).toBe('unattend');
    expect(formData.get('participantId')).toBe(applicant.id);
    expect(screen.queryByRole('button', { name: 'Batalkan' })).toBeNull();
  });

  it('offers no undo for a rejected scan', async () => {
    mocks.scan.mockResolvedValue({ outcome: 'rejected', message: 'Sudah tercatat hadir OKB.', applicant });
    render(<AttendanceScanner />);
    scanManually();
    await screen.findByText('Sudah tercatat hadir OKB.');
    expect(screen.queryByRole('button', { name: 'Batalkan' })).toBeNull();
  });

  it('keeps the result and shows why when the undo fails', async () => {
    mocks.updateStatus.mockResolvedValue({ status: 'error', message: 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.' });
    render(<AttendanceScanner />);
    scanManually();
    fireEvent.click(await screen.findByRole('button', { name: 'Batalkan' }));

    await screen.findByText('Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.');
    expect(screen.getByText('Hadir tercatat.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Batalkan' })).toBeDefined();
  });

  it('keeps a newer scan as the latest result when an earlier undo finishes later', async () => {
    let finishUndo: (value: unknown) => void = () => {};
    mocks.updateStatus.mockReturnValue(new Promise(resolve => { finishUndo = resolve; }));
    render(<AttendanceScanner />);
    scanManually();
    fireEvent.click(await screen.findByRole('button', { name: 'Batalkan' }));

    mocks.scan.mockResolvedValue({ outcome: 'present', message: 'Hadir tercatat.', applicant: { ...applicant, id: 'other', nomorPendaftaran: 'OB-2027-002', namaLengkap: 'Budi Santoso' } });
    scanManually('OB-2027-002');
    await screen.findByText('Budi Santoso');
    finishUndo({ status: 'error', message: 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.' });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Batalkan' }).hasAttribute('disabled')).toBe(false));
    expect(screen.getAllByText('Budi Santoso').length).toBeGreaterThan(0);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('records the same applicant again when scanned after an undo', async () => {
    mocks.updateStatus.mockResolvedValue({ status: 'success', message: 'Kehadiran dibatalkan. Pendaftar kembali Terjadwal OKB.' });
    render(<AttendanceScanner />);
    scanManually();
    fireEvent.click(await screen.findByRole('button', { name: 'Batalkan' }));
    await screen.findByText('Kehadiran dibatalkan. Pendaftar kembali Terjadwal OKB.');

    scanManually();
    await waitFor(() => expect(mocks.scan).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Hadir tercatat.')).toBeDefined();
  });
});
