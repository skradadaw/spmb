# Homepage Registration Information Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun halaman depan SPMB 2027/2028 yang modern, responsif, dan konsisten dengan formulir pendaftaran, dengan informasi jadwal, pembayaran, biaya, cicilan, diskon, persyaratan, serta CTA yang lengkap.

**Architecture:** `src/app/(public)/page.tsx` tetap menjadi Server Component tipis yang menyusun komponen-komponen statis di `src/features/home/components`. Semua konten resmi disimpan dalam satu modul data bertipe agar nominal dan tanggal mudah diubah, sedangkan akses Clipboard API diisolasi dalam satu Client Component kecil. Styling memakai utilitas Tailwind CSS 4 yang sudah tersedia dan mengikuti warna serta bentuk halaman formulir.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript 5, Tailwind CSS 4, Lucide React, Vitest, React Testing Library, jsdom.

## Global Constraints

- Tahun ajaran yang tampil di homepage dan formulir harus `2027/2028`.
- Homepage hanya menampilkan Gelombang 1: `1 September–10 Oktober 2026`.
- Tes OKB Gelombang 1 harus tampil sebagai `20 Oktober 2026`.
- Biaya OKB harus `Rp370.000` dan rekening Bank Muamalat harus `1060017434`.
- Takhossus harus dijelaskan sebagai program bilingual dan tahfidz.
- Semua biaya, cicilan, diskon, persyaratan, dan catatan buku paket harus sesuai spesifikasi desain.
- Tiga keunggulan sekolah lama tetap ditampilkan.
- Homepage tetap Server Component; hanya tombol salin rekening yang memakai `'use client'`.
- Tidak menambahkan backend, CMS, pembayaran daring, atau Gelombang 2.
- Gunakan `next/link` untuk navigasi internal dan pertahankan tujuan CTA `/pendaftaran`.
- Ikuti panduan lokal Next.js di `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`, `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`, dan `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
- Gunakan build Webpack resmi (`next build --webpack`) karena Turbopack tidak dapat membuat proses/port di lingkungan eksekusi proyek ini.

## File Structure

- Create `src/features/home/data.ts`: tipe dan satu sumber data resmi homepage.
- Create `src/features/home/components/CopyAccountButton.tsx`: satu-satunya Client Component, menangani Clipboard API dan status aksesibel.
- Create `src/features/home/components/HomeHero.tsx`: header, hero, dan ringkasan jadwal penting.
- Create `src/features/home/components/PaymentInformation.tsx`: rekening, tabel biaya, cicilan, diskon, dan catatan.
- Create `src/features/home/components/RegistrationPreparation.tsx`: checklist dokumen dan tiga keunggulan sekolah.
- Modify `src/app/(public)/page.tsx`: komposisi section, CTA penutup, dan footer.
- Modify `src/app/(public)/pendaftaran/page.tsx`: koreksi tahun ajaran.
- Modify `src/app/layout.tsx`: metadata SPMB dan deskripsi homepage.
- Modify `src/app/globals.css`: perilaku scroll dan reduced motion global yang aman.
- Create `src/features/home/__tests__/data.test.ts`: validasi konten dan total pembayaran.
- Create `src/features/home/__tests__/CopyAccountButton.test.tsx`: pengujian Clipboard API.
- Create `src/features/home/__tests__/page.test.tsx`: pengujian integrasi konten dan CTA.
- Create `src/test/setup.ts`: pembersihan DOM setelah tiap test.
- Create `vitest.config.mts`: konfigurasi Vitest untuk React, jsdom, dan alias TypeScript.
- Modify `package.json` dan `package-lock.json`: scripts serta dev dependencies pengujian.

---

### Task 0: Pulihkan Baseline Lint dan Build

**Files:**
- Modify: `package.json`
- Modify: `src/app/(public)/pendaftaran/page.tsx`
- Modify: `src/features/registration/actions.ts`
- Modify: `src/features/registration/components/ConfirmationModal.tsx`
- Modify: `src/features/registration/components/DocumentPreviewModal.tsx`
- Modify: `src/features/registration/components/DocumentUploadCard.tsx`
- Modify: `src/features/registration/components/RegistrationForm.tsx`
- Modify: `src/features/registration/utils/upload.ts`

**Root causes already reproduced:**
- `npm run lint` fails on six `no-explicit-any` errors. The explicit `any` values bypass safe narrowing for caught errors, React Hook Form field names, and `FieldErrors<FormData>`.
- Warnings come from obsolete imports/handlers, an unused catch binding, tuple destructuring, raw `<img>` previews, and React Hook Form's `watch()` API being incompatible with compiler memoization.
- `npm run build` reaches a Turbopack panic because this environment forbids its PostCSS worker from binding a port. `npx next build --webpack` compiles, typechecks, and prerenders `/` and `/pendaftaran` successfully.

**Required implementation:**
- Preserve all registration behavior while replacing caught-error `any` values with `unknown` plus `instanceof Error` narrowing.
- Type numeric fields as an explicit `NumericField` union, validated field lists as `Array<keyof FormData>`, and submission errors as `FieldErrors<FormData>`.
- Replace React Hook Form `watch()` subscriptions with `useWatch({ control })` equivalents.
- Remove only demonstrably unused imports, catch bindings, and obsolete upload handlers.
- Replace both raw image preview elements with `next/image` using explicit dimensions and `unoptimized` for blob URLs.
- Replace `([_, file])` with `([, file])`.
- Change the build script to `next build --webpack`; do not change the dev script.

- [ ] **Step 1: Record RED evidence**

Run `npm run lint` and confirm 6 errors; run `npm run build` and confirm the Turbopack port-permission failure. These failures have already been captured during baseline investigation.

- [ ] **Step 2: Apply the smallest type-safe and warning cleanup**

Do not change validation rules, upload flow, form fields, navigation, or user-facing copy. Use this error narrowing pattern wherever a caught error message is needed:

```ts
const message = error instanceof Error ? error.message : fallbackMessage;
```

Use React Hook Form types and subscriptions:

```ts
import { useForm, Controller, useWatch, type FieldErrors } from 'react-hook-form';

