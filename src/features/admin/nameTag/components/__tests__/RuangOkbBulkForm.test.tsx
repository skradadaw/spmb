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
const check = (name: string) => screen.getByRole('checkbox', { name: `Pilih ${name}` });
const selectAll = () => screen.getByRole('checkbox', { name: 'Pilih semua Pendaftar' });
/** shadcn Checkbox (Base UI) memakai aria-checked: true, false, atau mixed. */
const state = (element: HTMLElement) => element.getAttribute('aria-checked');
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
    await waitFor(() => expect(state(check('Aisyah Putri'))).toBe('false'));
    expect(ruang().textContent).toContain('Pilih ruangan');
  });

  it('checks and unchecks everyone at once, showing a partial selection on the master checkbox', () => {
    renderForm();
    fireEvent.click(check('Bilal'));
    expect(state(selectAll())).toBe('mixed');

    fireEvent.click(selectAll());
    expect(state(selectAll())).toBe('true');
    expect(members.every(member => state(screen.getByRole('checkbox', { name: new RegExp(`^Pilih ${member.namaLengkap}`, 'i') })) === 'true')).toBe(true);

    fireEvent.click(selectAll());
    expect(state(check('Bilal'))).toBe('false');
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
    expect(state(check('Aisyah Putri'))).toBe('true');
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
    expect(state(check('Bilal'))).toBe('true');
  });

  describe('filter', () => {
    const filter = (name: RegExp) => screen.getByRole('tab', { name });
    const visibleNames = () => within(screen.getByRole('list', { name: 'Daftar Pendaftar' })).getAllByRole('listitem').map(item => item.querySelector('[data-name]')?.textContent);

    it('offers everyone, those without a room, and each room in use, with their counts', () => {
      renderForm();
      const filters = within(screen.getByRole('tablist', { name: 'Saring Pendaftar' })).getAllByRole('tab');

      expect(filters.map(button => button.textContent)).toEqual(['Semua3', 'Belum ada ruangan2', 'Ruang A1']);
      expect(filter(/^Semua/).getAttribute('aria-selected')).toBe('true');
    });

    it('shows only the Pendaftar of the chosen filter', () => {
      renderForm();
      fireEvent.click(filter(/^Belum ada ruangan/));

      expect(visibleNames()).toEqual(['Aisyah Putri', 'Bilal']);
      expect(filter(/^Belum ada ruangan/).getAttribute('aria-selected')).toBe('true');

      fireEvent.click(filter(/^Ruang A/));
      expect(visibleNames()).toEqual(['Ahmad Fauzi']);
    });

    it('selects only the shown Pendaftar with Pilih semua, and starts over when the filter changes', async () => {
      mocks.save.mockResolvedValue(success(2));
      renderForm();
      fireEvent.click(filter(/^Belum ada ruangan/));
      fireEvent.click(selectAll());
      expect(screen.getByText('2 dipilih')).toBeDefined();

      chooseRoom('Ruang B');
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(['id-aisyah', 'id-bilal'], 'room-b'));

      fireEvent.click(check('Bilal'));
      fireEvent.click(filter(/^Semua/));
      expect(screen.queryByText(/dipilih/)).toBeNull();
      expect(state(check('Bilal'))).toBe('false');
    });

    it('hides the without-room filter once everyone has a room', () => {
      renderForm({ members: members.map(member => ({ ...member, ruangOkb: 'Ruang A' })) });

      expect(screen.queryByRole('tab', { name: /^Belum ada ruangan/ })).toBeNull();
    });
  });

  it('labels the master checkbox Pilih semua until someone is checked, then counts the selection', () => {
    renderForm();
    expect(screen.getByText('Pilih semua')).toBeDefined();

    fireEvent.click(check('Bilal'));
    expect(screen.getByText('1 dipilih')).toBeDefined();
    expect(screen.queryByText('Pilih semua')).toBeNull();
  });

  it('says how many of the group are shown', () => {
    renderForm();
    fireEvent.click(screen.getByRole('tab', { name: /^Belum ada ruangan/ }));

    expect(screen.getByText('Menampilkan 2 dari 3 Pendaftar')).toBeDefined();
  });


  it('checks a Pendaftar by clicking anywhere on the row, and unchecks on a second click', () => {
    renderForm();
    fireEvent.click(screen.getByText('Bilal'));
    expect(state(check('Bilal'))).toBe('true');

    fireEvent.click(screen.getByText('Bilal'));
    expect(state(check('Bilal'))).toBe('false');
  });
});
