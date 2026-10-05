# Fullstack Codebase Architecture Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menstandarisasi struktur folder, file naming, feature encapsulation (Public API), dan linting hygiene untuk codebase SPMB agar memenuhi standar profesional senior fullstack developer.

**Architecture:** Mempertahankan arsitektur feature-driven dengan menambahkan Feature Barrel (`index.ts`) untuk membatasi kebocoran internal, merelokasi utilitas gambar generik ke `src/lib/`, memindahkan file schema SQL ke `supabase/`, mempertahankan `useWilayahIndonesia` sebagai shared hook, dan mengabaikan `.agents/**` pada konfigurasi ESLint.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, ESLint 9, Vitest 4.

**Spec:** [docs/superpowers/specs/2026-10-05-fullstack-refactor-design.md](file:///c:/Users/Admin/Documents/Projek/spmb/docs/superpowers/specs/2026-10-05-fullstack-refactor-design.md)

## Global Constraints

- Semua 120 unit test Vitest (`npm run test:run`) harus tetap lulus 100%.
- AST security boundary (`clientSourceBoundary.test.ts`) tidak boleh dilanggar: tidak ada kode server atau service-role key yang diimpor ke client component.
- `npm run lint` harus menghasilkan 0 error dan 0 warning.
- `useWilayahIndonesia.ts` tetap berada di `src/hooks/useWilayahIndonesia.ts` untuk penggunaan bersama dengan fitur dashboard admin mendatang.

## Review Focus

1. **Client Boundary Violation**: Memastikan impor dari `@/features/registration` pada client page tidak menarik kode server.
2. **Missing Exports in Barrel**: Memastikan `src/features/home/index.ts` dan `src/features/registration/index.ts` mengekspor seluruh komponen yang dibutuhkan halaman Next.js.
3. **Vitest SQL Schema Path**: Memastikan `supabaseSchema.test.ts` membaca path `supabase/schema.sql` dengan benar.
4. **ESLint Ignore Path Matching**: Memastikan pattern `.agents/**` di `eslint.config.mjs` mengabaikan seluruh script Node/Python tanpa mengabaikan kode produksi `src/`.
5. **Image Compression Function Signature**: Memastikan `src/lib/imageCompression.ts` tetap memiliki kontrak fungsi yang identik dengan sebelumnya.

---

## Tasks

### Task 1: Fix ESLint Configuration & Package Metadata
**Files:**
- Modify: `eslint.config.mjs`
- Modify: `package.json`

- [x] Tambahkan `".agents/**"` ke dalam `globalIgnores` di `eslint.config.mjs`.
- [x] Ubah `"name": "spmb-tmp"` menjadi `"name": "spmb"` di `package.json`.
- [x] Jalankan `npm run lint` dan pastikan tidak ada lagi error dari `.agents/skills/**`.

---

### Task 2: Refactor Generic Utilities to Shared Library
**Files:**
- Create: `src/lib/imageCompression.ts`
- Modify: `src/features/registration/components/DocumentUploadCard.tsx`
- Delete: `src/features/registration/utils/compressImage.ts`

- [x] Salin fungsi kompresi gambar dari `src/features/registration/utils/compressImage.ts` ke `src/lib/imageCompression.ts`.
- [x] Perbarui impor di `src/features/registration/components/DocumentUploadCard.tsx` menjadi `import { compressImage } from '@/lib/imageCompression'`.
- [x] Hapus file lama `src/features/registration/utils/compressImage.ts` dan folder `src/features/registration/utils/`.
- [x] Jalankan `npm run test:run` untuk memastikan tidak ada broken import dan boundary test lulus.

---

### Task 3: Establish Feature Public APIs (Barrel Exports)
**Files:**
- Create: `src/features/home/index.ts`
- Create: `src/features/registration/index.ts`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/pendaftaran/page.tsx`

- [x] Buat `src/features/home/index.ts` yang mengekspor komponen `HomeHero`, `PaymentInformation`, `RegistrationPreparation`, `CopyAccountButton`, dan `data.ts`.
- [x] Buat `src/features/registration/index.ts` yang mengekspor `RegistrationForm`, serta tipe dan actions yang aman untuk dikonsumsi halaman publik.
- [x] Ubah impor di `src/app/(public)/page.tsx` untuk mengimpor dari `@/features/home`.
- [x] Ubah impor di `src/app/(public)/pendaftaran/page.tsx` untuk mengimpor dari `@/features/registration`.
- [x] Jalankan `npm run test:run` dan pastikan `clientSourceBoundary.test.ts` tetap lulus 100%.

---

### Task 4: Reorganize Database Schema Directory
**Files:**
- Create: `supabase/schema.sql`
- Modify: `src/features/registration/__tests__/supabaseSchema.test.ts`
- Modify: `docs/deployment/registration-security.md`
- Delete: `supabase_schema.sql`

- [x] Buat direktori `supabase/` dan salin seluruh isi `supabase_schema.sql` ke `supabase/schema.sql`.
- [x] Perbarui `src/features/registration/__tests__/supabaseSchema.test.ts` untuk membaca `supabase/schema.sql` (dengan fallback yang aman).
- [x] Perbarui referensi `supabase_schema.sql` di `docs/deployment/registration-security.md` menjadi `supabase/schema.sql`.
- [x] Hapus file mentah `supabase_schema.sql` di root.
- [x] Jalankan `npm run test:run` untuk memastikan seluruh 12 test skema database lulus.

---

### Task 5: Final Comprehensive Verification
**Files:**
- All touched files

- [x] Jalankan `npm run test:run` — verifikasi semua 120 tests lulus (PASS).
- [x] Jalankan `npm run lint` — verifikasi 0 errors (PASS).
- [x] Lakukan build pemeriksaan: `npm run build` jika diperlukan untuk memvalidasi bundle production Next.js (PASS).
