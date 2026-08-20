import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/(public)/page';

describe('SPMB homepage', () => {
  it('keeps the registration page and metadata on academic year 2027/2028', () => {
    const registrationPage = readFileSync(
      join(process.cwd(), 'src/app/(public)/pendaftaran/page.tsx'),
      'utf8',
    );
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');

    expect(registrationPage).toContain('Tahun Ajaran 2027/2028');
    expect(registrationPage).not.toContain('Tahun Ajaran 2026/2027');
    expect(layout).toContain('SPMB Online SD Plus 3 Al-Muhajirin');
  });

  it('presents the approved academic year and key dates', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('2027/2028');
    expect(screen.getByText('1 September–10 Oktober 2026')).toBeDefined();
    expect(screen.getByText('20 Oktober 2026')).toBeDefined();
    expect(screen.getAllByText('Rp370.000').length).toBeGreaterThan(0);
  });

  it('uses a neutral wave label without claiming registration is open', () => {
    render(<Home />);

    expect(screen.getByText('Pendaftaran Gelombang 1')).toBeDefined();
    expect(screen.queryByText('Pendaftaran Gelombang 1 Dibuka')).toBeNull();
  });

  it('keeps the hero and key information inside main', () => {
    render(<Home />);

    const main = screen.getByRole('main');
    const header = screen.getByRole('banner');

    expect(main.contains(header)).toBe(false);
    expect(within(main).getByRole('heading', { level: 1 })).toBeDefined();
    expect(
      within(main).getByText(/Langkah awal menuju pendidikan yang unggul/),
    ).toBeDefined();
    expect(within(main).getByRole('link', { name: /daftar sekarang/i })).toBeDefined();
    expect(within(main).getByRole('link', { name: 'Lihat Informasi' })).toBeDefined();
    expect(within(main).getByText('1 September–10 Oktober 2026')).toBeDefined();
  });

  it('provides logically ordered desktop navigation to homepage sections', () => {
    render(<Home />);

    const navigation = screen.getByRole('navigation', { name: 'Navigasi halaman' });
    expect(
      within(navigation).getAllByRole('link').map((link) => [
        link.textContent,
        link.getAttribute('href'),
      ]),
    ).toEqual([
      ['Informasi', '#informasi'],
      ['Biaya', '#biaya'],
      ['Persyaratan', '#persyaratan'],
    ]);
    expect(document.querySelector('#persyaratan')?.className).toContain('scroll-mt-24');
  });

  it('offers a registration link from the opening section', () => {
    render(<Home />);
    const links = screen.getAllByRole('link', { name: /daftar sekarang/i });
    expect(links.some((link) => link.getAttribute('href') === '/pendaftaran')).toBe(true);
  });

  it('renders account, class totals, installments, discounts, and note', () => {
    render(<Home />);

    expect(screen.getByText('1060017434')).toBeDefined();
    expect(screen.getByText('Program bilingual dan tahfidz')).toBeDefined();
    expect(screen.getAllByText('Rp10.670.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rp10.570.000').length).toBeGreaterThan(0);
    expect(screen.getByText('Rp4.268.000')).toBeDefined();
    expect(screen.getByText('Prestasi tingkat nasional')).toBeDefined();
    expect(
      screen.getByText('Biaya rincian registrasi belum termasuk buku paket.'),
    ).toBeDefined();
  });

  it('renders a semantic desktop fee table with scoped headers', () => {
    render(<Home />);

    const table = screen.getByRole('table', {
      name: 'Rincian biaya pendaftaran Takhossus dan Reguler',
    });
    expect(
      within(table).getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(['Iuran', 'Takhossus', 'Reguler']);
    expect(
      within(table).getAllByRole('rowheader').map((header) =>
        header.textContent?.replace(/\s+/g, ' ').trim(),
      ),
    ).toEqual([
      'Infak rutin bulanan',
      'Kelas Takhossus bulanan',
      'Sarana dan prasarana',
      'Kegiatan kesiswaan',
      'Buku Lail, Kalender, dan Terbitan Muhajirin',
      'Seragam sekolah dan atribut Pramuka, merah putih, kotak-kotak, batik biru, pangsi/celana sarung (putra), kebaya (putri), olahraga, topi dua buah, dasi, tiga pasang kaos kaki, kerudung/peci dan sarung, kacu, ring, serta badge.',
      'Uang bangunan',
      'Infak masjid',
      'Jumlah total',
    ]);
    expect(table.querySelector('thead')).not.toBeNull();
    expect(table.querySelector('tbody')).not.toBeNull();
    expect(table.querySelector('tfoot')).not.toBeNull();
    expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(3);
    expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(9);
  });

  it('uses the approved high-contrast colors for primary homepage actions and discounts', () => {
    render(<Home />);

    const primaryActions = screen.getAllByRole('link', { name: /daftar sekarang/i });
    expect(primaryActions).toHaveLength(2);
    for (const action of primaryActions) {
      expect(action.className).toContain('bg-[#007A10]');
      expect(action.className).toContain('hover:bg-[#00550B]');
      expect(action.className).toContain('text-white');
    }

    for (const discount of ['Diskon 10%', 'Diskon 30%', 'Diskon 50%']) {
      const pill = screen.getByText(discount);
      expect(pill.className).toContain('bg-amber-200');
      expect(pill.className).toContain('text-amber-950');
    }
  });

  it('uses accessible colors for small homepage labels', () => {
    render(<Home />);

    for (const label of [
      'Informasi Pembayaran',
      'Persiapan Pendaftaran',
      'Mengapa Al-Muhajirin?',
    ]) {
      expect(screen.getByText(label).className).toContain('text-[#007A10]');
    }

    for (const label of ['Takhossus', 'Reguler']) {
      const definitionTerms = screen
        .getAllByText(label)
        .filter((element) => element.tagName === 'DT');

      expect(definitionTerms.length).toBeGreaterThan(0);
      for (const term of definitionTerms) {
        expect(term.className).toContain('text-gray-600');
        expect(term.className).not.toContain('text-gray-400');
      }
    }

    for (const percentage of ['(30%)', '(40%)']) {
      for (const label of screen.getAllByText(percentage)) {
        expect(label.className).toContain('text-[#007A10]');
      }
    }
  });

  it('connects the generated Plus Jakarta font variable to Tailwind tokens', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const globals = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(layout).toContain('variable: "--font-plus-jakarta"');
    expect(layout).toContain('plusJakartaSans.className');
    expect(globals).toContain('--font-sans: var(--font-plus-jakarta)');
    expect(globals).toContain(
      '--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    );
    expect(globals).not.toContain('--font-geist');
  });

  it('shows every preparation item and school highlight', () => {
    render(<Home />);

    for (const item of [
      'Fotokopi akta lahir',
      'Fotokopi kartu keluarga',
      'Nomor NISN',
      'Pas foto ukuran 3×4',
    ]) {
      expect(screen.getByText(item)).toBeDefined();
    }

    expect(screen.getByText('Kurikulum Unggulan')).toBeDefined();
    expect(screen.getByText('Tenaga Pendidik Profesional')).toBeDefined();
    expect(screen.getByText('Fasilitas Modern')).toBeDefined();
  });
});
