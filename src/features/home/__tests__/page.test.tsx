import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingPage } from '@/features/home';
import type { ClassCapacity } from '@/features/registration/classCapacity';

const capacities = (reguler: number, bilingual: number, tahfizh: number): ClassCapacity[] => [
  { pilihanKelas: 'Reguler', kuota: 28, terpakai: reguler },
  { pilihanKelas: 'Bilingual', kuota: 56, terpakai: bilingual },
  { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: tahfizh },
];

const renderHome = (classCapacities: ClassCapacity[] | null = capacities(20, 50, 16)) =>
  render(<LandingPage classCapacities={classCapacities} />);

describe('Open Booking landing page', () => {
  it('uses the temporary Open Booking terminology only on the landing page', () => {
    renderHome();

    expect(screen.getAllByText(/Open Booking Pendaftaran/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/SPMB/i)).toBeNull();
    expect(screen.queryByText(/Penerimaan Murid Baru/i)).toBeNull();

    const registrationPage = readFileSync(
      join(process.cwd(), 'src/app/(public)/pendaftaran/page.tsx'),
      'utf8',
    );
    expect(registrationPage).toContain('Penerimaan Murid Baru');
  });

  it('presents the approved academic year and OKB fee', () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('2027/2028');
    expect(screen.getAllByText('Rp375.000').length).toBeGreaterThan(0);
  });

  it('renders the Open Booking summary card with the fixed schedule copy', () => {
    renderHome();

    const schedule = screen.getByRole('complementary', { name: 'Jadwal penting' });
    expect(within(schedule).getByText('Ringkasan Open Booking')).toBeDefined();
    expect(within(schedule).getByText('1 Oktober – 17 November 2026')).toBeDefined();
    expect(within(schedule).getByText('21 November 2026')).toBeDefined();
    expect(within(schedule).getByText('Rp375.000')).toBeDefined();
    expect(
      within(schedule).getByText('Simpan bukti pembayaran untuk diunggah saat pendaftaran.'),
    ).toBeDefined();
  });

  it('provides the approved parent-first navigation', () => {
    renderHome();

    const navigation = screen.getByRole('navigation', { name: 'Navigasi halaman' });
    expect(navigation.className).toContain('bg-transparent');
    expect(
      within(navigation).getAllByRole('link').map((link) => [
        link.textContent,
        link.getAttribute('href'),
      ]),
    ).toEqual([
      ['Jadwal', '#jadwal'],
      ['Alur', '#alur'],
      ['Kelas', '#kelas'],
      ['Biaya', '#biaya'],
      ['Berkas', '#berkas'],
    ]);
  });

  it('keeps the hero, registration actions, and skip link accessible', () => {
    renderHome();

    const main = screen.getByRole('main');
    expect(main.getAttribute('id')).toBe('konten-utama');
    expect(screen.getByRole('link', { name: 'Lewati ke konten utama' }).getAttribute('href')).toBe(
      '#konten-utama',
    );
    expect(within(main).getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getAllByRole('link', { name: /mulai pendaftaran/i })).toHaveLength(2);
    const loginLink = screen.getByRole('link', { name: 'Login Panitia' });
    expect(loginLink.getAttribute('href')).toBe('/login');
    expect(loginLink.getAttribute('data-slot')).toBe('button');
    expect(loginLink.closest('button')).toBeNull();

    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-white/90');
    expect(within(header).getByRole('link', { name: 'Login Panitia' }).className).toContain(
      'border-l',
    );
    const headerRegistrationLink = within(header).getByRole('link', { name: 'Daftar Sekarang' });
    expect(headerRegistrationLink.className).toContain('rounded-full');
    expect(headerRegistrationLink.className).toContain('bg-public-green');
    expect(within(header).getByRole('link', { name: 'Login Panitia' }).className).toContain(
      'sm:border-l-slate-200',
    );
  });

  it('opens and closes the accessible mobile navigation', () => {
    renderHome();

    const trigger = screen.getByRole('button', { name: 'Buka menu navigasi' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('navigation', { name: 'Navigasi seluler' })).toBeNull();

    fireEvent.click(trigger);

    const mobileNavigation = screen.getByRole('navigation', { name: 'Navigasi seluler' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(mobileNavigation.className).toContain('bg-gradient-to-b');
    expect(within(mobileNavigation).getByText('Menu Utama')).toBeDefined();
    expect(within(mobileNavigation).getByText('Informasi Open Booking')).toBeDefined();
    expect(within(mobileNavigation).getAllByRole('link')).toHaveLength(7);
    expect(within(mobileNavigation).getByRole('link', { name: 'Daftar Sekarang' })).toBeDefined();

    fireEvent.click(within(mobileNavigation).getByRole('link', { name: 'Jadwal' }));
    expect(screen.queryByRole('navigation', { name: 'Navigasi seluler' })).toBeNull();
  });

  it('keeps the mobile menu over the full remaining viewport and locks background scrolling', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu navigasi' }));

    const menuOverlay = screen.getByRole('dialog', { name: 'Menu navigasi' });
    expect(menuOverlay.className).toContain('fixed');
    expect(menuOverlay.className).toContain('bottom-0');
    expect(menuOverlay.className).toContain('top-[76px]');
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Menu navigasi' })).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('shows database progress toward the 112 participant capacity and urgency text', () => {
    renderHome();

    const schedule = screen.getByRole('complementary', { name: 'Jadwal penting' });
    const progress = within(schedule).getByRole('progressbar', {
      name: '86 dari 112 pendaftar telah menyelesaikan pendaftaran',
    });
    expect(progress.getAttribute('aria-valuenow')).toBe('86');
    expect(progress.getAttribute('aria-valuemax')).toBe('112');
    expect(within(schedule).getByText('86 / 112')).toBeDefined();
    expect(
      within(schedule).getByRole('region', { name: 'Progress pendaftar' }).className,
    ).toContain('from-emerald-900/15');
    expect(
      within(schedule).getByText(/kuota terbatas! segera daftarkan putra-putri ayah & bunda/i),
    ).toBeDefined();
  });

  it('caps the visual progress at 100 percent when existing data exceeds capacity', () => {
    renderHome(capacities(28, 64, 28));

    const progress = screen.getByRole('progressbar', {
      name: '120 dari 112 pendaftar telah menyelesaikan pendaftaran',
    });
    expect(progress.getAttribute('aria-valuenow')).toBe('112');
    expect(progress.getAttribute('style')).toContain('width: 100%');
  });

  it('does not present a misleading zero when progress data is unavailable', () => {
    renderHome(null);

    expect(screen.getByText('Progress sementara tidak tersedia')).toBeDefined();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('0 pendaftar')).toBeNull();
  });

  it('replaces detailed fees with the official downloadable PDF', () => {
    renderHome();

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByText('Jadwal pembayaran')).toBeNull();
    expect(screen.queryByText('Diskon uang bangunan')).toBeNull();
    expect(screen.queryByText('Rp10.670.000')).toBeNull();

    const download = screen.getByRole('link', { name: /unduh rincian biaya pdf/i });
    expect(download.getAttribute('href')).toBe('/rincian-biaya-2027-2028.pdf');
    expect(download.hasAttribute('download')).toBe(true);
    expect(existsSync(join(process.cwd(), 'public/rincian-biaya-2027-2028.pdf'))).toBe(true);
  });

  it('walks parents through the five-step Alur Pendaftaran up to the Keputusan Penerimaan', () => {
    renderHome();

    const section = screen.getByRole('region', { name: 'Alur Pendaftaran' });
    expect(section.getAttribute('id')).toBe('alur');
    const steps = within(section).getByRole('list', { name: 'Langkah pendaftaran' });
    expect(
      within(steps).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual([
      'Bayar biaya OKB',
      'Isi formulir & unggah Berkas',
      'Verifikasi Berkas',
      'Ikuti OKB',
      'Keputusan Penerimaan',
    ]);
    expect(
      within(steps).getByText('Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp.'),
    ).toBeDefined();
  });

  it('presents the three Pilihan Kelas with accreditation, Pindahan, and Kelas Penempatan notes', () => {
    renderHome();

    const section = screen.getByRole('region', { name: 'Pilihan Kelas' });
    expect(section.getAttribute('id')).toBe('kelas');
    expect(within(section).getByText('Terakreditasi A')).toBeDefined();
    for (const kelas of ['Reguler', 'Bilingual', 'Tahfizh']) {
      expect(within(section).getByRole('article', { name: kelas })).toBeDefined();
    }
    expect(within(section).getByText(/Pindahan ke kelas 2–6\?/)).toBeDefined();
    expect(within(section).getByText(/pilih Jenis Pendaftaran Pindahan/)).toBeDefined();
    expect(within(section).getByText(/Kelas Penempatan ditetapkan Panitia setelah OKB/)).toBeDefined();
  });

  it('labels each Pilihan Kelas Tersedia, Hampir penuh, or Penuh from its remaining seats', () => {
    renderHome([
      { pilihanKelas: 'Reguler', kuota: 30, terpakai: 24 },
      { pilihanKelas: 'Bilingual', kuota: 30, terpakai: 23 },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 28 },
    ]);

    const card = (kelas: string) => screen.getByRole('article', { name: kelas });
    expect(within(card('Reguler')).getByText('Hampir penuh')).toBeDefined();
    expect(within(card('Bilingual')).getByText('Tersedia')).toBeDefined();
    expect(within(card('Tahfizh')).getByText('Penuh')).toBeDefined();
    expect(within(card('Tahfizh')).getByText('Pilihan kelas ini sudah penuh')).toBeDefined();
    expect(within(card('Reguler')).queryByText('Pilihan kelas ini sudah penuh')).toBeNull();
  });

  it('hides class quota status when capacity data is unavailable', () => {
    renderHome(null);

    const section = screen.getByRole('region', { name: 'Pilihan Kelas' });
    expect(within(section).getAllByRole('article')).toHaveLength(3);
    for (const status of ['Tersedia', 'Hampir penuh', 'Penuh']) {
      expect(within(section).queryByText(status)).toBeNull();
    }
  });

  it('lists the four Berkas exactly as the form asks, with NISN mentioned once', () => {
    const { container } = renderHome();

    const section = screen.getByRole('region', { name: 'Berkas yang Disiapkan' });
    expect(section.getAttribute('id')).toBe('berkas');
    const berkas = within(section).getByRole('list', { name: 'Daftar Berkas' });
    expect(within(berkas).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Akta Kelahiran',
      'Kartu Keluarga',
      'Pas Foto',
      'Bukti Pembayaran OKB',
    ]);
    expect(within(section).getByText(/foto atau scan/i)).toBeDefined();
    expect(container.textContent?.match(/NISN/g)).toHaveLength(1);
    expect(container.textContent).not.toMatch(/fotokopi/i);
    expect(screen.queryByText('Mengapa Al-Muhajirin?')).toBeNull();
  });

  it('never uses the word seleksi', () => {
    const { container } = renderHome();

    expect(container.textContent).not.toMatch(/seleksi/i);
  });

  it('connects the generated Plus Jakarta font variable to Tailwind tokens', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const globals = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(layout).toContain('variable: "--font-plus-jakarta"');
    expect(globals).toContain('--font-sans: var(--font-plus-jakarta)');
  });
});
