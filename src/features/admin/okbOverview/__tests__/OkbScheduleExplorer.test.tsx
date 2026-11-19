import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OkbScheduleExplorer } from '../components/OkbScheduleExplorer';
import { LATER, TODAY, on, overviewFrom, pendaftar, repeat } from './overviewFixture';

const days = () => overviewFrom().days;
const region = (name: string) => within(screen.getByRole('region', { name }));
const pick = (name: RegExp) => fireEvent.click(screen.getByRole('tab', { name }));
const selectedDate = () => screen.getAllByRole('tab').find(tab => tab.getAttribute('aria-selected') === 'true' && /Pendaftar$/.test(tab.getAttribute('aria-label') ?? ''))?.getAttribute('aria-label');
const cells = (table: HTMLElement) => within(table).getAllByRole('row').slice(1).map(row => [...row.querySelectorAll('th, td')].map(cell => cell.textContent));

describe('OkbScheduleExplorer', () => {
  it('explains when there is no upcoming Jadwal OKB', () => {
    render(<OkbScheduleExplorer days={[]} roomNames={null} />);

    expect(screen.getByText('Belum ada Jadwal OKB mendatang.')).toBeDefined();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('opens on today with the attendance, Scan Kehadiran, and how many attended per Gelombang', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={null} />);

    expect(selectedDate()).toBe('Jumat, 20 November 2026, 30 Pendaftar');
    expect(screen.getByText('Hari ini', { selector: 'aside span' })).toBeDefined();
    expect(screen.getByRole('img', { name: '12 dari 30 Pendaftar hadir' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Scan Kehadiran/ }).getAttribute('href')).toBe('/admin/scan');
    const waves = region('Gelombang OKB');
    expect(waves.getByText('12 hadir dari 30')).toBeDefined();
    expect(waves.getByText('12 hadir dari 20')).toBeDefined();
    expect(waves.getByText('0 hadir dari 10')).toBeDefined();
    expect(waves.getByRole('progressbar', { name: 'Kehadiran Gelombang 1' }).getAttribute('aria-valuenow')).toBe('60');
  });

  it('links each Gelombang to its Name Tag group and to Data Pendaftar', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={null} />);

    expect(screen.getByRole('link', { name: 'Name Tag Gelombang 1' }).getAttribute('href')).toBe(`/admin/okb/name-tag?tanggal=${TODAY}&gelombang=1`);
    expect(screen.getByRole('link', { name: 'Data Pendaftar Gelombang 2' }).getAttribute('href')).toBe('/admin/pendaftar?gelombang=2');
  });

  it('hides the Name Tag links of a date whose Pendaftar have all attended', () => {
    render(<OkbScheduleExplorer days={overviewFrom(repeat(2, () => pendaftar('Sudah OKB', on(TODAY, 1, { ruangOkb: 'Ruang 1' })))).days} roomNames={null} />);

    expect(screen.queryByRole('link', { name: 'Name Tag Gelombang 1' })).toBeNull();
    expect(screen.queryByRole('link', { name: /Cetak Name Tag|Bagi Ruang OKB/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Data Pendaftar Gelombang 1' })).toBeDefined();
    expect(screen.getByText(/semua sudah hadir/)).toBeDefined();
  });

  it('shows another date as scheduled only, with Ruang OKB readiness instead of attendance and no scan', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={null} />);
    pick(/Rabu, 25 November 2026/);

    expect(selectedDate()).toBe('Rabu, 25 November 2026, 6 Pendaftar');
    expect(region('Gelombang OKB').getAllByText('6 terjadwal')).toHaveLength(2);
    expect(region('Gelombang OKB').queryByText(/hadir/)).toBeNull();
    expect(screen.getByText('5 hari lagi')).toBeDefined();
    expect(screen.getByRole('img', { name: '0 dari 6 Pendaftar punya Ruang OKB' })).toBeDefined();
    expect(screen.queryByRole('link', { name: /Scan Kehadiran/ })).toBeNull();
    const assign = screen.getAllByRole('link', { name: 'Bagi Ruang OKB' });
    expect(assign).toHaveLength(2);
    assign.forEach(link => expect(link.getAttribute('href')).toBe(`/admin/okb/name-tag?tanggal=${LATER}&gelombang=3`));
  });

  it('spreads the date over its Ruang OKB per Gelombang, counts who has no room, and lists the rooms still free', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={['Ruang 2', 'Ruang 10', 'Lab Komputer']} />);
    const rooms = region('Pembagian Ruang OKB');

    expect(rooms.getByText(/ruang dipakai dari 3/).textContent).toBe('2 ruang dipakai dari 3');
    expect(cells(rooms.getByRole('table', { name: 'Pendaftar per Ruang OKB dan Gelombang OKB' }))).toEqual([
      ['Ruang 2', '14', '0', '0', '14'],
      ['Ruang 10', '6', '8', '0', '14'],
    ]);
    expect(rooms.getByText('Belum mendapat Ruang OKB').parentElement!.textContent).toContain('2');
    expect(rooms.getByRole('link', { name: 'Bagi Ruang OKB' }).getAttribute('href')).toBe(`/admin/okb/name-tag?tanggal=${TODAY}&gelombang=2`);
    expect(within(rooms.getByRole('list', { name: 'Ruang OKB yang belum dipakai' })).getAllByRole('listitem').map(item => item.textContent)).toEqual(['Lab Komputer']);
  });

  it('says so when every Pendaftar of the date has a room', () => {
    render(<OkbScheduleExplorer days={overviewFrom(repeat(3, () => pendaftar('Terjadwal OKB', on(LATER, 1, { ruangOkb: 'Ruang 1' })))).days} roomNames={null} />);

    expect(screen.getByText('Semua Pendaftar sudah mendapat Ruang OKB.')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Cetak Name Tag' }).getAttribute('href')).toBe(`/admin/okb/name-tag?tanggal=${LATER}&gelombang=1`);
    expect(screen.queryByText('Belum mendapat Ruang OKB')).toBeNull();
  });

  it('asks to prepare Ruang OKB in Pengaturan when the list of rooms is empty', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={[]} />);

    expect(screen.getByRole('link', { name: 'Siapkan di Pengaturan' }).getAttribute('href')).toBe('/admin/pengaturan/ruang-okb');
  });

  it('shows the Pendaftar of the date by Pilihan Kelas, jenis kelamin, and Jenis Pendaftaran', () => {
    render(<OkbScheduleExplorer days={overviewFrom([
      pendaftar('Terjadwal OKB', on(LATER, 1)),
      pendaftar('Terjadwal OKB', on(LATER, 1)),
      pendaftar('Terjadwal OKB', on(LATER, 2, { pilihanKelas: 'Tahfizh', jenisKelamin: 'Perempuan', jenisPendaftaran: 'Pindahan' })),
    ]).days} roomNames={null} />);
    const composition = region('Komposisi Pendaftar');

    expect(composition.getByRole('img', { name: 'Pilihan Kelas: Reguler 2, Bilingual 0, Tahfizh 1' })).toBeDefined();
    expect(composition.getByRole('img', { name: 'Jenis kelamin: Laki-laki 2, Perempuan 1' })).toBeDefined();
    expect(within(composition.getByRole('list', { name: 'Jenis Pendaftaran' })).getAllByRole('listitem').map(item => item.textContent)).toEqual(['Siswa Baru2', 'Pindahan1']);
  });

  it('offers the same numbers as a table, where a date can be picked too', () => {
    render(<OkbScheduleExplorer days={days()} roomNames={null} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tabel' }));
    const table = screen.getByRole('table', { name: 'Pendaftar per tanggal OKB dan Gelombang OKB' });

    expect(cells(table)).toEqual([
      ['Jum, 20 Nov 2026Hari ini', '20', '10', '–', '30', '12'],
      ['Rab, 25 Nov 2026', '–', '–', '6', '6', '–'],
    ]);
    fireEvent.click(within(table).getByRole('button', { name: 'Rab, 25 Nov 2026' }));
    expect(selectedDate()).toBe('Rabu, 25 November 2026, 6 Pendaftar');
  });

  it('falls back to the nearest date when the picked one is no longer scheduled', () => {
    const { rerender } = render(<OkbScheduleExplorer days={days()} roomNames={null} />);
    pick(/Rabu, 25 November 2026/);

    rerender(<OkbScheduleExplorer days={days().slice(0, 1)} roomNames={null} />);

    expect(selectedDate()).toBe('Jumat, 20 November 2026, 30 Pendaftar');
  });
});
