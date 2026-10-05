# Spesifikasi Desain: Halaman Login Admin SPMB Berbasis PIN (Split-Screen Showcase)

**Tanggal:** 2026-10-05  
**Status:** Siap Direview (Design Approved by User)  
**Target Pengguna:** Panitia & Administrator SPMB SD Plus 3 Al-Muhajirin  
**Gaya Desain:** Split-Screen Showcase + Single Styled PIN Input (shadcn/ui)

---

## 1. Ringkasan & Tujuan

Menyediakan halaman autentikasi aman, cepat, dan intuitif bagi Panitia dan Administrator SPMB SD Plus 3 Al-Muhajirin untuk mengakses panel manajemen pendaftar. 

Sesuai preferensi yang telah disepakati:
1. **Autentikasi Berbasis PIN:** Cukup memasukkan PIN keamanan tanpa perlu username atau email.
2. **Input PIN Tunggal (Single Styled PIN Field):** Input angka dengan font monospace berukuran besar, jarak spasi lebar (`tracking-widest`), dan toggle sembunyikan/tampilkan PIN (ikon mata).
3. **Layout Split-Screen Showcase:** Sisi kiri memuat identitas visual bernuansa hijau zamrud (*Islamic Emerald*) dan pesan keamanan; sisi kanan memuat kartu form login berbasis komponen **shadcn/ui**.

---

## 2. Arsitektur Komponen & Struktur Direktori

Mengikuti konvensi arsitektur proyek (`feature-encapsulated architecture`):

```text
src/
├── app/
│   └── (public)/
│       └── login/
│           └── page.tsx              # Thin route page untuk /login
├── components/
│   └── ui/                           # Komponen shadcn/ui
│       ├── alert.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
└── features/
    └── auth/
        ├── index.ts                  # Public barrel export
        ├── actions.ts                # Server Action verifyAdminPinAction
        ├── session.ts                # Manajemen session cookie admin
        ├── components/
        │   ├── AdminLoginForm.tsx    # Client Component form PIN dengan state & toggle mata
        │   └── LoginHero.tsx         # Sisi visual branding hijau emerald SD Plus 3 Al-Muhajirin
        └── __tests__/
            └── actions.test.ts       # Pengujian logika verifikasi PIN & proteksi brute force
```

---

## 3. Detail Desain UI/UX (ui-ux-pro-max & ui-styling)

### A. Sisi Kiri: Visual Branding & Keamanan (`LoginHero.tsx`)
* **Visibilitas:** Ditampilkan pada layar desktop (`hidden lg:flex lg:w-1/2`).
* **Latar Belakang:** Gradien hijau zamrud khas Al-Muhajirin (`bg-gradient-to-br from-[#00550B] via-[#007A10] to-[#00A315]`) dengan pola aksen ornamen/glow halus.
* **Elemen Konten:**
  * Badge pill: `"Portal Khusus Panitia SPMB"` dengan latar semi-transparan `bg-white/10 text-emerald-100`.
  * Judul: `"SD Plus 3 Al-Muhajirin"`.
  * Subjudul: `"Sistem Penerimaan Murid Baru - Tahun Ajaran 2026/2027"`.
  * Kartu Sorotan Keamanan:
    * Ikon `ShieldCheck` & `LockKeyhole`: Memberikan rasa aman dan perlindungan privasi data peserta pendaftaran.
    * Teks edukasi: *"Halaman ini dilindungi pembatasan akses. Pastikan Anda tidak membagikan PIN keamanan kepada pihak yang tidak berkepentingan."*

### B. Sisi Kanan: Form Input PIN (`AdminLoginForm.tsx`)
* **Wadah Form:** `w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50`.
* **Kartu Form (`Card`):** Lebar maksimal `max-w-md w-full`, border halus `border-slate-200 shadow-xl rounded-2xl bg-white p-6 sm:p-8`.
* **Field Input PIN:**
  * Komponen `Input` shadcn yang dimodifikasi dengan gaya PIN:
    * `type="password"` (default) atau `type="text"` (jika toggle intip aktif).
    * `inputMode="numeric"`, `pattern="[0-9]*"`, `autoComplete="current-password"`.
    * Styling: `text-center text-3xl font-mono tracking-[0.4em] font-bold h-14`.
    * Tombol Toggle Ikon Mata: `Eye` dan `EyeOff` dari `lucide-react` diletakkan di dalam container input untuk kemudahan preview.
* **Tombol Aksi (`Button`):**
  * Varian utama berwarna hijau institusi (`bg-[#007A10] hover:bg-[#00550B] text-white font-bold h-12 rounded-xl`).
  * Indikator *Loading*: Animasi `Loader2` memutar saat verifikasi berlangsung; tombol dinonaktifkan (`disabled`) untuk mencegah klik berulang.
* **Alert Feedback:**
  * Komponen `Alert` varian destruktif jika PIN salah atau terkena rate-limit.
* **Navigasi Sekunder:**
  * Tombol tautan: `← Kembali ke Beranda SPMB` mengarah ke `/`.

---

## 4. Keamanan & Alur Autentikasi Server-Side

1. **Konfigurasi Environment Variable:**
   * `ADMIN_PIN`: Disimpan di `.env.local` (default demo `123456` dengan peringatan jika di production).
   * Nilai PIN tidak pernah diekspos ke client-side (`process.env.ADMIN_PIN` hanya dibaca di `actions.ts` atau modul bertanda `server-only`).
2. **Proteksi Brute-Force (Rate Limiting Sederhana):**
   * Menyimpan jumlah percobaan salah per IP / fingerprint sesi singkat.
   * Jika salah > 5 kali berturut-turut, kunci percobaan selama 60 detik.
3. **Session Cookie:**
   * Dikelola melalui modul `src/features/auth/session.ts`.
   * Nama cookie: `spmb_admin_session`.
   * Karakteristik cookie:
     * `httpOnly: true` (tidak bisa diakses JavaScript client).
     * `secure: process.env.NODE_ENV === 'production'`.
     * `sameSite: 'lax'`.
     * `maxAge: 60 * 60 * 24` (24 jam).
4. **Respon Server Action:**
   ```ts
   export type VerifyPinResult = 
     | { success: true; redirectUrl: string }
     | { success: false; error: string; remainingAttempts?: number };
   ```

---

## 5. Rencana Pengujian (Testing Strategy)

1. **Unit Test Server Action (`src/features/auth/__tests__/actions.test.ts`):**
   * Menguji verifikasi PIN yang benar berhasil dan mengembalikan `{ success: true }`.
   * Menguji verifikasi PIN yang salah gagal dengan pesan error ramah.
   * Menguji mekanisme rate limiting setelah 5 percobaan berturut-turut.
2. **AST Boundary Test:**
   * Memastikan `npm run test:run` tetap 100% lulus dan tidak melanggar aturan isolasi `clientSourceBoundary.test.ts`.
3. **Build & Lint Verification:**
   * Menjalankan `npm run lint` dan `npm run build` untuk memvalidasi kompatibilitas Next.js 16 & React 19.
