import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ create: vi.fn(), rename: vi.fn(), remove: vi.fn() }));
vi.mock('../../actions/ruangOkbActions', () => ({
  createRuangOkbAction: mocks.create,
  renameRuangOkbAction: mocks.rename,
  deleteRuangOkbAction: mocks.remove,
}));

import { RuangOkbManager } from '../RuangOkbManager';

const rooms = [
  { id: 'r2', nama: 'Kelas 2', dipakai: 12 },
  { id: 'r10', nama: 'Kelas 10', dipakai: 0 },
];
const row = (nama: string) => within(screen.getByRole('list', { name: 'Daftar Ruang OKB' })).getAllByRole('listitem').find(item => item.textContent?.includes(nama)) as HTMLElement;
const newName = () => screen.getByLabelText('Nama ruangan baru') as HTMLInputElement;

describe('RuangOkbManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({ status: 'success', message: 'Ruang OKB "Aula" ditambahkan.' });
    mocks.rename.mockResolvedValue({ status: 'success', message: 'Nama ruangan diganti menjadi "Ruang 2".' });
    mocks.remove.mockResolvedValue({ status: 'success', message: 'Ruang OKB dihapus.' });
  });

  it('lists the rooms in the given order with how many Pendaftar use each', () => {
    render(<RuangOkbManager rooms={rooms} />);
    const items = within(screen.getByRole('list', { name: 'Daftar Ruang OKB' })).getAllByRole('listitem');

    expect(items.map(item => within(item).getByText(/^Kelas/).textContent)).toEqual(['Kelas 2', 'Kelas 10']);
    expect(within(items[0]).getByText('12 Pendaftar')).toBeDefined();
    expect(within(items[1]).getByText('Belum dipakai')).toBeDefined();
  });

  it('says how to start when the list is empty', () => {
    render(<RuangOkbManager rooms={[]} />);

    expect(screen.getByText('Belum ada ruangan. Tambahkan ruangan pertama di atas.')).toBeDefined();
    expect(screen.queryByRole('list', { name: 'Daftar Ruang OKB' })).toBeNull();
  });

  it('adds a room by name, then clears the field and shows the result', async () => {
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.change(newName(), { target: { value: 'Aula' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));

    expect(await screen.findByText('Ruang OKB "Aula" ditambahkan.')).toBeDefined();
    expect(mocks.create).toHaveBeenCalledWith('Aula');
    expect(newName().value).toBe('');
  });

  it('keeps the typed name when adding fails, showing why', async () => {
    mocks.create.mockResolvedValue({ status: 'error', message: 'Nama ruangan sudah ada.' });
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.change(newName(), { target: { value: 'kelas 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));

    expect(await screen.findByText('Nama ruangan sudah ada.')).toBeDefined();
    expect(newName().value).toBe('kelas 2');
  });

  it('cannot add before a name is typed', () => {
    render(<RuangOkbManager rooms={rooms} />);

    expect((screen.getByRole('button', { name: 'Tambah' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('renames a room in its row, starting from the current name', async () => {
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.click(within(row('Kelas 2')).getByRole('button', { name: 'Ganti nama Kelas 2' }));
    const input = screen.getByLabelText('Nama baru Kelas 2') as HTMLInputElement;
    expect(input.value).toBe('Kelas 2');

    fireEvent.change(input, { target: { value: 'Ruang 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Nama ruangan diganti menjadi "Ruang 2".')).toBeDefined();
    expect(mocks.rename).toHaveBeenCalledWith('r2', 'Ruang 2');
    await waitFor(() => expect(screen.queryByLabelText('Nama baru Kelas 2')).toBeNull());
  });

  it('cancels a rename without saving', () => {
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ganti nama Kelas 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));

    expect(screen.queryByLabelText('Nama baru Kelas 2')).toBeNull();
    expect(mocks.rename).not.toHaveBeenCalled();
  });

  it('keeps the rename open when it fails, showing why', async () => {
    mocks.rename.mockResolvedValue({ status: 'error', message: 'Nama ruangan sudah ada.' });
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ganti nama Kelas 2' }));
    fireEvent.change(screen.getByLabelText('Nama baru Kelas 2'), { target: { value: 'Kelas 10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Nama ruangan sudah ada.')).toBeDefined();
    expect((screen.getByLabelText('Nama baru Kelas 2') as HTMLInputElement).value).toBe('Kelas 10');
  });

  it('deletes a room and shows the result', async () => {
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus Kelas 10' }));

    expect(await screen.findByText('Ruang OKB dihapus.')).toBeDefined();
    expect(mocks.remove).toHaveBeenCalledWith('r10');
  });

  it('shows why a room in use cannot be deleted', async () => {
    mocks.remove.mockResolvedValue({ status: 'error', message: 'Masih dipakai 12 Pendaftar. Pindahkan mereka ke ruangan lain terlebih dahulu.' });
    render(<RuangOkbManager rooms={rooms} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus Kelas 2' }));

    expect(await screen.findByText(/Masih dipakai 12 Pendaftar/)).toBeDefined();
  });
});
