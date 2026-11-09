import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../../actions/saveRuangOkbAction', () => ({ saveRuangOkbAction: mocks.save }));

import { RuangOkbForm } from '../RuangOkbForm';

const applicantId = '123e4567-e89b-12d3-a456-426614174000';
const rooms = [{ id: 'room-2', nama: 'Kelas 2' }, { id: 'room-10', nama: 'Kelas 10' }];
const renderForm = (ruangOkb: string | null = null, list = rooms) => render(<RuangOkbForm applicantId={applicantId} ruangOkb={ruangOkb} rooms={list} />);
const chooseRoom = (nama: string) => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Ruang OKB' }), { key: 'Enter' });
  fireEvent.click(screen.getByRole('option', { name: nama }));
};

describe('RuangOkbForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB disimpan untuk 1 Pendaftar.', updated: 1 });
  });

  it('offers the rooms from the list in the given order', () => {
    renderForm();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Ruang OKB' }), { key: 'Enter' });

    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Kelas 2', 'Kelas 10']);
  });

  it('saves the chosen room for this applicant by its id and shows the result', async () => {
    renderForm();
    chooseRoom('Kelas 10');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Ruang OKB disimpan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([applicantId], 'room-10');
  });

  it('starts on the room already assigned', () => {
    renderForm('Kelas 10');

    expect(screen.getByRole('combobox', { name: 'Ruang OKB' }).textContent).toContain('Kelas 10');
  });

  it('cannot save before a room is chosen', () => {
    renderForm();

    expect((screen.getByRole('button', { name: 'Simpan ruangan' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('clears the room regardless of what is chosen', async () => {
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB dikosongkan untuk 1 Pendaftar.', updated: 1 });
    renderForm('Kelas 2');
    fireEvent.click(screen.getByRole('button', { name: 'Kosongkan' }));

    expect(await screen.findByText('Ruang OKB dikosongkan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([applicantId], '');
  });

  it('shows why the room could not be saved', async () => {
    mocks.save.mockResolvedValue({ status: 'error', message: 'Ruang OKB tidak ditemukan. Muat ulang halaman lalu pilih lagi.', updated: 0 });
    renderForm();
    chooseRoom('Kelas 2');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Ruang OKB tidak ditemukan. Muat ulang halaman lalu pilih lagi.')).toBeDefined();
  });

  it('points to Pengaturan when the room list is still empty', () => {
    renderForm(null, []);

    expect(screen.getByText(/Belum ada ruangan/).textContent).toContain('Belum ada ruangan. Tambahkan di Pengaturan');
    expect(screen.getByRole('link', { name: 'Pengaturan' }).getAttribute('href')).toBe('/admin/pengaturan/ruang-okb');
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Simpan ruangan' })).toBeNull();
  });
});
