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
      ['Biaya dan Berkas', '#persiapan'],
      ['FAQ', '#faq'],
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
    expect(headerRegistrationLink.className).toContain('rounded-xl');
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
    ).toContain('border-t');
    expect(
      within(schedule).getByText(/kuota terbatas. segera daftarkan putra-putri ayah dan bunda/i),
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
      'Isi formulir dan unggah Berkas',
      'Verifikasi Berkas',
      'Ikuti OKB',
      'Keputusan Penerimaan',
    ]);
    expect(
      within(steps).getByText('Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp.'),
    ).toBeDefined();
  });

  it('presents the three Pilihan Kelas with accreditation', () => {
    renderHome();

    const section = screen.getByRole('region', { name: 'Pilihan Kelas' });
    expect(section.getAttribute('id')).toBe('kelas');
    expect(within(section).getByText('Terakreditasi A')).toBeDefined();
    for (const kelas of ['Reguler', 'Bilingual', 'Tahfizh']) {
      expect(within(section).getByRole('article', { name: kelas })).toBeDefined();
    }
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
    expect(within(card('Reguler')).getByText('Sisa 6 dari 30 kursi')).toBeDefined();
    expect(within(card('Bilingual')).getByText('Sisa 7 dari 30 kursi')).toBeDefined();
    expect(within(card('Tahfizh')).getByText('Kuota terisi penuh')).toBeDefined();
  });

  it('links each open Pilihan Kelas to a preselected form and closes full ones to Siswa Baru', () => {
    renderHome([
      { pilihanKelas: 'Reguler', kuota: 28, terpakai: 10 },
      { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 20 },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 28 },
    ]);

    const card = (kelas: string) => screen.getByRole('article', { name: kelas });
    expect(
      within(card('Reguler')).getByRole('link', { name: 'Daftar Reguler' }).getAttribute('href'),
    ).toBe('/pendaftaran?kelas=Reguler');
    expect(
      within(card('Bilingual')).getByRole('link', { name: 'Daftar Bilingual' }).getAttribute('href'),
    ).toBe('/pendaftaran?kelas=Bilingual');
    expect(within(card('Tahfizh')).queryByRole('link')).toBeNull();
    expect(within(card('Tahfizh')).getByText('Kuota Siswa Baru penuh')).toBeDefined();
  });

  it('lists program highlights per Pilihan Kelas and the shared school highlights', () => {
    renderHome();

    const card = (kelas: string) => screen.getByRole('article', { name: kelas });
    expect(within(card('Reguler')).getByText('Target hafal Juz 30')).toBeDefined();
    expect(within(card('Bilingual')).getByText('English Camp')).toBeDefined();
    expect(within(card('Bilingual')).queryByText(/Juz/)).toBeNull();
    expect(within(card('Tahfizh')).getByText('Target hafalan 4–5 Juz')).toBeDefined();

    const shared = screen.getByRole('region', { name: 'Di semua Pilihan Kelas' });
    expect(within(shared).getAllByRole('listitem')).toHaveLength(6);
  });

  it('hides class quota status when capacity data is unavailable', () => {
    renderHome(null);

    const section = screen.getByRole('region', { name: 'Pilihan Kelas' });
    expect(within(section).getAllByRole('article')).toHaveLength(3);
    for (const status of ['Tersedia', 'Hampir penuh', 'Penuh']) {
      expect(within(section).queryByText(status)).toBeNull();
    }
    expect(within(section).queryByText(/kursi/)).toBeNull();
  });

  it('lists the four Berkas exactly as the form asks, with NISN mentioned once', () => {
    const { container } = renderHome();

    const section = screen.getByRole('region', { name: 'Biaya dan Berkas' });
    expect(section.getAttribute('id')).toBe('persiapan');
    expect(
      within(section).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['Pembayaran OKB', 'Berkas yang Disiapkan']);
    const berkas = within(section).getByRole('list', { name: 'Daftar Berkas' });
    expect(within(berkas).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Akta Kelahiran',
      'Kartu Keluarga',
      'Pas Foto',
      'Bukti Pembayaran OKB',
    ]);
    expect(within(section).getByText(/foto atau scan/i)).toBeDefined();
    expect(within(section).getByText('SD Plus 3 Al-Muhajirin')).toBeDefined();
    expect(within(section).getByText(/^a\.n\./)).toBeDefined();
    expect(container.textContent?.match(/NISN/g)).toHaveLength(1);
    expect(container.textContent).not.toMatch(/fotokopi/i);
    expect(screen.queryByText('Mengapa Al-Muhajirin?')).toBeNull();
  });

  it('answers the six frequent questions and offers the panitia WhatsApp', () => {
    renderHome();

    const section = screen.getByRole('region', { name: 'Pertanyaan yang Sering Diajukan' });
    expect(section.getAttribute('id')).toBe('faq');
    const questions = within(section)
      .getAllByText((_, element) => element?.tagName === 'SUMMARY')
      .map((summary) => summary.textContent);
    expect(questions).toEqual([
      'Berapa biaya OKB dan ke mana membayarnya?',
      'Kelas apa saja yang bisa dipilih, dan bagaimana kalau kelasnya penuh?',
      'Apakah kelas yang ditempatkan pasti sama dengan pilihan?',
      'Bagaimana jika Berkas yang diunggah salah?',
      'Bukti Pendaftaran hilang, bagaimana?',
      'Berhalangan hadir OKB, bagaimana?',
    ]);
    // The help card shows beside the questions on desktop and inside the closing CTA on mobile.
    expect(within(section).getAllByText('Masih ada pertanyaan?')).toHaveLength(2);
    expect(within(section).getAllByText(/07\.00–17\.00/).length).toBeGreaterThan(0);
    const whatsapp = within(section).getByRole('link', { name: /whatsapp panitia/i });
    expect(whatsapp.getAttribute('href')).toBe('https://wa.me/6281998311470');
    expect(whatsapp.getAttribute('target')).toBe('_blank');
  });

  it('orders the sections from the hero down to the closing CTA', () => {
    renderHome();

    expect(
      within(screen.getByRole('main'))
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Jadwal penting',
      'Alur Pendaftaran',
      'Pilihan Kelas',
      'Biaya dan Berkas',
      'Pertanyaan yang Sering Diajukan',
      'Siap melanjutkan Open Booking Pendaftaran?',
    ]);
  });

  it('alternates white and canvas section backgrounds, each with the same dotted decoration and no glow', () => {
    renderHome();
    const sections = ['alur-title', 'kelas-title', 'persiapan-title', 'faq-title']
      .map((id) => document.getElementById(id)!.closest('section')!);

    expect(sections.map((section) => section.dataset.tone)).toEqual(['white', 'canvas', 'white', 'canvas']);
    for (const section of sections) {
      expect(section.className).toContain(section.dataset.tone === 'white' ? 'bg-white' : 'bg-public-canvas');
      const backdrops = section.querySelectorAll(':scope > [data-section-backdrop]');
      expect(backdrops).toHaveLength(1);
      expect(backdrops[0].querySelector('.blur-3xl')).toBeNull();
    }
  });

  it('closes the FAQ block with the CTA on the same background instead of a separate band', () => {
    renderHome();
    const faq = document.getElementById('faq-title')!.closest('section')!;
    const cta = document.getElementById('cta-title')!.closest('section')!;

    expect(cta.parentElement?.closest('section')).toBe(faq);
    expect(cta.className).not.toMatch(/bg-/);
    expect(cta.querySelector('[data-section-backdrop]')).toBeNull();
  });

  it('closes with a WhatsApp option next to the registration CTA', () => {
    renderHome();

    const cta = screen.getByRole('region', { name: 'Siap melanjutkan Open Booking Pendaftaran?' });
    expect(within(cta).getByRole('link', { name: /mulai pendaftaran/i }).getAttribute('href')).toBe(
      '/pendaftaran',
    );
    expect(within(cta).getByRole('link', { name: /whatsapp/i }).getAttribute('href')).toBe(
      'https://wa.me/6281998311470',
    );
  });

  it('puts the school contact, location, and accreditation in the footer', () => {
    renderHome();

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('Terakreditasi A')).toBeDefined();
    expect(
      within(footer).getByText('Jl. Ipik Gandamanah No. 33, Ciseureuh, Purwakarta, Jawa Barat'),
    ).toBeDefined();
    expect(within(footer).getByText(/07\.00–17\.00/)).toBeDefined();
    expect(within(footer).getByText(/Tahun Pelajaran 2027\/2028/)).toBeDefined();
    const whatsapp = within(footer).getByRole('link', { name: /0819-9831-1470/ });
    expect(whatsapp.getAttribute('href')).toBe('https://wa.me/6281998311470');
    const maps = within(footer).getByRole('link', { name: /buka di google maps/i });
    expect(maps.getAttribute('href')).toMatch(/^https:\/\/www\.google\.com\/maps\/place\/SD\+Plus\+3\+Al-Muhajirin/);
    expect(maps.getAttribute('href')).not.toMatch(/entry=|g_ep=|skid=/);
    expect(maps.getAttribute('target')).toBe('_blank');
  });

  it('repeats the section navigation of the header in the footer', () => {
    renderHome();

    const footer = screen.getByRole('contentinfo');
    const navigation = within(footer).getByRole('navigation', { name: 'Jelajahi' });
    expect(within(navigation).getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Jadwal', '#jadwal'],
      ['Alur', '#alur'],
      ['Kelas', '#kelas'],
      ['Biaya dan Berkas', '#persiapan'],
      ['FAQ', '#faq'],
    ]);
  });

  it('links the school Instagram, Facebook, and TikTok from the footer in a new tab', () => {
    renderHome();

    const footer = screen.getByRole('contentinfo');
    const links = within(footer).getByRole('list', { name: 'Media sosial' });
    expect(within(links).getAllByRole('link').map((link) => [link.getAttribute('aria-label'), link.getAttribute('href')])).toEqual([
      ['Instagram SD Plus 3 Al-Muhajirin', 'https://www.instagram.com/sdplus3almuhajirin'],
      ['Facebook SD Plus 3 Al-Muhajirin', 'https://www.facebook.com/SDPlus3AlMuhajirin'],
      ['TikTok SD Plus 3 Al-Muhajirin', 'https://www.tiktok.com/@sdplus3almuhajirin'],
    ]);
    for (const link of within(links).getAllByRole('link')) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('never uses the word seleksi', () => {
    const { container } = renderHome();

    expect(container.textContent).not.toMatch(/seleksi/i);
  });

  it('speaks the glossary: Berkas instead of dokumen or file, and no promises on full classes', () => {
    const { container } = renderHome();
    const text = container.textContent ?? '';

    expect(text).not.toMatch(/(dokumen|file)/i);
    expect(text).not.toMatch(/berkas/);
    expect(text).not.toMatch(/terbuka kembali|tanpa perlu mendaftar ulang/i);
    expect(screen.getByText(/Admin akan mengunggah Berkas Pengganti/)).toBeDefined();
  });

  it('connects the generated Plus Jakarta font variable to Tailwind tokens', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const globals = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(layout).toContain('variable: "--font-plus-jakarta"');
    expect(globals).toContain('--font-sans: var(--font-plus-jakarta)');
  });
});
