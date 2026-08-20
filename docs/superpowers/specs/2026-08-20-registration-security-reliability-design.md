# Spesifikasi Desain: Keamanan & Keandalan Formulir Pendaftaran (SPMB)

Tanggal: 2026-08-20  
Status: Disetujui  
Target Area: `/pendaftaran` (`RegistrationForm`, `ConfirmationModal`, `actions.ts`, `schema.ts`)

---

## 1. Latar Belakang & Tujuan

Formulir pendaftaran murid baru (*SPMB*) melibatkan data sensitif (NIK, NISN, data orang tua) serta berkas dokumen resmi (Akta, KK, Foto, Bukti Pembayaran). Untuk memastikan sistem berstandar *Enterprise / Production-Ready*, diperlukan penguatan pada:
1. **Server-Side Validation**: Mencegah *bypass* validasi client-side.
2. **Auto-Sanitization UX**: Membantu pengguna yang melakukan *copy-paste* NIK/Telepon yang mengandung spasi atau tanda strip.
3. **Storage Rollback**: Membersihkan berkas di Supabase Storage jika transaksi database gagal (mencegah *orphaned files*).
4. **Idempotensi & Anti-Double-Submit**: Mencegah pengiriman data ganda akibat klik cepat di koneksi lambat.

---

## 2. Arsitektur & Rincian Perubahan

### A. Validasi Sisi Server (`src/features/registration/actions.ts`)
* Impor `formSchema` dari `schema.ts`.
* Jalankan `formSchema.safeParse(data)` di awal fungsi `submitRegistrationAction`.
* Jika validasi gagal:
  * Ambil pesan error spesifik dari Zod issue.
  * Kembalikan `{ success: false, error: 'Validasi server gagal: ...' }` tanpa menyentuh database.

### B. Auto-Sanitasi Input Pengguna (`src/features/registration/components/RegistrationForm.tsx`)
* Tambahkan helper sanitasi `sanitizeDigits(val: string)` yang otomatis menghapus seluruh karakter non-angka (`\D`).
* Terapkan pada:
  * **NIK Anak, NIK Ayah, NIK Ibu**: Maksimal 16 digit murni.
  * **NISN**: Hanya angka numerik.
  * **RT & RW**: Hanya angka numerik.
  * **WhatsApp Ayah & Ibu**: Mengonversi format `+628...` / `08...` secara bersih tanpa spasi atau tanda hubung `-`.

### C. Mekanisme Pembersihan Berkas / Rollback (`src/features/registration/components/RegistrationForm.tsx`)
* Buat helper `cleanupUploadedFiles(storagePaths: string[])` menggunakan `supabase.storage.from('documents').remove(...)`.
* Jika `submitRegistrationAction` mengembalikan `{ success: false }` atau terjadi *network error*, panggil helper ini untuk menghapus 4 berkas yang baru saja diunggah ke storage.

### D. Penguncian Dobel-Kirim (*Double Submit Lock*) (`src/features/registration/components/ConfirmationModal.tsx`)
* Tombol "Kirim Pendaftaran" di dalam modal konfirmasi akan otomatis dinonaktifkan (`disabled={isSubmitting}`) dan menampilkan indikator loading (*spinner*).
* Status pengiriman dikunci oleh *ref lock* di sisi form handler.

---

## 3. Rencana Pengujian & Verifikasi
1. **Uji Sanitasi NIK**: Paste teks `3201-0123-4567 0001` -> input otomatis bersih menjadi `3201012345670001`.
2. **Uji Validasi Server**: Simulasi pengiriman data tidak lengkap -> Server menolak dan memberikan pesan error terstruktur.
3. **Uji Rollback Storage**: Simulasi NIK duplikat -> Database menolak -> Berkas yang terunggah dihapus dari storage.
4. **Uji Double-Submit**: Klik berulang pada tombol kirim -> Hanya 1 request yang diproses.
