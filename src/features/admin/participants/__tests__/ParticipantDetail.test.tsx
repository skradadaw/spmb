import { fireEvent, render, screen } from '@testing-library/react';
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
  referral: { adaPengusul: 'Tidak' },
  okb: { jadwalTanggal: null, jadwalGelombang: null },
  decision: { kelasPenempatan: null },
  previousStatus: null,
  formValues: { namaLengkap: 'RANI PUTRI', jenisKelamin: 'Perempuan', jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Reguler', nik: '1234567890123456' },
  address: { alamatJalan: 'KP KRAJAN maracang', rt: '8', rw: '001', kelurahan: 'Mawar', kecamatan: 'Purwakarta', kota: 'Purwakarta', provinsi: 'Jawa Barat', alamatRumah: null },
  father: { nama: 'BUDI SANTOSO', nik: '123', pendidikan: 'SMA', pekerjaan: 'KARYAWAN SWASTA', penghasilan: null, telepon: '081234', alamat: null },
  mother: { nama: 'Siti', nik: '456', pendidikan: 'SMP', pekerjaan: 'Ibu rumah tangga', penghasilan: null, telepon: '085678', alamat: null },
  documentReviews: {
    aktaKelahiran: { status: 'verified', reviewedAt: '2026-10-10T01:00:00Z', reviewedBy: 'Admin' },
  },
  adminNote: null,
  nisnMismatch: false,
  documents: [
    { id: 'aktaKelahiran', title: 'Akta Kelahiran', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/aktaKelahiran.pdf' },
    { id: 'kartuKeluarga', title: 'Kartu Keluarga', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/kartuKeluarga.jpg' },
    { id: 'pasFoto', title: 'Pas Foto Anak', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/pasFoto.png' },
    { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', path: 'registrations/123e4567-e89b-12d3-a456-426614174000/buktiPembayaran.webp' },
  ],
};

describe('ParticipantDetail', () => {
  it('lets the admin mark an unverified NISN and shows it in amber with a notice', () => {
    const { unmount } = render(<ParticipantDetail participant={participant} />);
    expect(screen.queryByText(/Hubungi orang tua agar meminta NISN/)).toBeNull();
    const mark = screen.getByRole('button', { name: 'Tandai NISN tidak sesuai' });
    expect((mark.closest('form')?.querySelector('input[name="flagged"]') as HTMLInputElement).value).toBe('true');
    unmount();

    render(<ParticipantDetail participant={{ ...participant, nisnMismatch: true }} />);
    expect(screen.getByText(/Hubungi orang tua agar meminta NISN/)).toBeDefined();
    expect(document.querySelector('[data-field="nisn"]')?.getAttribute('data-warning')).toBe('true');
    expect(screen.getByText('Ditandai tidak sesuai')).toBeDefined();
    const clear = screen.getByRole('button', { name: 'NISN sudah benar' });
    expect((clear.closest('form')?.querySelector('input[name="flagged"]') as HTMLInputElement).value).toBe('false');
  });

  it('renders all student categories in one card and documents in a separate card', () => {
    render(<ParticipantDetail participant={participant} />);
    const identityHeading = screen.getByRole('heading', { name: 'Identitas anak' });
    const schoolHeading = screen.getByRole('heading', { name: 'Sekolah dan prestasi' });
    const documentsHeading = screen.getByRole('heading', { name: 'Dokumen terunggah' });
    const detailsCard = identityHeading.closest('[data-detail-group]')?.parentElement?.parentElement;
    const schoolCard = schoolHeading.closest('[data-detail-group]')?.parentElement?.parentElement;
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
    expect(documentsCard?.contains(screen.getByText('Pas Foto Anak'))).toBe(true);
    expect(documentsCard?.contains(screen.getByText('Bukti Pembayaran OKB'))).toBe(true);
    expect(documentsCard).not.toBe(detailsCard);
    expect(detailsCard?.parentElement?.className).toContain('xl:grid-cols-[minmax(0,1fr)_33rem]');
    expect(documentsCard?.parentElement?.className).toContain('xl:sticky');
    // A tall right column scrolls by itself so its lower cards are reachable without scrolling the whole page.
    // No nested scrollbar: the column sticks by its bottom edge instead of scrolling on its own.
    expect(documentsCard?.parentElement?.className).not.toContain('overflow-y-auto');
    expect(documentsCard?.parentElement?.getAttribute('style')).toContain('--aside-top');
    expect(detailsCard?.querySelector('[data-detail-groups]')?.className).not.toContain('xl:grid-cols-3');
    expect(detailsCard?.querySelector('[data-detail-group]')?.className).not.toContain('lg:grid-cols-[10rem_minmax(0,1fr)]');
    expect(detailsCard?.querySelector('[data-detail-group]')?.firstElementChild?.firstElementChild?.tagName).toBe('H3');
    expect(detailsCard?.querySelector('dl')?.className).not.toMatch(/sm:grid-cols-2|xl:grid-cols-3/);
  });

  it('renders documents in a compact responsive grid with distinct review actions', () => {
    render(<ParticipantDetail participant={participant} />);
    const documentGrid = screen.getByTestId('document-grid');
    expect(documentGrid.className).toContain('md:grid-cols-2');
    expect(documentGrid.getAttribute('data-density')).toBe('compact');
    expect(within(documentGrid).getAllByText('Lihat')).toHaveLength(4);
    expect(within(documentGrid).queryByText('Pratinjau PDF')).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Lihat berkas / })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Lihat pratinjau PDF Akta Kelahiran' })).toBeDefined();
    expect(screen.getAllByRole('button', { name: /^(Verifikasi|Terverifikasi) / })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /^Terverifikasi / })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /^Tindak lanjut / })).toBeNull();
    expect(screen.getByRole('button', { name: 'Terverifikasi Akta Kelahiran' }).getAttribute('aria-pressed')).toBe('true');
    // The verified state lives on the button; no separate badge repeats it.
    expect(screen.getByRole('button', { name: 'Terverifikasi Akta Kelahiran' }).closest('article')?.querySelector('span.inline-flex')).toBeNull();
    const aktaActions = screen.getByRole('button', { name: 'Terverifikasi Akta Kelahiran' }).closest('form');
    expect(aktaActions).not.toBeNull();
    expect(within(aktaActions as HTMLFormElement).getByRole('button', { name: 'Lihat pratinjau PDF Akta Kelahiran' })).toBeDefined();
    expect(Array.from((aktaActions as HTMLFormElement).querySelectorAll('button')).map(button => button.getAttribute('aria-label'))).toEqual([
      'Terverifikasi Akta Kelahiran',
      'Lihat pratinjau PDF Akta Kelahiran',
    ]);
    expect(screen.getAllByLabelText('Catatan admin')).toHaveLength(1);
  });

  it('colours the header status badge by status', () => {
    const { unmount } = render(<ParticipantDetail participant={{ ...participant, status: 'Terjadwal OKB' }} />);
    expect(document.querySelector('[data-status="Terjadwal OKB"]')?.className).toContain('bg-amber-50');
    unmount();
    render(<ParticipantDetail participant={{ ...participant, status: 'Ditolak' }} />);
    expect(document.querySelector('[data-status="Ditolak"]')?.className).toContain('bg-rose-50');
  });

  it('links each parent number to WhatsApp Web from the admin note', () => {
    render(<ParticipantDetail participant={{ ...participant, father: { ...participant.father, telepon: '081234567890' }, mother: { ...participant.mother, telepon: '085612345678' } }} />);
    const father = screen.getByRole('link', { name: 'Hubungi ayah lewat WhatsApp Web' });
    expect(father.getAttribute('href')).toMatch(/^https:\/\/web\.whatsapp\.com\/send\?phone=6281234567890&text=/);
    expect(father.getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('link', { name: 'Hubungi ibu lewat WhatsApp Web' }).getAttribute('href')).toContain('phone=6285612345678');
  });

  it('shows one WhatsApp button when both parents share a number and none when it is invalid', () => {
    const { unmount } = render(<ParticipantDetail participant={{ ...participant, father: { ...participant.father, telepon: '081234567890' }, mother: { ...participant.mother, telepon: '081234567890' } }} />);
    expect(screen.getAllByRole('link', { name: /lewat WhatsApp Web/ })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Hubungi orang tua lewat WhatsApp Web' })).toBeDefined();
    unmount();
    render(<ParticipantDetail participant={participant} />);
    expect(screen.queryAllByRole('link', { name: /lewat WhatsApp Web/ })).toHaveLength(0);
  });

  it('gives every document card the same structure and marks review state on the marker', () => {
    render(<ParticipantDetail participant={participant} />);
    const verified = screen.getByText('Akta Kelahiran').closest('article');
    const pending = screen.getByText('Bukti Pembayaran OKB').closest('article');
    expect(verified?.getAttribute('data-review-state')).toBe('verified');
    expect(pending?.getAttribute('data-review-state')).toBe('pending');
    expect(verified?.className).toContain('bg-white');
    expect(pending?.className).toContain('bg-white');
    expect(verified?.querySelector('[data-document-index]')?.className).toContain('bg-emerald-600');
    expect(verified?.querySelector('[data-document-index]')?.textContent).toBe('');
    expect(pending?.querySelector('[data-document-index]')?.className).toContain('border-slate-300');
    // No status badge on any card; the second line is always where the file came from.
    expect(pending?.querySelector('[data-document-source]')?.textContent).toBe('Dari pendaftaran');
    expect(verified?.querySelector('[data-document-source]')?.textContent).toBe('Dari pendaftaran');
    expect(pending?.textContent).not.toContain('Belum diperiksa');
    expect(pending?.className).toContain('h-full');
    expect(pending?.querySelector('form')?.className).toContain('mt-auto');
  });

  it('keeps both document actions inside the card with room for the verify label', () => {
    render(<ParticipantDetail participant={participant} />);
    const actions = screen.getByRole('button', { name: 'Terverifikasi Akta Kelahiran' }).closest('form');
    expect(actions?.className).toContain('grid-cols-[minmax(0,1fr)_auto]');
    expect(actions?.parentElement?.tagName).toBe('ARTICLE');
  });

  it('offers only a cancel action while documents still await verification', () => {
    render(<ParticipantDetail participant={participant} />);
    expect(screen.getByText('Verifikasi keempat berkas agar OKB dapat dijadwalkan.')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Simpan jadwal' })).toBeNull();
    // Cancelling asks for confirmation in a dialog first.
    expect(screen.queryByRole('button', { name: /ya, batalkan pendaftar/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Batalkan pendaftar' }));
    expect(screen.getByRole('alertdialog')).toBeDefined();
    expect(screen.getByRole('button', { name: /ya, batalkan pendaftar/i })).toBeDefined();
  });

  it('shows the OKB schedule with attendance and reschedule actions once scheduled', () => {
    render(<ParticipantDetail participant={{
      ...participant,
      status: 'Terjadwal OKB',
      okb: { jadwalTanggal: '2026-11-07', jadwalGelombang: 'Gelombang 2' },
    }} />);
    expect(screen.getByText('7 November 2026')).toBeDefined();
    expect(screen.getByText('Gelombang 2')).toBeDefined();
    expect(screen.getByRole('button', { name: /tandai hadir okb/i })).toBeDefined();
    // Rescheduling stays tucked away until requested, so the next step (attendance) is the obvious action.
    expect(screen.queryByText('Jadwalkan ulang OKB')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Jadwalkan ulang' }));
    expect(screen.getByText('Jadwalkan ulang OKB')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Simpan jadwal' })).toBeDefined();
    // Rescheduling starts from the current Gelombang.
    expect((document.querySelector('input[name="jadwalGelombang"]') as HTMLInputElement).value).toBe('2');
    // Step indicator: berkas and jadwal done, attendance is the current step.
    const steps = screen.getByRole('list', { name: 'Tahapan pendaftaran' });
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain('Hadir OKB');
  });

  it('schedules OKB with a date and one of three Gelombang OKB instead of a free-text session', () => {
    render(<ParticipantDetail participant={{ ...participant, status: 'Terverifikasi' }} />);
    expect(screen.getByText('Jadwalkan OKB')).toBeDefined();
    expect(screen.getByLabelText('Gelombang')).toBeDefined();
    expect(document.querySelector('input[name="jadwalGelombang"]')).not.toBeNull();
    expect(document.querySelector('input[name="jadwalSesi"]')).toBeNull();
  });

  it('offers restoring a cancelled applicant to the status it was cancelled from', () => {
    render(<ParticipantDetail participant={{ ...participant, status: 'Dibatalkan', previousStatus: 'Sudah OKB' }} />);
    expect(screen.getByRole('button', { name: /pulihkan ke sudah okb/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Batalkan pendaftar' })).toBeNull();
  });

  it('records the admission decision after OKB with the chosen class preselected as placement', () => {
    render(<ParticipantDetail participant={{ ...participant, status: 'Sudah OKB', registration: { jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Tahfizh' } }} />);
    expect(screen.getByText('Keputusan Penerimaan')).toBeDefined();
    expect((document.querySelector('input[name="kelasPenempatan"]') as HTMLInputElement).value).toBe('Tahfizh');
    expect(screen.getByLabelText('Kelas Penempatan (wajib jika Diterima)').textContent).toContain('Tahfizh (Pilihan Kelas)');
    expect(screen.getByRole('button', { name: 'Simpan keputusan' })).toBeDefined();
  });

  it('shows the placement when it differs from the chosen class', () => {
    render(<ParticipantDetail participant={{
      ...participant,
      status: 'Diterima',
      registration: { jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Tahfizh' },
      decision: { kelasPenempatan: 'Reguler' },
    }} />);
    expect(screen.getByText('(Pilihan Kelas: Tahfizh)', { exact: false })).toBeDefined();
    expect(screen.getByText('Ubah Keputusan Penerimaan')).toBeDefined();
  });

  it('turns a detail group into a prefilled edit form and back', () => {
    render(<ParticipantDetail participant={participant} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Identitas anak' }));
    expect((screen.getByLabelText('Nama lengkap') as HTMLInputElement).value).toBe('RANI PUTRI');
    expect((screen.getByLabelText('NIK') as HTMLInputElement).value).toBe('1234567890123456');
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('button', { name: 'Simpan' })).toBeNull();
  });

  it('shows the target grade field only for Pindahan', () => {
    const { unmount } = render(<ParticipantDetail participant={participant} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Pendaftaran' }));
    expect(screen.queryByLabelText('Kelas tujuan')).toBeNull();
    unmount();

    render(<ParticipantDetail participant={{ ...participant, formValues: { ...participant.formValues, jenisPendaftaran: 'Pindahan', kelasTujuan: '3' } }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Pendaftaran' }));
    expect(screen.getByLabelText('Kelas tujuan').textContent).toContain('Kelas 3');
    expect((document.querySelector('input[name="kelasTujuan"]') as HTMLInputElement).value).toBe('3');
  });

  it('offers a replacement upload on every document card', () => {
    render(<ParticipantDetail participant={{
      ...participant,
      documents: participant.documents.map((document) => document.id === 'pasFoto' ? { ...document, path: null } : document),
    }} />);
    expect(screen.getByRole('button', { name: 'Ganti Kartu Keluarga' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Unggah berkas Pas Foto Anak' })).toBeDefined();
  });

  it('places the documents card above the status panel', () => {
    render(<ParticipantDetail participant={participant} />);
    const documents = screen.getByRole('heading', { name: 'Dokumen terunggah' });
    const status = screen.getByText('Status & OKB');
    expect(documents.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
