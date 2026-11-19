import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { on, overviewFrom, pendaftar, repeat, sampleRows } from '@/features/admin/okbOverview/__tests__/overviewFixture';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  fetchOverview: vi.fn(),
  fetchRooms: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/admin/okbOverview/server/okbOverviewRepository', () => ({ fetchOkbOverview: mocks.fetchOverview }));
vi.mock('@/features/admin/ruangOkb/server/ruangOkbRepository', () => ({ fetchRuangOkbList: mocks.fetchRooms }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import OkbOverviewPage from '../page';

const missed = repeat(2, () => pendaftar('Terjadwal OKB', on('2026-11-12', 1)));
const rooms = [{ id: 'r2', nama: 'Ruang 2' }, { id: 'r10', nama: 'Ruang 10' }, { id: 'lab', nama: 'Lab Komputer' }];

describe('OkbOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
    mocks.fetchOverview.mockResolvedValue(overviewFrom([...sampleRows(), ...missed]));
    mocks.fetchRooms.mockResolvedValue(rooms);
  });

  it('sends anyone without an admin session to the login page before reading data', async () => {
    mocks.getAdminSession.mockResolvedValue(false);

    await expect(OkbOverviewPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.fetchOverview).not.toHaveBeenCalled();
    expect(mocks.fetchRooms).not.toHaveBeenCalled();
  });

  it('shows the OKB stages, the schedule of today, and the results together', async () => {
    render(await OkbOverviewPage());

    expect(screen.getByRole('list', { name: 'Tahap OKB' })).toBeDefined();
    // 24 Pendaftar mendatang ditambah 2 Tidak Hadir OKB.
    expect(screen.getByRole('link', { name: /Terjadwal OKB/ }).textContent).toContain('26');
    expect(screen.getByRole('tab', { name: 'Jumat, 20 November 2026, 30 Pendaftar' }).getAttribute('aria-selected')).toBe('true');
    expect(within(screen.getByRole('region', { name: 'Gelombang OKB' })).getByText('12 hadir dari 20')).toBeDefined();
    expect(screen.getByRole('link', { name: /^Scan Kehadiran$/ }).getAttribute('href')).toBe('/admin/scan');
    expect(screen.getByRole('heading', { name: 'Hasil OKB per Gelombang' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Alur kegiatan OKB' })).toBeDefined();
  });

  it('shows another date as scheduled only, without Scan Kehadiran', async () => {
    render(await OkbOverviewPage());
    fireEvent.click(screen.getByRole('tab', { name: /Rabu, 25 November 2026/ }));

    expect(within(screen.getByRole('region', { name: 'Gelombang OKB' })).getAllByText('6 terjadwal')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /^Scan Kehadiran$/ })).toBeNull();
  });

  it('links to Tidak Hadir OKB with its count only when there are any', async () => {
    render(await OkbOverviewPage());
    expect(screen.getByRole('link', { name: /2 Pendaftar Tidak Hadir OKB/ }).getAttribute('href')).toBe('/admin/pendaftar?okb=terlewat');
  });

  it('lists the Ruang OKB from Pengaturan that the date does not use yet', async () => {
    render(await OkbOverviewPage());

    const rooms = within(screen.getByRole('region', { name: 'Pembagian Ruang OKB' }));
    expect(within(rooms.getByRole('list', { name: 'Ruang OKB yang belum dipakai' })).getByText('Lab Komputer')).toBeDefined();
  });

  it('still shows the overview when the list of Ruang OKB cannot be read', async () => {
    mocks.fetchRooms.mockRejectedValue(new Error('db down'));
    render(await OkbOverviewPage());

    const rooms = within(screen.getByRole('region', { name: 'Pembagian Ruang OKB' }));
    expect(rooms.getByText(/ruang dipakai/).textContent).toBe('2 ruang dipakai');
    expect(rooms.queryByRole('list', { name: 'Ruang OKB yang belum dipakai' })).toBeNull();
  });

  it('explains when there is no upcoming Jadwal OKB, and still links to Tidak Hadir OKB', async () => {
    mocks.fetchOverview.mockResolvedValue(overviewFrom(missed));
    render(await OkbOverviewPage());

    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.getByRole('link', { name: /2 Pendaftar Tidak Hadir OKB/ })).toBeDefined();
  });

  it('reports a load failure instead of an empty overview', async () => {
    mocks.fetchOverview.mockRejectedValue(new Error('db down'));
    render(await OkbOverviewPage());

    expect(screen.getByText('Ringkasan OKB belum dapat dimuat')).toBeDefined();
    expect(screen.queryByText('Belum ada Jadwal OKB mendatang.')).toBeNull();
  });
});
