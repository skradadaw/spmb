import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../../actions/saveRuangOkbAction', () => ({ saveRuangOkbAction: mocks.save }));

import { RuangOkbBulkForm } from '../RuangOkbBulkForm';

const members = [
  { id: 'id-ahmad', namaLengkap: 'AHMAD fauzi', ruangOkb: 'Ruang A' },
  { id: 'id-aisyah', namaLengkap: 'Aisyah Putri', ruangOkb: null },
  { id: 'id-bilal', namaLengkap: 'Bilal', ruangOkb: null },
];
const success = (updated: number) => ({ status: 'success', message: `Ruang OKB disimpan untuk ${updated} Pendaftar.`, updated });

const rooms = [{ id: 'room-a', nama: 'Ruang A' }, { id: 'room-b', nama: 'Ruang B' }];
const renderForm = (props: Partial<React.ComponentProps<typeof RuangOkbBulkForm>> = {}) => render(<RuangOkbBulkForm members={members} rooms={rooms} {...props} />);
const check = (name: string) => screen.getByRole('checkbox', { name: `Pilih ${name}` }) as HTMLInputElement;
const selectAll = () => screen.getByRole('checkbox', { name: 'Pilih semua Pendaftar' }) as HTMLInputElement;
const ruang = () => screen.getByRole('combobox', { name: 'Ruang OKB' });
const chooseRoom = (nama: string) => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  fireEvent.keyDown(ruang(), { key: 'Enter' });
  fireEvent.click(screen.getByRole('option', { name: nama }));
};
const saveButton = () => screen.getByRole('button', { name: 'Simpan ruangan' }) as HTMLButtonElement;
const clearButton = () => screen.getByRole('button', { name: 'Kosongkan' }) as HTMLButtonElement;

describe('RuangOkbBulkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue(success(2));
  });

  it('shows each name tidied and marks who has no room yet', () => {
    renderForm();
    const rows = within(screen.getByRole('list', { name: 'Daftar Pendaftar' })).getAllByRole('listitem');

    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('Ahmad Fauzi')).toBeDefined();
    expect(within(rows[0]).getByText('Ruang A')).toBeDefined();
    expect(within(rows[0]).queryByText('Belum ada ruangan')).toBeNull();
    expect(within(rows[1]).getByText('Belum ada ruangan')).toBeDefined();
  });

  it('saves one room for the checked Pendaftar only, then clears the selection and the field', async () => {
    renderForm();
    fireEvent.click(check('Aisyah Putri'));
    fireEvent.click(check('Bilal'));
    chooseRoom('Ruang B');
    fireEvent.click(saveButton());

    expect(await screen.findByText('Ruang OKB disimpan untuk 2 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith(['id-aisyah', 'id-bilal'], 'room-b');
    await waitFor(() => expect(check('Aisyah Putri').checked).toBe(false));
    expect(ruang().textContent).toContain('Pilih ruangan');
  });

  it('checks and unchecks everyone at once, showing a partial selection on the master checkbox', () => {
    renderForm();
    fireEvent.click(check('Bilal'));
    expect(selectAll().indeterminate).toBe(true);
    expect(selectAll().checked).toBe(false);

    fireEvent.click(selectAll());
    expect(selectAll().checked).toBe(true);
    expect(selectAll().indeterminate).toBe(false);
    expect(members.every(member => (screen.getByRole('checkbox', { name: new RegExp(`^Pilih ${member.namaLengkap}`, 'i') }) as HTMLInputElement).checked)).toBe(true);

    fireEvent.click(selectAll());
    expect(check('Bilal').checked).toBe(false);
  });

  it('clears the room of the checked Pendaftar regardless of what is chosen', async () => {
    renderForm();
    fireEvent.click(check('Ahmad Fauzi'));
    chooseRoom('Ruang B');
    fireEvent.click(clearButton());

    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(['id-ahmad'], ''));
  });

  it('cannot save without a selection or a room, so saving never clears rooms by accident', () => {
    renderForm();
    expect(saveButton().disabled).toBe(true);

    fireEvent.click(check('Bilal'));
    expect(saveButton().disabled).toBe(true);

    chooseRoom('Ruang B');
    expect(saveButton().disabled).toBe(false);
  });

  it('can only clear when a checked Pendaftar has a room', () => {
    renderForm();
    expect(clearButton().disabled).toBe(true);
    fireEvent.click(check('Bilal'));
    expect(clearButton().disabled).toBe(true);
    fireEvent.click(check('Ahmad Fauzi'));
    expect(clearButton().disabled).toBe(false);
  });

  it('offers the rooms from the list in the given order', () => {
    renderForm();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    fireEvent.keyDown(ruang(), { key: 'Enter' });

    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Ruang A', 'Ruang B']);
  });

  it('points to Pengaturan instead of a room choice when the room list is still empty, but can still clear', () => {
    renderForm({ rooms: [] });

    expect(screen.getByText(/Belum ada ruangan\. Tambahkan di/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'Pengaturan' }).getAttribute('href')).toBe('/admin/pengaturan/ruang-okb');
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Simpan ruangan' })).toBeNull();
    expect(clearButton()).toBeDefined();
  });

  it('keeps the selection and the room on a partial save, dropping those gone from the reloaded list', async () => {
    mocks.save.mockResolvedValue({ status: 'error', message: 'Ruang OKB disimpan untuk 1 dari 2 Pendaftar. Status 1 Pendaftar lainnya sudah berubah.', updated: 1 });
    const { rerender } = renderForm();
    fireEvent.click(check('Aisyah Putri'));
    fireEvent.click(check('Bilal'));
    chooseRoom('Ruang B');
    fireEvent.click(saveButton());

    expect(await screen.findByText(/Status 1 Pendaftar lainnya sudah berubah/)).toBeDefined();
    expect(check('Aisyah Putri').checked).toBe(true);
    expect(ruang().textContent).toContain('Ruang B');

    // The action revalidates the page: Bilal's status changed, so he is gone from the list.
    rerender(<RuangOkbBulkForm members={members.filter(member => member.id !== 'id-bilal')} rooms={rooms} />);
    expect(screen.getByText('1 dipilih')).toBeDefined();

    mocks.save.mockResolvedValue(success(1));
    fireEvent.click(saveButton());
    await waitFor(() => expect(mocks.save).toHaveBeenLastCalledWith(['id-aisyah'], 'room-b'));
  });

  it('keeps the selection when nothing could be saved', async () => {
    mocks.save.mockResolvedValue({ status: 'error', message: 'Ruang OKB tidak dapat disimpan. Periksa koneksi lalu coba lagi.', updated: 0 });
    renderForm();
    fireEvent.click(check('Bilal'));
    chooseRoom('Ruang B');
    fireEvent.click(saveButton());

    expect(await screen.findByText(/tidak dapat disimpan/)).toBeDefined();
    expect(check('Bilal').checked).toBe(true);
  });
});
