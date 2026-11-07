import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  fetchRows: vi.fn(),
  replace: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/admin/nameTag/server/nameTagRepository', () => ({ fetchNameTagRows: mocks.fetchRows }));
vi.mock('@/features/admin/nameTag/actions/saveRuangOkbAction', () => ({ saveRuangOkbAction: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, useRouter: () => ({ replace: mocks.replace }) }));

import NameTagPage from '../page';

const rows = [
  { id: 'a', namaLengkap: 'Aisyah', ruangOkb: 'Ruang A', tanggal: '2026-11-20', gelombang: 1 },
  { id: 'b', namaLengkap: 'Bilal', ruangOkb: null, tanggal: '2026-11-20', gelombang: 2 },
  { id: 'c', namaLengkap: 'Citra', ruangOkb: null, tanggal: '2026-11-25', gelombang: 3 },
];
const open = (props: Record<string, string> = {}) => NameTagPage({ searchParams: Promise.resolve(props) });
const openSelect = (name: string) => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  fireEvent.keyDown(screen.getByRole('combobox', { name }), { key: 'Enter' });
};

describe('NameTagPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
    mocks.fetchRows.mockResolvedValue(rows);
  });

  it('sends anyone without an admin session to the login page before reading data', async () => {
    mocks.getAdminSession.mockResolvedValue(false);

    await expect(open()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.fetchRows).not.toHaveBeenCalled();
  });

  it('shows the Pendaftar of the group in the URL and which group is selected', async () => {
    render(await open({ tanggal: '2026-11-20', gelombang: '2' }));

    expect(screen.getByRole('combobox', { name: 'Tanggal OKB' }).textContent).toContain('20 November 2026');
    expect(screen.getByRole('combobox', { name: 'Gelombang OKB' }).textContent).toContain('Gelombang 2');
    const list = screen.getByRole('list', { name: 'Daftar Pendaftar' });
    expect(within(list).getByText('Bilal')).toBeDefined();
    expect(within(list).queryByText('Aisyah')).toBeNull();
    expect(within(list).queryByText('Citra')).toBeNull();
  });

  it('moves to another date, letting the page open its first Gelombang', async () => {
    render(await open());

    openSelect('Tanggal OKB');
    fireEvent.click(await screen.findByRole('option', { name: /25 November 2026/ }));

    expect(mocks.replace).toHaveBeenCalledWith('/admin/name-tag?tanggal=2026-11-25', { scroll: false });
  });

  it('offers only the Gelombang that have Pendaftar on the chosen date', async () => {
    render(await open({ tanggal: '2026-11-20', gelombang: '1' }));

    openSelect('Gelombang OKB');
    const options = await screen.findAllByRole('option');

    expect(options).toHaveLength(2);
    expect(options[0].textContent).toContain('Gelombang 1');
    expect(options[0].textContent).toContain('1 pendaftar');
    expect(options[1].textContent).toContain('Gelombang 2');
    fireEvent.click(options[1]);
    expect(mocks.replace).toHaveBeenCalledWith('/admin/name-tag?tanggal=2026-11-20&gelombang=2', { scroll: false });
  });

  it('counts the cards of the selected group only, and offers the ZIP when there are some', async () => {
    mocks.fetchRows.mockResolvedValue([
      ...rows,
      { id: 'd', namaLengkap: 'Dina', ruangOkb: 'Ruang B', tanggal: '2026-11-20', gelombang: 1 },
      { id: 'e', namaLengkap: 'Eka', ruangOkb: null, tanggal: '2026-11-20', gelombang: 1 },
    ]);
    render(await open({ tanggal: '2026-11-20', gelombang: '1' }));

    expect(screen.getByText('2 kartu akan diunduh.')).toBeDefined();
    expect(screen.getByText('1 Pendaftar tanpa Ruang OKB tidak ikut diunduh.')).toBeDefined();
    expect((screen.getByRole('button', { name: 'Unduh ZIP Name Tag' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables the ZIP when nobody in the group has a Ruang OKB', async () => {
    render(await open({ tanggal: '2026-11-25', gelombang: '3' }));

    expect(screen.getByText('0 kartu akan diunduh.')).toBeDefined();
    expect((screen.getByRole('button', { name: 'Unduh ZIP Name Tag' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('says so when no upcoming Jadwal OKB exists', async () => {
    mocks.fetchRows.mockResolvedValue([]);
    render(await open());

    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unduh ZIP Name Tag' })).toBeNull();
  });

  it('shows an error instead of an empty list when the query fails', async () => {
    mocks.fetchRows.mockRejectedValue(new Error('db down'));
    render(await open());

    expect(screen.getByText('Data Name Tag belum dapat dimuat')).toBeDefined();
    expect(screen.queryByText('Belum ada Jadwal OKB mendatang.')).toBeNull();
  });
});
