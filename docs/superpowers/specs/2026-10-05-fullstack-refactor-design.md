# Spesifikasi Desain: Standarisasi Struktur Folder & Penamaan File Fullstack SPMB

**Tanggal:** 2026-10-05  
**Status:** Menunggu Persetujuan Pengguna  
**Pendekatan:** Pilihan A (Hybrid Standard)

---

## 1. Ringkasan & Latar Belakang

Aplikasi SPMB dibangun menggunakan Next.js 16 (App Router), React 19, TypeScript, Supabase, Tailwind CSS, dan Vitest. Proyek ini sudah memiliki pondasi pengujian yang sangat kuat (120 test lolos, termasuk pengujian batas AST pada `clientSourceBoundary.test.ts`).

Tujuan dari refactoring ini adalah merapikan struktur file, folder, dan konvensi penamaan agar memenuhi standar arsitektur profesional (*production-grade fullstack*), mempermudah skalabilitas untuk penambahan fitur mendatang (seperti **Dashboard Admin**), serta membersihkan linting error pada build.

---

## 2. Prinsip Arsitektur

1. **Thin App Router (`src/app/`)**: Folder `src/app` hanya bertanggung jawab terhadap perutean (routing), metadata SEO, pemuatan data awal (jika SSR), dan menyusun layout. Logika komponen dan bisnis didelegasikan ke modul fitur.
2. **Feature Encapsulation (Pintu Utama `index.ts`)**: Modul fitur (`src/features/*`) memiliki berkas `index.ts` sebagai Public API yang mengekspor komponen/layanan yang boleh diakses dari luar. Modul luar tidak lagi mengimpor langsung ke submodule internal (`components/...`).
3. **Shared Core Libraries (`src/lib/` & `src/hooks/`)**:
   - Utilitas generik lintas-fitur diletakkan di `src/lib/`.
   - Custom hook yang akan digunakan oleh lebih dari satu fitur (seperti `useWilayahIndonesia` untuk form pendaftaran dan dashboard admin) diletakkan di `src/hooks/`.
4. **Dedicated Database Directory (`supabase/`)**: Berkas skema dan migrasi database Supabase tidak ditaruh di root folder, melainkan di folder `supabase/schema.sql`.
5. **Strict AST Security Boundary**: Seluruh perubahan impor dan pemindahan file wajib mematuhi aturan isolasi client/server yang diverifikasi oleh `clientSourceBoundary.test.ts`.

---

## 3. Rincian Perubahan & Pemindahan Berkas

### A. Feature Barrel (`index.ts`)
- **`src/features/home/index.ts`**:
  Mengekspor komponen publik home:
  ```ts
  export { HomeHero } from './components/HomeHero';
  export { PaymentInformation } from './components/PaymentInformation';
  export { RegistrationPreparation } from './components/RegistrationPreparation';
  export { default as CopyAccountButton } from './components/CopyAccountButton';
  export * from './data';
  ```
- **`src/features/registration/index.ts`**:
  Mengekspor komponen publik dan action pendaftaran:
  ```ts
  export { RegistrationForm } from './components/RegistrationForm';
  export * from './actions';
  export * from './contracts';
  ```

### B. Pembaruan Impor di Halaman Publik
- `src/app/(public)/page.tsx`:
  Mengubah impor dari `@/features/home/components/HomeHero` menjadi `@/features/home`.
- `src/app/(public)/pendaftaran/page.tsx`:
  Mengubah impor dari `@/features/registration/components/RegistrationForm` menjadi `@/features/registration`.

### C. Pemindahan Shared Image Compression Utility
- Pindahkan: `src/features/registration/utils/compressImage.ts` ➔ `src/lib/imageCompression.ts`
- Hapus direktori kosong `src/features/registration/utils/`.
- Perbarui impor di `src/features/registration/components/DocumentUploadCard.tsx` untuk mengimpor dari `@/lib/imageCompression`.
- Pastikan `clientSourceBoundary.test.ts` tetap mengizinkan `@/lib/imageCompression` di client component.

### D. Relokasi Database Schema
- Pindahkan: `supabase_schema.sql` (di root) ➔ `supabase/schema.sql`.
- Buat file penunjuk sementara jika ada script yang mereferensikan root, atau perbarui dokumentasi `docs/deployment/registration-security.md` dan test `supabaseSchema.test.ts` yang membaca file SQL.

### E. Perbaikan Linting & Konfigurasi Proyek
- Di `eslint.config.mjs`, tambahkan `.agents/**` ke dalam `globalIgnores`:
  ```js
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
  ]),
  ```
- Di `package.json`, perbarui `"name": "spmb-tmp"` menjadi `"name": "spmb"`.

---

## 4. Kriteria Keberhasilan (Success Criteria)
1. Seluruh 120 unit test Vitest tetap lulus 100% (`npm run test:run`).
2. Uji keamanan AST `clientSourceBoundary.test.ts` lulus tanpa ada kebocoran modul server.
3. `npm run lint` menghasilkan **0 error dan 0 warning**.
4. Tidak ada impor file yang rusak (*broken imports*) pada saat Next.js dev server berjalan.
