# Rencana Implementasi: Keamanan & Keandalan Formulir Pendaftaran

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperkuat keamanan dan keandalan sistem pendaftaran SPMB melalui validasi server-side Zod, auto-sanitasi data masukan (NIK/NISN/Telepon), pembersihan berkas storage otomatis saat rollback, dan pencegahan double-submission.

**Architecture:** Menerapkan validasi ganda (Client & Server Actions) menggunakan Zod schema bersama, utility sanitasi di level form input, mekanisme *compensation transaction* (storage file cleanup) saat database error, serta locking state pada modal konfirmasi submit.

**Tech Stack:** Next.js 16 (App Router / Server Actions), React Hook Form, Zod, Supabase (PostgreSQL & Storage), TailwindCSS.

## Global Constraints
- Seluruh validasi sisi server harus mengembalikan objek standar `{ success: boolean, error?: string }`.
- NIK harus dibersihkan otomatis menjadi 16 digit angka murni tanpa spasi atau tanda hubung.
- No orphan files di Supabase Storage jika database insert gagal.

---

### Task 1: Validasi Server-Side dengan Zod di Server Action

**Files:**
- Modify: `src/features/registration/actions.ts`
- Reference: `src/features/registration/schema.ts`

- [ ] **Step 1: Impor dan integrasikan `formSchema` ke dalam `submitRegistrationAction`**
  Gunakan `formSchema.safeParse(data)` sebelum menjalankan query `supabase.from('pendaftar').insert(...)`.
- [ ] **Step 2: Format pesan error jika validasi gagal**
  Ekstrak pesan error pertama dari `parsed.error.issues` dan kembalikan `{ success: false, error: 'Validasi gagal: ...' }`.
- [ ] **Step 3: Jalankan typecheck `npx tsc --noEmit` untuk memastikan kesesuaian tipe**

---

### Task 2: Auto-Sanitasi Input NIK, NISN, RT/RW, dan No. WhatsApp

**Files:**
- Modify: `src/features/registration/components/RegistrationForm.tsx`

- [ ] **Step 1: Buat helper sanitasi `sanitizeDigits(val: string)`**
  Mengubah input string menjadi hanya angka: `val.replace(/\D/g, '')`.
- [ ] **Step 2: Terapkan sanitasi pada field NIK Calon Murid, NIK Ayah, NIK Ibu**
  Batasi maksimal 16 karakter angka dan otomatis bersihkan karakter non-angka saat `onChange` atau `onPaste`.
- [ ] **Step 3: Terapkan sanitasi pada field NISN, RT, RW**
  Bersihkan spasi/karakter non-angka.
- [ ] **Step 4: Sempurnakan fungsi `formatWhatsApp`**
  Pastikan nomor telepon WhatsApp Ayah & Ibu terformat baku (misal `08...` atau `628...`) tanpa spasi atau tanda strip.

---

### Task 3: Mekanisme Pembersihan Berkas Storage (*Storage Rollback*)

**Files:**
- Modify: `src/features/registration/components/RegistrationForm.tsx`

- [ ] **Step 1: Buat helper `cleanupStorageFiles(filePaths: string[])`**
  Memanggil `supabase.storage.from('documents').remove(filePaths)` untuk menghapus berkas yang telah diunggah jika terjadi kegagalan berikutnya.
- [ ] **Step 2: Hubungkan helper dengan penanganan error pada `handleFinalSubmit`**
  Jika `submitRegistrationAction` mengembalikan `{ success: false }` atau terjadi `catch (err)`, kumpulkan *storage paths* yang baru saja diunggah dan panggil `cleanupStorageFiles`.
- [ ] **Step 3: Pastikan status pesan error ditampilkan jelas ke pengguna**

---

### Task 4: Kunci Anti Double-Submit pada Modal Konfirmasi

**Files:**
- Modify: `src/features/registration/components/ConfirmationModal.tsx`
- Modify: `src/features/registration/components/RegistrationForm.tsx`

- [ ] **Step 1: Kunci tombol konfirmasi saat `isSubmitting === true`**
  Nonaktifkan tombol Batal dan tombol Kirim saat proses sedang berlangsung (`disabled={isSubmitting}`).
- [ ] **Step 2: Tampilkan status upload teks (*"Mengunggah berkas (1/4)..."*, *"Menyimpan data..."*) secara real-time di modal konfirmasi**
- [ ] **Step 3: Cegah penutupan modal tak disengaja saat pengiriman data sedang berlangsung (`onOpenChange` guard)**

---

### Task 5: Verifikasi Menyeluruh & Testing

- [ ] **Step 1: Jalankan `npx tsc --noEmit` untuk verifikasi TypeScript**
- [ ] **Step 2: Uji alur pengisian form dari Step 1 sampai Step 4 dengan copy-paste NIK berformat spasi**
- [ ] **Step 3: Pastikan modal konfirmasi dan proses pengiriman berjalan mulus dan aman**
