import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResultCheckState, ResultView } from '../contracts';

const action = vi.hoisted(() => vi.fn());
vi.mock('../actions', () => ({ checkResultAction: action }));

import { ResultCheck } from '../components/ResultCheck';

const applicant = { namaLengkap: 'SITI AMINAH', nomorPendaftaran: 'OB-2027-001' };

async function submitAndShow(view: ResultView) {
  action.mockImplementation(async (): Promise<ResultCheckState> => ({ view, nomorPendaftaran: 'OB-2027-001', tanggalLahir: '2020-03-12' }));
  render(<ResultCheck />);
  fireEvent.change(screen.getByLabelText('Nomor Pendaftaran'), { target: { value: 'OB-2027-001' } });
  fireEvent.change(screen.getByLabelText('Tanggal lahir anak'), { target: { value: '2020-03-12' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Cek Hasil' }).closest('form')!);
}

describe('Cek Hasil OKB page', () => {
  beforeEach(() => action.mockReset());

  it('asks only for the Nomor Pendaftaran and the child\'s birth date', () => {
    render(<ResultCheck />);
    expect(screen.getByLabelText('Nomor Pendaftaran').getAttribute('name')).toBe('nomorPendaftaran');
    expect(screen.getByLabelText('Tanggal lahir anak').getAttribute('type')).toBe('date');
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('shows the Jadwal OKB in Indonesian with the Gelombang, and keeps what was typed', async () => {
    await submitAndShow({ kind: 'stage', applicant, stage: 'Terjadwal OKB', jadwal: { tanggal: '2027-01-12', gelombang: 'Gelombang 2' } });
    expect(await screen.findByText('Terjadwal OKB')).toBeDefined();
    expect(screen.getByText('Siti Aminah')).toBeDefined();
    expect(screen.getByText('Selasa, 12 Januari 2027')).toBeDefined();
    expect(screen.getByText('Gelombang 2')).toBeDefined();
    expect((screen.getByLabelText('Nomor Pendaftaran') as HTMLInputElement).value).toBe('OB-2027-001');
  });

  it.each<[ResultView, string]>([
    [{ kind: 'stage', applicant, stage: 'Menunggu Verifikasi', jadwal: null }, 'Berkas sedang diverifikasi'],
    [{ kind: 'stage', applicant, stage: 'Terverifikasi', jadwal: null }, 'Berkas sudah terverifikasi'],
    [{ kind: 'stage', applicant, stage: 'Menunggu Pengumuman', jadwal: null }, 'Hasil OKB belum diumumkan'],
    [{ kind: 'not-found' }, 'Data tidak ditemukan'],
    [{ kind: 'locked' }, 'Terlalu banyak percobaan'],
  ])('shows %j as "%s"', async (view, title) => {
    await submitAndShow(view);
    expect(await screen.findByRole('heading', { name: title })).toBeDefined();
  });

  it('congratulates an announced Diterima with the class and a copyable Nomor VA', async () => {
    await submitAndShow({ kind: 'accepted', applicant, kelasPenempatan: 'Reguler', kelasTujuan: '3', nomorVa: '7456012627300120' });
    expect(await screen.findByRole('heading', { name: 'Selamat, Ananda Diterima' })).toBeDefined();
    expect(screen.getByText('Reguler')).toBeDefined();
    expect(screen.getByText('Kelas 3')).toBeDefined();
    expect(screen.getByText('7456012627300120')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Salin Nomor VA' })).toBeDefined();
  });

  it('downloads the Surat Penerimaan by posting the checked Nomor Pendaftaran and birth date', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new Blob(['%PDF']), {
      status: 200, headers: { 'Content-Disposition': 'attachment; filename="Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf"' },
    }));
    const createObjectURL = vi.fn(() => 'blob:surat');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await submitAndShow({ kind: 'accepted', applicant, kelasPenempatan: 'Reguler', kelasTujuan: null, nomorVa: '7456012627300120' });
    fireEvent.click(await screen.findByRole('button', { name: 'Unduh Surat Penerimaan' }));
    await vi.waitFor(() => expect(click).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/hasil-okb/surat');
    expect(init.method).toBe('POST');
    expect([...(init.body as FormData).entries()]).toEqual([['nomorPendaftaran', 'OB-2027-001'], ['tanggalLahir', '2020-03-12']]);
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe('Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf');
    fetchMock.mockRestore();
    click.mockRestore();
  });

  it('explains why the Surat Penerimaan cannot be downloaded', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ error: 'Surat Penerimaan tidak tersedia.' }, { status: 403 }));
    await submitAndShow({ kind: 'accepted', applicant, kelasPenempatan: 'Reguler', kelasTujuan: null, nomorVa: '7456012627300120' });
    fireEvent.click(await screen.findByRole('button', { name: 'Unduh Surat Penerimaan' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Surat Penerimaan tidak tersedia.');
    fetchMock.mockRestore();
  });

  it('says the Nomor VA is being prepared when it is missing', async () => {
    await submitAndShow({ kind: 'accepted', applicant, kelasPenempatan: 'Reguler', kelasTujuan: null, nomorVa: null });
    expect(await screen.findByText('Sedang disiapkan panitia')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Salin Nomor VA' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unduh Surat Penerimaan' })).toBeNull();
  });

  it('tells an announced Ditolak politely, without the word "lulus", and offers the school contact', async () => {
    await submitAndShow({ kind: 'rejected', applicant });
    const card = (await screen.findByRole('heading', { name: 'Ananda belum dapat kami terima' })).closest('section')!;
    expect(card.textContent).toContain('Terima kasih atas kepercayaan Bapak/Ibu');
    expect(card.textContent?.toLowerCase()).not.toContain('lulus');
    expect(screen.getByRole('link', { name: /Hubungi panitia/ })).toBeDefined();
  });

  it('points the parents of a cancelled registration to the school', async () => {
    await submitAndShow({ kind: 'cancelled', applicant });
    expect(await screen.findByRole('heading', { name: 'Pendaftaran dibatalkan' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Hubungi panitia/ }).getAttribute('href')).toContain('wa.me');
  });
});
