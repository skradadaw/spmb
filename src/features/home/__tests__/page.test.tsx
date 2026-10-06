import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingPage } from '@/features/home';

const renderHome = (completedCount: number | null = 86) =>
  render(<LandingPage completedCount={completedCount} />);

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
    expect(within(schedule).getByText('1 Okt–17 Nov 2026')).toBeDefined();
    expect(within(schedule).getByText('25 November 2026')).toBeDefined();
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
      ['Cara Daftar', '#cara-daftar'],
      ['Biaya', '#biaya'],
      ['Persyaratan', '#persyaratan'],
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
    expect(headerRegistrationLink.className).toContain('bg-[#008A12]');
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
    expect(within(mobileNavigation).getAllByRole('link')).toHaveLength(6);
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
      name: '86 dari 112 peserta telah menyelesaikan pendaftaran',
    });
    expect(progress.getAttribute('aria-valuenow')).toBe('86');
    expect(progress.getAttribute('aria-valuemax')).toBe('112');
    expect(within(schedule).getByText('86 / 112')).toBeDefined();
    expect(
      within(schedule).getByRole('region', { name: 'Progress peserta' }).className,
    ).toContain('from-emerald-900/15');
    expect(
      within(schedule).getByText(/kuota terbatas! segera daftarkan putra-putri ayah & bunda/i),
    ).toBeDefined();
  });

  it('caps the visual progress at 100 percent when existing data exceeds capacity', () => {
    renderHome(120);

    const progress = screen.getByRole('progressbar', {
      name: '120 dari 112 peserta telah menyelesaikan pendaftaran',
    });
    expect(progress.getAttribute('aria-valuenow')).toBe('112');
    expect(progress.getAttribute('style')).toContain('width: 100%');
  });

  it('does not present a misleading zero when progress data is unavailable', () => {
    renderHome(null);

    expect(screen.getByText('Progress sementara tidak tersedia')).toBeDefined();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('0 peserta')).toBeNull();
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

  it('shows the three registration steps and every preparation item', () => {
    renderHome();

    const steps = screen.getByRole('list', { name: 'Langkah pendaftaran' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3);
    expect(within(steps).getByText('Siapkan dokumen')).toBeDefined();
    expect(within(steps).getByText('Isi formulir')).toBeDefined();
    expect(within(steps).getByText('Ikuti Tes OKB')).toBeDefined();

    for (const item of [
      'Fotokopi akta lahir',
      'Fotokopi kartu keluarga',
      'Nomor NISN',
      'Pas foto ukuran 3×4',
    ]) {
      expect(screen.getByText(item)).toBeDefined();
    }
  });

  it('connects the generated Plus Jakarta font variable to Tailwind tokens', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const globals = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(layout).toContain('variable: "--font-plus-jakarta"');
    expect(globals).toContain('--font-sans: var(--font-plus-jakarta)');
  });
});