type NumericField = 'nik' | 'nisn' | 'rt' | 'rw' | 'nikAyah' | 'nikIbu';

const provinsiVal = useWatch({ control, name: 'provinsi' });
const formValues = useWatch({ control });
const onFormError = (formErrors: FieldErrors<FormData>) => { /* retain existing behavior */ };
```

Use Next Image for blob previews:

```tsx
import Image from 'next/image';

<Image src={previewUrl} alt={title} width={1200} height={900} unoptimized />
```

- [ ] **Step 3: Verify GREEN evidence**

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all commands exit 0; lint has no errors or warnings; build identifies Webpack and prerenders `/` plus `/pendaftaran`.

- [ ] **Step 4: Commit the baseline repair**

```bash
git add package.json src/app/'(public)'/pendaftaran/page.tsx src/features/registration
git commit -m "fix: restore clean lint and build baseline"
```

---

### Task 1: Test Harness dan Kontrak Data Resmi

**Files:**
- Create: `vitest.config.mts`
- Create: `src/test/setup.ts`
- Create: `src/features/home/__tests__/data.test.ts`
- Create: `src/features/home/data.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `registrationInfo`, `FeeItem`, `Installment`, dan `DiscountGroup` dari `@/features/home/data`.
- `registrationInfo` menjadi satu-satunya sumber konten untuk semua komponen homepage berikutnya.

- [ ] **Step 1: Pasang test runner resmi yang direkomendasikan dokumentasi lokal Next.js**

Run:

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

Expected: `package.json` dan `package-lock.json` memuat dev dependencies tersebut tanpa mengubah dependency produksi.

- [ ] **Step 2: Tambahkan scripts test ke `package.json`**

Tambahkan dua script berikut tanpa mengubah script yang sudah ada:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 3: Buat konfigurasi Vitest dan setup cleanup**

Create `vitest.config.mts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Tulis failing test untuk data resmi dan aritmetika cicilan**

Create `src/features/home/__tests__/data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { registrationInfo } from '@/features/home/data';

const rupiahToNumber = (value: string) =>
  Number(value.replace(/[^0-9]/g, ''));

describe('registrationInfo', () => {
  it('contains the approved wave, OKB, and account data', () => {
    expect(registrationInfo.academicYear).toBe('2027/2028');
    expect(registrationInfo.wave.period).toBe('1 September–10 Oktober 2026');
    expect(registrationInfo.wave.testDate).toBe('20 Oktober 2026');
    expect(registrationInfo.okb.fee).toBe('Rp370.000');
    expect(registrationInfo.okb.bank).toBe('Bank Muamalat');
    expect(registrationInfo.okb.accountNumber).toBe('1060017434');
  });

  it('keeps installment totals equal to each class total', () => {
    const takhossus = registrationInfo.installments.reduce(
      (sum, item) => sum + rupiahToNumber(item.takhossus),
      0,
    );
    const regular = registrationInfo.installments.reduce(
      (sum, item) => sum + rupiahToNumber(item.regular),
      0,
    );

    expect(takhossus).toBe(10_670_000);
    expect(regular).toBe(10_570_000);
  });

  it('contains every requirement and discount tier', () => {
    expect(registrationInfo.requirements).toEqual([
      'Fotokopi akta lahir',
      'Fotokopi kartu keluarga',
      'Nomor NISN',
      'Pas foto ukuran 3×4',
    ]);
    expect(registrationInfo.discounts.map((item) => item.percentage)).toEqual([
      '10%',
      '30%',
      '50%',
    ]);
  });
});
```

- [ ] **Step 5: Jalankan test untuk membuktikan kegagalan awal**

Run:

```bash
npm run test:run -- src/features/home/__tests__/data.test.ts
```

Expected: FAIL karena modul `@/features/home/data` belum ada.

- [ ] **Step 6: Implementasikan modul data bertipe**

Create `src/features/home/data.ts`:

```ts
export type FeeItem = {
  label: string;
  takhossus: string;
  regular: string;
  detail?: string;
};

