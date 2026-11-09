import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  fetchSchedule: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/admin/okbSchedule/server/okbScheduleRepository', () => ({ fetchOkbSchedule: mocks.fetchSchedule }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import OkbSchedulePage from '../page';

const view = {
  today: '2026-11-20',
  missed: 0,
  days: [
    {
      tanggal: '2026-11-20',
      total: 30,
      hadir: 12,
      terjadwal: 18,
      waves: [
        { gelombang: 1, total: 20, hadir: 12, terjadwal: 8 },
        { gelombang: 2, total: 10, hadir: 0, terjadwal: 10 },
      ],
    },
    { tanggal: '2026-11-25', total: 6, hadir: 0, terjadwal: 6, waves: [{ gelombang: 3, total: 6, hadir: 0, terjadwal: 6 }] },
  ],
};
const day = (name: string) => screen.getByRole('listitem', { name });

describe('OkbSchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue(true);
    mocks.fetchSchedule.mockResolvedValue(view);
  });

  it('sends anyone without an admin session to the login page before reading data', async () => {
    mocks.getAdminSession.mockResolvedValue(false);

    await expect(OkbSchedulePage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/login');
    expect(mocks.fetchSchedule).not.toHaveBeenCalled();
  });

  it('shows today as attended out of the total, per date and per Gelombang', async () => {
    render(await OkbSchedulePage());

    const today = within(day('Jumat, 20 November 2026'));
    expect(today.getByText('Hari ini')).toBeDefined();
    expect(today.getByText('12 hadir dari 30')).toBeDefined();
    expect(today.getByText('12 hadir dari 20')).toBeDefined();
    expect(today.getByText('0 hadir dari 10')).toBeDefined();
  });

  it('shows another date as scheduled only', async () => {
    render(await OkbSchedulePage());

    const other = within(day('Rabu, 25 November 2026'));
    expect(other.queryByText('Hari ini')).toBeNull();
    expect(other.getAllByText('6 terjadwal')).toHaveLength(2);
    expect(other.queryByText(/hadir/)).toBeNull();
  });

  it('leaves a Pendaftar marked present early out of the count of another date', async () => {
    mocks.fetchSchedule.mockResolvedValue({
      ...view,
      days: [{ tanggal: '2026-11-25', total: 3, hadir: 1, terjadwal: 2, waves: [{ gelombang: 3, total: 3, hadir: 1, terjadwal: 2 }] }],
    });
    render(await OkbSchedulePage());

    expect(within(day('Rabu, 25 November 2026')).getAllByText('2 terjadwal')).toHaveLength(2);
  });

  it('offers Scan Kehadiran on today only', async () => {
    render(await OkbSchedulePage());

    const scan = within(day('Jumat, 20 November 2026')).getByRole('link', { name: /Scan Kehadiran/ });
    expect(scan.getAttribute('href')).toBe('/admin/scan');
    expect(within(day('Rabu, 25 November 2026')).queryByRole('link', { name: /Scan Kehadiran/ })).toBeNull();
  });

  it('links each Gelombang to Data Pendaftar filtered by that Gelombang', async () => {
    render(await OkbSchedulePage());

    const link = within(day('Rabu, 25 November 2026')).getByRole('link', { name: 'Data Pendaftar Gelombang 3' });
    expect(link.getAttribute('href')).toBe('/admin/pendaftar?gelombang=3');
  });

  it('links each Gelombang with Pendaftar still scheduled to its Name Tag group', async () => {
    render(await OkbSchedulePage());

    const link = within(day('Rabu, 25 November 2026')).getByRole('link', { name: 'Name Tag Gelombang 3' });
    expect(link.getAttribute('href')).toBe('/admin/okb/name-tag?tanggal=2026-11-25&gelombang=3');
  });

  it('hides the Name Tag link of a Gelombang whose Pendaftar have all attended', async () => {
    mocks.fetchSchedule.mockResolvedValue({
      ...view,
      days: [{ tanggal: '2026-11-20', total: 2, hadir: 2, terjadwal: 0, waves: [{ gelombang: 1, total: 2, hadir: 2, terjadwal: 0 }] }],
    });
    render(await OkbSchedulePage());

    expect(screen.queryByRole('link', { name: 'Name Tag Gelombang 1' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Data Pendaftar Gelombang 1' })).toBeDefined();
  });

  it('links to Tidak Hadir OKB with its count only when there are any', async () => {
    mocks.fetchSchedule.mockResolvedValue({ ...view, missed: 4 });
    render(await OkbSchedulePage());

    expect(screen.getByRole('link', { name: /4 Pendaftar Tidak Hadir OKB/ }).getAttribute('href')).toBe('/admin/pendaftar?okb=terlewat');
  });

  it('hides the Tidak Hadir OKB link when there are none', async () => {
    render(await OkbSchedulePage());

    expect(screen.queryByRole('link', { name: /Tidak Hadir OKB/ })).toBeNull();
  });

  it('explains when there is no upcoming Jadwal OKB, and still links to Tidak Hadir OKB', async () => {
    mocks.fetchSchedule.mockResolvedValue({ today: '2026-11-20', missed: 2, days: [] });
    render(await OkbSchedulePage());

    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.getByRole('link', { name: /2 Pendaftar Tidak Hadir OKB/ })).toBeDefined();
  });

  it('reports a load failure instead of an empty schedule', async () => {
    mocks.fetchSchedule.mockRejectedValue(new Error('db down'));
    render(await OkbSchedulePage());

    expect(screen.getByText('Jadwal OKB belum dapat dimuat')).toBeDefined();
    expect(screen.queryByText('Belum ada Jadwal OKB mendatang.')).toBeNull();
  });
});
