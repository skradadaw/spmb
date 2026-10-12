import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const wilayah = vi.hoisted(() => ({
  fetchRegencies: vi.fn(),
  fetchDistricts: vi.fn(),
  fetchVillages: vi.fn(),
}));

vi.mock('@/hooks/useWilayahIndonesia', () => ({
  useWilayahIndonesia: () => ({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
    loading: { provinces: false, regencies: false, districts: false, villages: false },
    ...wilayah,
  }),
}));

vi.mock('@/features/registration/actions', () => ({
  prepareRegistrationAction: vi.fn(),
  finalizeRegistrationAction: vi.fn(),
  cancelRegistrationAction: vi.fn(),
}));

vi.mock('@/features/registration/signedUploadClient', () => ({
  uploadSignedDocuments: vi.fn(),
}));

import RegistrationForm from '@/features/registration/components/RegistrationForm';

describe('RegistrationForm validation feedback', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('removes a required-field warning as soon as the field becomes valid', async () => {
    render(<RegistrationForm />);

    fireEvent.click(screen.getByRole('button', { name: /selanjutnya/i }));
    expect(await screen.findByText('Nama lengkap wajib diisi')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Nama Lengkap *'), {
      target: { value: 'Dani Ramdani' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Nama lengkap wajib diisi')).toBeNull();
    });
  });

  it('removes the date warning after a valid calendar date is selected', async () => {
    render(<RegistrationForm />);

    fireEvent.click(screen.getByRole('button', { name: /selanjutnya/i }));
    expect(await screen.findByText('Tanggal lahir tidak valid')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /pilih tanggal lahir/i }));
    const day = await screen.findByText('11', { selector: 'button' });
    fireEvent.click(day);

    await waitFor(() => {
      expect(screen.queryByText('Tanggal lahir tidak valid')).toBeNull();
    });
  });

  it('renders referral section and confirmation statement', () => {
    render(<RegistrationForm />);
    expect(screen.getByText('Pengusul / Rujukan Murid')).toBeDefined();
    expect(screen.getByText(/Apakah pendaftaran murid ini berdasarkan pengusulan\/rujukan/i)).toBeDefined();
  });

  it('renders unified Direktorat 2 question for parent or sibling affiliation', () => {
    render(<RegistrationForm />);
    expect(screen.getByText(/Apakah mempunyai orang tua yang bekerja atau saudara yang bersekolah di Direktorat 2 Al-Muhajirin\?/i)).toBeDefined();
  });
});