export type Installment = {
  stage: string;
  timing: string;
  percentage: string;
  takhossus: string;
  regular: string;
};

export type DiscountGroup = {
  percentage: string;
  criteria: readonly string[];
};

export const registrationInfo = {
  academicYear: '2027/2028',
  wave: {
    name: 'Gelombang 1',
    period: '1 September–10 Oktober 2026',
    testDate: '20 Oktober 2026',
  },
  okb: {
    fee: 'Rp370.000',
    bank: 'Bank Muamalat',
    accountNumber: '1060017434',
  },
  classPrograms: {
    takhossus: 'Program bilingual dan tahfidz',
    regular: 'Program pembelajaran reguler',
  },
  fees: [
    { label: 'Infak rutin bulanan', takhossus: 'Rp620.000', regular: 'Rp620.000' },
    { label: 'Kelas Takhossus bulanan', takhossus: 'Rp100.000', regular: '—' },
    { label: 'Sarana dan prasarana', takhossus: 'Rp2.500.000', regular: 'Rp2.500.000' },
    { label: 'Kegiatan kesiswaan', takhossus: 'Rp2.050.000', regular: 'Rp2.050.000' },
    { label: 'Buku Lail, Kalender, dan Terbitan Muhajirin', takhossus: 'Rp250.000', regular: 'Rp250.000' },
    {
      label: 'Seragam sekolah dan atribut',
      takhossus: 'Rp1.550.000',
      regular: 'Rp1.550.000',
      detail: 'Pramuka, merah putih, kotak-kotak, batik biru, pangsi/celana sarung (putra), kebaya (putri), olahraga, topi, dasi, kaos kaki, kerudung/peci dan sarung, kacu, ring, serta badge.',
    },
    { label: 'Uang bangunan', takhossus: 'Rp3.500.000', regular: 'Rp3.500.000' },
    { label: 'Infak masjid', takhossus: 'Rp100.000', regular: 'Rp100.000' },
  ] satisfies FeeItem[],
  totals: {
    takhossus: 'Rp10.670.000',
    regular: 'Rp10.570.000',
  },
  installments: [
    { stage: 'I', timing: '1 minggu setelah dinyatakan lulus', percentage: '30%', takhossus: 'Rp3.201.000', regular: 'Rp3.171.000' },
    { stage: 'II', timing: '1 bulan setelah pembayaran pertama', percentage: '40%', takhossus: 'Rp4.268.000', regular: 'Rp4.228.000' },
    { stage: 'III', timing: 'Pembayaran sebelum masuk', percentage: '30%', takhossus: 'Rp3.201.000', regular: 'Rp3.171.000' },
  ] satisfies Installment[],
  discounts: [
    { percentage: '10%', criteria: ['Prestasi tingkat kabupaten', 'Adik/kakak satu jenjang Yayasan Al-Muhajirin', 'Pelunasan sesuai bulan Tes OKB'] },
    { percentage: '30%', criteria: ['Alumni Al-Muhajirin', 'Prestasi tingkat provinsi'] },
    { percentage: '50%', criteria: ['Prestasi tingkat nasional'] },
  ] satisfies DiscountGroup[],
  requirements: [
    'Fotokopi akta lahir',
    'Fotokopi kartu keluarga',
    'Nomor NISN',
    'Pas foto ukuran 3×4',
  ],
  registrationNote: 'Biaya rincian registrasi belum termasuk buku paket.',
} as const;
```

- [ ] **Step 7: Jalankan test data sampai lulus**

Run:

```bash
npm run test:run -- src/features/home/__tests__/data.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 8: Commit test harness dan data**

```bash
git add package.json package-lock.json vitest.config.mts src/test/setup.ts src/features/home/data.ts src/features/home/__tests__/data.test.ts
git commit -m "test(home): add registration data contract"
```

---

### Task 2: Tombol Salin Rekening yang Terisolasi dan Aksesibel

**Files:**
- Create: `src/features/home/__tests__/CopyAccountButton.test.tsx`
- Create: `src/features/home/components/CopyAccountButton.tsx`

**Interfaces:**
- Consumes: prop `accountNumber: string` dari komponen rekening.
- Produces: `CopyAccountButton({ accountNumber }: { accountNumber: string }): JSX.Element`.

