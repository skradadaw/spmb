import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { within } from '@testing-library/react';
import { ParticipantDetail } from '../components/ParticipantDetail';
import type { ParticipantDetail as ParticipantDetailData } from '../contracts';

const participant: ParticipantDetailData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  createdAt: '2026-10-10T00:00:00Z',
  updatedAt: null,
  status: 'Menunggu Verifikasi',
  identity: { namaLengkap: 'RANI PUTRI', jenisKelamin: 'Perempuan', tempatLahir: 'PURWAKARTA', tanggalLahir: '2021-02-22', nik: '1234567890123456', nisn: '1234567890' },
  registration: { jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Reguler' },
  school: { asalSekolah: 'TK PLUS ROUDHOH PURWAKARTA', prestasiAnak: 'JUARA 3 LOMBA FASHION SHOW', tingkatPrestasi: null, jarakKeSekolah: '5' },
  affiliation: { bekerjaDiDirektorat2: null },
  address: { alamatJalan: 'KP KRAJAN maracang', rt: '8', rw: '001', kelurahan: 'Mawar', kecamatan: 'Purwakarta', kota: 'Purwakarta', provinsi: 'Jawa Barat', alamatRumah: null },
  father: { nama: 'BUDI SANTOSO', nik: '123', pendidikan: 'SMA', pekerjaan: 'KARYAWAN SWASTA', penghasilan: null, telepon: '081234', alamat: null },
  mother: { nama: 'Siti', nik: '456', pendidikan: 'SMP', pekerjaan: 'Ibu rumah tangga', penghasilan: null, telepon: '085678', alamat: null },
  documentReviews: {
    aktaKelahiran: { status: 'verified', reviewedAt: '2026-10-10T01:00:00Z', reviewedBy: 'Admin' },
    kartuKeluarga: { status: 'follow_up', reviewedAt: '2026-10-10T02:00:00Z', reviewedBy: 'Admin' },
  },
  adminNote: null,
  documents: [
    { id: 'aktaKelahiran', title: 'Akta Kelahiran', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/aktaKelahiran.pdf' },
    { id: 'kartuKeluarga', title: 'Kartu Keluarga', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/kartuKeluarga.jpg' },
    { id: 'pasFoto', title: 'Pas Foto Anak (Terbaru)', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/pasFoto.png' },
    { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/buktiPembayaran.webp' },
  ],
};

describe('ParticipantDetail', () => {
  it('renders all student categories in one card and documents in a separate card', () => {
    render(<ParticipantDetail participant={participant} />);
    const identityHeading = screen.getByRole('heading', { name: 'Identitas anak' });
    const schoolHeading = screen.getByRole('heading', { name: 'Sekolah dan prestasi' });
    const documentsHeading = screen.getByRole('heading', { name: 'Dokumen terunggah' });
    const detailsCard = identityHeading.parentElement?.parentElement?.parentElement;
    const schoolCard = schoolHeading.parentElement?.parentElement?.parentElement;
    const documentsCard = documentsHeading.parentElement?.parentElement?.parentElement?.parentElement;
    expect(detailsCard).toBe(schoolCard);
    expect(detailsCard?.querySelector('[data-detail-group]')?.className).toContain('border-slate-200/70');
    expect(detailsCard?.querySelector('dl')?.className).toContain('rounded-xl');
    expect(detailsCard?.querySelector('dl')?.className).toContain('border-slate-200/80');
    expect(detailsCard?.querySelector('dl')?.className).toContain('divide-slate-100');
    expect(screen.getAllByText('Rani Putri').some((element) => detailsCard?.contains(element))).toBe(true);
    expect(screen.getAllByText('Purwakarta')).toHaveLength(3);
    expect(screen.getByText('TK Plus Roudhoh Purwakarta')).toBeDefined();
    expect(screen.getByText('Juara 3 lomba fashion show')).toBeDefined();
    expect(screen.getByText('Kp Krajan Maracang')).toBeDefined();
    expect(screen.getByText('Karyawan swasta')).toBeDefined();
    expect(participant.identity.namaLengkap).toBe('RANI PUTRI');
    expect(screen.getByText('Nama ayah')).toBeDefined();
    expect(screen.getByText('NIK ayah')).toBeDefined();
    expect(screen.getByText('22 Februari 2021')).toBeDefined();
    expect(screen.getByText('5 KM')).toBeDefined();
    expect(screen.getByText('08')).toBeDefined();
    expect(within(detailsCard as HTMLElement).getByText('01')).toBeDefined();
    const parentAddresses = screen.getAllByText('Alamat').map((label) => label.parentElement);
    expect(parentAddresses).toHaveLength(2);
    expect(parentAddresses.every((address) => address?.className.includes('col-span-full'))).toBe(true);
    expect(screen.queryByText('Provinsi')).toBeNull();
    expect(screen.queryByText('Alamat rumah')).toBeNull();
    expect(documentsCard?.contains(screen.getByText('Akta Kelahiran'))).toBe(true);
    expect(documentsCard?.contains(screen.getByText('Kartu Keluarga'))).toBe(true);
    expect(documentsCard?.contains(screen.getByText('Pas Foto Anak (Terbaru)'))).toBe(true);
    expect(documentsCard?.contains(screen.getByText('Bukti Pembayaran OKB'))).toBe(true);
    expect(documentsCard).not.toBe(detailsCard);
    expect(detailsCard?.parentElement?.className).toContain('xl:grid-cols-[minmax(0,1fr)_33rem]');
    expect(documentsCard?.className).toContain('xl:sticky');
    expect(detailsCard?.querySelector('[data-detail-groups]')?.className).not.toContain('xl:grid-cols-3');
    expect(detailsCard?.querySelector('[data-detail-group]')?.className).not.toContain('lg:grid-cols-[10rem_minmax(0,1fr)]');
    expect(detailsCard?.querySelector('[data-detail-group]')?.firstElementChild?.tagName).toBe('H3');
    expect(detailsCard?.querySelector('dl')?.className).not.toMatch(/sm:grid-cols-2|xl:grid-cols-3/);
  });

  it('renders documents in a compact responsive grid with distinct review actions', () => {
    render(<ParticipantDetail participant={participant} />);
    const documentGrid = screen.getByTestId('document-grid');
    expect(documentGrid.className).toContain('md:grid-cols-2');
    expect(documentGrid.getAttribute('data-density')).toBe('compact');
    expect(within(documentGrid).getAllByText('Lihat berkas')).toHaveLength(4);
    expect(within(documentGrid).queryByText('Pratinjau PDF')).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Lihat berkas / })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Lihat pratinjau PDF Akta Kelahiran' })).toBeDefined();
    expect(screen.getAllByRole('button', { name: /^Verifikasi / })).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /^Tindak lanjut / })).toBeNull();
    expect(screen.getByRole('button', { name: 'Verifikasi Akta Kelahiran' }).getAttribute('aria-pressed')).toBe('true');
    const aktaActions = screen.getByRole('button', { name: 'Verifikasi Akta Kelahiran' }).closest('form');
    expect(aktaActions).not.toBeNull();
    expect(within(aktaActions as HTMLFormElement).getByRole('button', { name: 'Lihat pratinjau PDF Akta Kelahiran' })).toBeDefined();
    expect(Array.from((aktaActions as HTMLFormElement).querySelectorAll('button')).map(button => button.getAttribute('aria-label'))).toEqual([
      'Verifikasi Akta Kelahiran',
      'Lihat pratinjau PDF Akta Kelahiran',
    ]);
    expect(screen.getAllByLabelText('Catatan admin')).toHaveLength(1);
  });

  it('uses clearly different surfaces for verified and pending documents', () => {
    render(<ParticipantDetail participant={participant} />);
    const verified = screen.getByText('Akta Kelahiran').closest('article');
    const pending = screen.getByText('Bukti Pembayaran OKB').closest('article');
    expect(verified?.getAttribute('data-review-state')).toBe('verified');
    expect(verified?.className).toContain('bg-emerald-100');
    expect(pending?.getAttribute('data-review-state')).toBe('pending');
    expect(pending?.className).toContain('bg-blue-50');
  });
});