- [ ] **Step 1: Tulis failing tests untuk jalur clipboard berhasil dan gagal**

Create `src/features/home/__tests__/CopyAccountButton.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CopyAccountButton from '@/features/home/components/CopyAccountButton';

describe('CopyAccountButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('copies the account number and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<CopyAccountButton accountNumber="1060017434" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('1060017434'));
    expect(screen.getByRole('status').textContent).toContain('Berhasil disalin');
  });

  it('asks for manual copy without reporting false success', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });

    render(<CopyAccountButton accountNumber="1060017434" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening' }));

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Silakan salin manual'),
    );
    expect(screen.queryByText('Berhasil disalin')).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test untuk membuktikan komponen belum tersedia**

Run:

```bash
npm run test:run -- src/features/home/__tests__/CopyAccountButton.test.tsx
```

Expected: FAIL karena `CopyAccountButton` belum ada.

- [ ] **Step 3: Implementasikan Client Component clipboard**

Create `src/features/home/components/CopyAccountButton.tsx`:

```tsx
'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type CopyState = 'idle' | 'success' | 'error';

export default function CopyAccountButton({
  accountNumber,
}: {
  accountNumber: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopyState('success');
      window.setTimeout(() => setCopyState('idle'), 2_000);
    } catch {
      setCopyState('error');
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin nomor rekening"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#007A10] shadow-sm ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copyState === 'success' ? <Check size={17} /> : <Copy size={17} />}
        {copyState === 'success' ? 'Berhasil disalin' : 'Salin rekening'}
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-emerald-50">
        {copyState === 'success' && 'Berhasil disalin ke clipboard.'}
        {copyState === 'error' && 'Clipboard tidak tersedia. Silakan salin manual.'}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Jalankan test komponen sampai lulus**

Run:

```bash
npm run test:run -- src/features/home/__tests__/CopyAccountButton.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit komponen clipboard**

```bash
git add src/features/home/components/CopyAccountButton.tsx src/features/home/__tests__/CopyAccountButton.test.tsx
git commit -m "feat(home): add accessible account copy button"
```

---

### Task 3: Header, Hero, dan Jadwal Penting

**Files:**
- Create: `src/features/home/components/HomeHero.tsx`
- Test: `src/features/home/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `registrationInfo.academicYear`, `registrationInfo.wave`, dan `registrationInfo.okb.fee`.
- Produces: `HomeHero(): JSX.Element`, termasuk landmark header, heading level 1, anchor `#informasi`, dan CTA `/pendaftaran`.

- [ ] **Step 1: Tulis test kontrak hero sebelum mengganti homepage**

Create `src/features/home/__tests__/page.test.tsx` dengan test awal:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/(public)/page';

describe('SPMB homepage', () => {
  it('presents the approved academic year and key dates', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('2027/2028');
    expect(screen.getByText('1 September–10 Oktober 2026')).toBeDefined();
    expect(screen.getByText('20 Oktober 2026')).toBeDefined();
    expect(screen.getByText('Rp370.000')).toBeDefined();
  });

  it('offers a registration link from the opening section', () => {
    render(<Home />);
    const links = screen.getAllByRole('link', { name: /daftar sekarang/i });
    expect(links.some((link) => link.getAttribute('href') === '/pendaftaran')).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan test hero untuk membuktikan konten lama gagal**

Run:

```bash
npm run test:run -- src/features/home/__tests__/page.test.tsx
```

Expected: FAIL karena heading lama tidak memuat `2027/2028` dan jadwal resmi belum tampil.

- [ ] **Step 3: Buat `HomeHero` dengan struktur semantik final**

Implementasikan `src/features/home/components/HomeHero.tsx` dengan elemen berikut:

```tsx
import Link from 'next/link';
import { ArrowRight, CalendarDays, ClipboardCheck, GraduationCap, WalletCards } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

const keyFacts = [
  { label: registrationInfo.wave.name, value: registrationInfo.wave.period, icon: CalendarDays },
  { label: 'Tes OKB', value: registrationInfo.wave.testDate, icon: ClipboardCheck },
  { label: 'Biaya OKB', value: registrationInfo.okb.fee, icon: WalletCards },
] as const;

export default function HomeHero() {
  return (
    <>
      <header className="relative z-20 border-b border-emerald-900/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#atas" className="flex items-center gap-3" aria-label="SD Plus 3 Al-Muhajirin - kembali ke atas">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00AA13] text-white shadow-md shadow-emerald-600/20"><GraduationCap size={23} /></span>
            <span><span className="block text-sm font-black text-gray-950 sm:text-base">SD Plus 3 Al-Muhajirin</span><span className="block text-[11px] font-semibold text-gray-500 sm:text-xs">SPMB {registrationInfo.academicYear}</span></span>
          </a>
          <Link href="/pendaftaran" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00AA13] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-[#00880F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00AA13] sm:px-6">Daftar Sekarang <ArrowRight size={17} /></Link>
        </div>
      </header>

      <section id="atas" className="relative overflow-hidden bg-gradient-to-b from-[#F3FAF4] via-[#F8FAF8] to-white px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        <div aria-hidden="true" className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#007A10] shadow-sm"><span className="h-2 w-2 rounded-full bg-[#00AA13]" />Pendaftaran Gelombang 1 Dibuka</p>
          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-7xl">Seleksi Penerimaan Murid Baru <span className="text-[#00AA13]">{registrationInfo.academicYear}</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">Langkah awal menuju pendidikan yang unggul, berkarakter Islami, dan bertumbuh bersama potensi terbaik anak.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/pendaftaran" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00AA13] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-[#00880F]">Daftar Sekarang <ArrowRight size={18} /></Link><a href="#informasi" className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-[#007A10]">Lihat Informasi</a></div>
          <div id="informasi" className="mt-12 grid scroll-mt-24 gap-4 text-left md:grid-cols-3">
            {keyFacts.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-3xl border border-gray-100 bg-white/95 p-5 shadow-lg shadow-gray-200/50"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00AA13]/10 text-[#00AA13]"><Icon size={21} /></span><p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</p><p className="mt-2 text-lg font-black text-gray-950">{value}</p></article>)}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Integrasikan sementara `HomeHero` ke halaman**

Ganti isi `src/app/(public)/page.tsx` sementara dengan:

```tsx
import HomeHero from '@/features/home/components/HomeHero';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <HomeHero />
    </div>
  );
}
```

- [ ] **Step 5: Jalankan test hero sampai lulus dan commit**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: 2 tests PASS.

```bash
git add src/app/'(public)'/page.tsx src/features/home/components/HomeHero.tsx src/features/home/__tests__/page.test.tsx
git commit -m "feat(home): add SPMB hero and key dates"
```

---

### Task 4: Informasi Rekening, Biaya, Cicilan, dan Diskon

**Files:**
- Create: `src/features/home/components/PaymentInformation.tsx`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/features/home/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: seluruh `registrationInfo.okb`, `fees`, `totals`, `installments`, `discounts`, dan `registrationNote`; `CopyAccountButton` menerima nomor rekening.
- Produces: `PaymentInformation(): JSX.Element` dengan section `#biaya`, tabel desktop, kartu mobile, serta status clipboard.

- [ ] **Step 1: Tambahkan failing test informasi pembayaran**

Tambahkan ke suite `SPMB homepage`:

```tsx
it('renders account, class totals, installments, discounts, and note', () => {
  render(<Home />);

  expect(screen.getByText('1060017434')).toBeDefined();
  expect(screen.getByText('Program bilingual dan tahfidz')).toBeDefined();
  expect(screen.getAllByText('Rp10.670.000').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Rp10.570.000').length).toBeGreaterThan(0);
  expect(screen.getByText('Rp4.268.000')).toBeDefined();
  expect(screen.getByText('Prestasi tingkat nasional')).toBeDefined();
  expect(screen.getByText('Biaya rincian registrasi belum termasuk buku paket.')).toBeDefined();
});
```

- [ ] **Step 2: Jalankan test untuk membuktikan section pembayaran belum ada**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: test baru FAIL pada nomor rekening.

- [ ] **Step 3: Implementasikan `PaymentInformation`**

Buat section dengan urutan dan markup semantik berikut:

```tsx
import { BadgePercent, Building2, CreditCard, Info, Landmark } from 'lucide-react';
import CopyAccountButton from './CopyAccountButton';
import { registrationInfo } from '@/features/home/data';

export default function PaymentInformation() {
  return (
    <section id="biaya" aria-labelledby="payment-title" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#00AA13]">Informasi Pembayaran</p><h2 id="payment-title" className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Rincian transparan untuk persiapan yang tenang</h2><p className="mt-4 leading-7 text-gray-600">Pelajari biaya, skema cicilan, dan potongan uang bangunan sebelum mengisi formulir.</p></div>

        <article className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#00550B] via-[#007A10] to-[#00A315] p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="flex items-center gap-2 text-sm font-bold text-emerald-100"><Landmark size={18} /> Pembayaran OKB</p><p className="mt-3 text-sm text-emerald-100">{registrationInfo.okb.bank}</p><p className="mt-1 select-all font-mono text-3xl font-black tracking-wider sm:text-4xl">{registrationInfo.okb.accountNumber}</p><p className="mt-3 text-sm text-emerald-50">Nominal transfer: <strong>{registrationInfo.okb.fee}</strong></p></div><CopyAccountButton accountNumber={registrationInfo.okb.accountNumber} /></div></article>

        <div className="mt-12 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50"><div className="grid bg-gray-950 px-5 py-5 text-white sm:grid-cols-[1fr_190px_190px] sm:px-7"><h3 className="font-black">Rincian iuran</h3><p className="hidden text-center text-sm font-bold sm:block">Takhossus</p><p className="hidden text-center text-sm font-bold sm:block">Reguler</p></div><div className="divide-y divide-gray-100">{registrationInfo.fees.map((item) => <div key={item.label} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_190px_190px] sm:items-center sm:px-7"><div><p className="font-semibold text-gray-900">{item.label}</p>{'detail' in item && item.detail && <p className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</p>}</div><div className="flex justify-between sm:block sm:text-center"><span className="text-xs font-bold text-gray-400 sm:hidden">Takhossus</span><span className="font-bold text-gray-900">{item.takhossus}</span></div><div className="flex justify-between sm:block sm:text-center"><span className="text-xs font-bold text-gray-400 sm:hidden">Reguler</span><span className="font-bold text-gray-900">{item.regular}</span></div></div>)}</div><div className="grid gap-3 bg-emerald-50 px-5 py-5 sm:grid-cols-[1fr_190px_190px] sm:items-center sm:px-7"><p className="font-black text-gray-950">Jumlah total</p><p className="flex justify-between text-lg font-black text-[#007A10] sm:block sm:text-center"><span className="text-xs sm:hidden">Takhossus</span>{registrationInfo.totals.takhossus}</p><p className="flex justify-between text-lg font-black text-[#007A10] sm:block sm:text-center"><span className="text-xs sm:hidden">Reguler</span>{registrationInfo.totals.regular}</p></div></div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><article className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6"><p className="flex items-center gap-2 text-sm font-black text-[#007A10]"><Building2 size={18} /> Kelas Takhossus</p><p className="mt-2 text-sm text-gray-600">{registrationInfo.classPrograms.takhossus}</p></article><article className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6"><p className="flex items-center gap-2 text-sm font-black text-sky-800"><CreditCard size={18} /> Kelas Reguler</p><p className="mt-2 text-sm text-gray-600">{registrationInfo.classPrograms.regular}</p></article></div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/40 sm:p-8"><h3 className="text-xl font-black text-gray-950">Jadwal pembayaran</h3><div className="mt-5 space-y-4">{registrationInfo.installments.map((item) => <div key={item.stage} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-black text-gray-950">Tahap {item.stage} <span className="text-[#00AA13]">({item.percentage})</span></p><p className="mt-1 text-xs leading-5 text-gray-500">{item.timing}</p></div></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs font-bold text-gray-400">Takhossus</dt><dd className="mt-1 font-black">{item.takhossus}</dd></div><div><dt className="text-xs font-bold text-gray-400">Reguler</dt><dd className="mt-1 font-black">{item.regular}</dd></div></dl></div>)}</div></article><article className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6 shadow-lg shadow-amber-100/30 sm:p-8"><h3 className="flex items-center gap-2 text-xl font-black text-gray-950"><BadgePercent className="text-amber-600" /> Diskon uang bangunan</h3><div className="mt-5 space-y-5">{registrationInfo.discounts.map((discount) => <div key={discount.percentage}><p className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white">Diskon {discount.percentage}</p><ul className="mt-3 space-y-2">{discount.criteria.map((criterion) => <li key={criterion} className="flex gap-2 text-sm leading-6 text-gray-700"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{criterion}</li>)}</ul></div>)}</div></article></div>

        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-950"><Info className="mt-0.5 shrink-0 text-blue-600" size={18} /><span>{registrationInfo.registrationNote}</span></p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Render `PaymentInformation` setelah `HomeHero`**

Tambahkan import dan `<PaymentInformation />` pada `src/app/(public)/page.tsx`.

- [ ] **Step 5: Jalankan seluruh test homepage dan commit**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx src/features/home/__tests__/CopyAccountButton.test.tsx`.

Expected: 5 tests PASS.

```bash
git add src/app/'(public)'/page.tsx src/features/home/components/PaymentInformation.tsx src/features/home/__tests__/page.test.tsx
git commit -m "feat(home): add complete payment information"
```

---

### Task 5: Persyaratan, Keunggulan Sekolah, CTA, dan Footer

**Files:**
- Create: `src/features/home/components/RegistrationPreparation.tsx`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/features/home/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `registrationInfo.requirements`.
- Produces: `RegistrationPreparation(): JSX.Element`, `SchoolHighlights(): JSX.Element`, dan homepage lengkap dengan CTA akhir.

- [ ] **Step 1: Tambahkan failing test untuk persyaratan dan konten lama yang wajib dipertahankan**

Tambahkan ke test homepage:

```tsx
it('shows every preparation item and school highlight', () => {
  render(<Home />);

  for (const item of ['Fotokopi akta lahir', 'Fotokopi kartu keluarga', 'Nomor NISN', 'Pas foto ukuran 3×4']) {
    expect(screen.getByText(item)).toBeDefined();
  }

  expect(screen.getByText('Kurikulum Unggulan')).toBeDefined();
  expect(screen.getByText('Tenaga Pendidik Profesional')).toBeDefined();
  expect(screen.getByText('Fasilitas Modern')).toBeDefined();
});
```

- [ ] **Step 2: Jalankan test untuk membuktikan section persiapan belum ada**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: test baru FAIL pada persyaratan pertama.

- [ ] **Step 3: Implementasikan persyaratan dan keunggulan**

Create `src/features/home/components/RegistrationPreparation.tsx`:

```tsx
import { BookOpen, Check, GraduationCap, Users } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

const highlights = [
  { title: 'Kurikulum Unggulan', description: 'Perpaduan kurikulum nasional dan nilai-nilai Islami yang komprehensif.', icon: GraduationCap, tone: 'bg-emerald-50 text-[#00AA13] border-emerald-100' },
  { title: 'Tenaga Pendidik Profesional', description: 'Guru berpengalaman yang berdedikasi membimbing setiap potensi anak.', icon: Users, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
  { title: 'Fasilitas Modern', description: 'Lingkungan belajar yang nyaman, aman, dan dilengkapi teknologi terkini.', icon: BookOpen, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
] as const;

export default function RegistrationPreparation() {
  return (
    <section aria-labelledby="requirements-title" className="bg-gradient-to-b from-[#F8FAF8] to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#00AA13]">Persiapan Pendaftaran</p><h2 id="requirements-title" className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Siapkan data sebelum mulai mengisi</h2><p className="mt-4 leading-7 text-gray-600">Dokumen yang lengkap membuat proses pengisian formulir lebih cepat dan nyaman.</p></div><div className="grid gap-4 sm:grid-cols-2">{registrationInfo.requirements.map((item, index) => <article key={item} className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/40"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00AA13]/10 text-[#00AA13]"><Check size={20} strokeWidth={3} /></span><div><p className="text-xs font-bold text-gray-400">0{index + 1}</p><p className="mt-1 font-bold text-gray-900">{item}</p></div></article>)}</div></div>

      <div className="mt-20 text-center"><p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#00AA13]">Mengapa Al-Muhajirin?</p><h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Lingkungan terbaik untuk tumbuh</h2><div className="mt-10 grid gap-5 text-left md:grid-cols-3">{highlights.map(({ title, description, icon: Icon, tone }) => <article key={title} className={`rounded-3xl border p-6 ${tone}`}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"><Icon size={23} /></span><h3 className="mt-5 text-lg font-black text-gray-950">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></article>)}</div></div></div></section>
  );
}
```

- [ ] **Step 4: Lengkapi komposisi homepage dengan CTA dan footer**

Ganti `src/app/(public)/page.tsx` dengan komposisi final:

```tsx
import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import HomeHero from '@/features/home/components/HomeHero';
import PaymentInformation from '@/features/home/components/PaymentInformation';
import RegistrationPreparation from '@/features/home/components/RegistrationPreparation';
import { registrationInfo } from '@/features/home/data';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <HomeHero />
      <main>
        <PaymentInformation />
        <RegistrationPreparation />
        <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00550B] via-[#007A10] to-[#00A315] px-6 py-12 text-center text-white shadow-2xl shadow-emerald-900/20 sm:px-10 sm:py-16"><FileCheck2 className="mx-auto text-emerald-200" size={38} /><h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Sudah siap mendaftarkan putra-putri Anda?</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">Pastikan dokumen telah disiapkan, lalu isi formulir SPMB {registrationInfo.academicYear} dengan data yang benar.</p><Link href="/pendaftaran" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-black text-[#007A10] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Mulai Pendaftaran <ArrowRight size={18} /></Link></div></section>
      </main>
      <footer className="border-t border-gray-100 bg-gray-950 px-4 py-10 text-center text-sm text-gray-400"><p className="font-bold text-white">SD Plus 3 Al-Muhajirin</p><p className="mt-2">SPMB Tahun Ajaran {registrationInfo.academicYear}</p></footer>
    </div>
  );
}
```

- [ ] **Step 5: Jalankan test halaman lengkap dan commit**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: 4 tests PASS.

```bash
git add src/app/'(public)'/page.tsx src/features/home/components/RegistrationPreparation.tsx src/features/home/__tests__/page.test.tsx
git commit -m "feat(home): add preparation and school highlights"
```

---

### Task 6: Konsistensi Tahun Ajaran, Metadata, dan Gerak Global

**Files:**
- Modify: `src/app/(public)/pendaftaran/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/features/home/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: keputusan resmi tahun ajaran 2027/2028.
- Produces: metadata SPMB konsisten dan perilaku anchor/reduced-motion yang berlaku di seluruh aplikasi.

- [ ] **Step 1: Tambahkan assertion metadata dan tahun formulir melalui test sumber**

Tambahkan test berikut ke `page.test.tsx`:

```tsx
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

it('keeps the registration page and metadata on academic year 2027/2028', () => {
  const registrationPage = readFileSync(join(process.cwd(), 'src/app/(public)/pendaftaran/page.tsx'), 'utf8');
  const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');

  expect(registrationPage).toContain('Tahun Ajaran 2027/2028');
  expect(registrationPage).not.toContain('Tahun Ajaran 2026/2027');
  expect(layout).toContain('SPMB Online SD Plus 3 Al-Muhajirin');
});
```

- [ ] **Step 2: Jalankan test dan konfirmasi kegagalan tahun lama**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: FAIL karena halaman formulir masih memuat `2026/2027` dan metadata masih memakai `PPDB`.

- [ ] **Step 3: Koreksi tahun ajaran dan metadata**

Di `src/app/(public)/pendaftaran/page.tsx`, ubah hanya:

```tsx
<span>Tahun Ajaran 2027/2028</span>
```

Di `src/app/layout.tsx`, gunakan:

```ts
export const metadata: Metadata = {
  title: 'SPMB Online SD Plus 3 Al-Muhajirin',
  description: 'Informasi dan formulir Seleksi Penerimaan Murid Baru SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028.',
};
```

- [ ] **Step 4: Tambahkan scroll halus dan reduced-motion ke CSS global**

Hapus media query dark mode yang mengubah `--background` menjadi hitam, lalu tambahkan:

```css
html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

::selection {
  background: rgb(0 170 19 / 20%);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Jalankan test dan commit konsistensi**

Run `npm run test:run -- src/features/home/__tests__/page.test.tsx`.

Expected: 5 tests PASS.

```bash
git add src/app/'(public)'/pendaftaran/page.tsx src/app/layout.tsx src/app/globals.css src/features/home/__tests__/page.test.tsx
git commit -m "fix: align SPMB academic year and metadata"
```

---

### Task 7: Verifikasi Responsif, Aksesibilitas, dan Produksi

**Files:**
- Modify if a check exposes a defect: files created or modified in Tasks 1–6 only.

**Interfaces:**
- Consumes: seluruh implementasi homepage.
- Produces: build produksi yang lulus dan catatan verifikasi manual pada handoff.

- [ ] **Step 1: Jalankan seluruh unit test dari kondisi bersih**

Run:

```bash
npm run test:run
```

Expected: seluruh test PASS, tanpa unhandled rejection atau warning React.

- [ ] **Step 2: Jalankan lint dan TypeScript**

Run:

```bash
npm run lint
npx tsc --noEmit
```

Expected: kedua command exit code 0 tanpa error.

- [ ] **Step 3: Jalankan build produksi Next.js 16**

Run:

```bash
npm run build
```

Expected: build selesai dengan exit code 0 dan route `/` serta `/pendaftaran` berhasil dikompilasi.

- [ ] **Step 4: Periksa homepage secara manual pada tiga viewport**

Run:

```bash
npm run dev
```

Periksa `http://localhost:3000` pada lebar 375px, 768px, dan 1440px. Pastikan tidak ada overflow horizontal; tabel berubah menjadi label per baris di ponsel; CTA, nomor rekening, rincian seragam, cicilan, diskon, persyaratan, dan footer terbaca penuh.

- [ ] **Step 5: Periksa interaksi dan aksesibilitas dasar**

Gunakan keyboard untuk menavigasi header, kedua CTA hero, tombol salin, dan CTA akhir. Pastikan fokus terlihat, tombol salin mengumumkan sukses/gagal, urutan heading logis, anchor “Lihat Informasi” bergerak ke ringkasan, dan reduced motion menonaktifkan transisi panjang.

- [ ] **Step 6: Audit data satu kali terhadap spesifikasi**

Bandingkan halaman dengan `docs/superpowers/specs/2026-08-20-homepage-registration-information-design.md`. Cocokkan semua 8 baris biaya, 3 cicilan, 3 tingkat diskon, 4 persyaratan, tanggal, rekening, total kelas, dan catatan buku paket.

- [ ] **Step 7: Commit hanya jika verifikasi memerlukan perbaikan**

```bash
git add src/app src/features/home
git commit -m "fix(home): address final verification findings"
```

Expected: langkah ini dilewati bila tidak ada perubahan setelah verifikasi.
