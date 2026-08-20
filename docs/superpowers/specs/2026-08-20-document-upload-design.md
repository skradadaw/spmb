# Spesifikasi Desain: Fitur Unggah Dokumen Pendaftaran SPMB

## 1. Ringkasan & Tujuan
Meningkatkan fungsionalitas dan pengalaman pengguna pada **Langkah 3 (Unggah Dokumen)** formulir pendaftaran SPMB SD Plus 3 Al-Muhajirin. Seluruh 4 berkas pendaftaran dijadikan **wajib**, didukung fitur *Drag & Drop*, *Full Preview Modal* (PDF & Gambar), validasi ketat di sisi klien, perbaikan bug pemilihan ulang berkas (*re-selection bug*), serta sistem unggah langsung (*Direct-to-Storage*) ke Supabase Storage dengan pelacakan progres secara *real-time*.

---

## 2. Kebutuhan Dokumen
Setiap pendaftar wajib mengunggah 4 dokumen berikut:
1. **Akta Kelahiran** (`aktaKelahiran`): PDF, JPG, PNG, atau WEBP (Maks. 5MB)
2. **Kartu Keluarga** (`kartuKeluarga`): PDF, JPG, PNG, atau WEBP (Maks. 5MB)
3. **Pas Foto Anak (Terbaru)** (`pasFoto`): JPG, PNG, atau WEBP (Maks. 5MB)
4. **Bukti Pembayaran OKB** (`buktiPembayaran`): PDF, JPG, PNG, atau WEBP (Maks. 5MB)

---

## 3. Arsitektur Komponen

```
src/features/registration/
├── components/
│   ├── RegistrationForm.tsx       # Form utama & pengelola state pendaftaran
│   ├── DocumentUploadCard.tsx     # Komponen kartu per-dokumen dengan Drag & Drop
│   └── DocumentPreviewModal.tsx   # Modal pop-up pratinjau penuh (PDF & Image)
└── utils/
    └── upload.ts                  # Helper upload langsung ke Supabase Storage
```

### A. `DocumentUploadCard.tsx`
* **Fitur Utama**:
  * Area *Drag & Drop* dengan status visual dinamis saat file diseret (`isDragging`).
  * Reset nilai `e.target.value = ''` pada `<input type="file">` agar berkas yang dihapus dapat dipilih kembali tanpa macet (*re-selection fix*).
  * Validasi format MIME (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) dan batas ukuran (maks. 5MB).
  * Menampilkan thumbnail instan untuk gambar atau ikon badge PDF interaktif.
  * Tombol **"Pratinjau"** untuk membuka modal dan tombol **"Hapus" / "Ganti"**.

### B. `DocumentPreviewModal.tsx`
* **Fitur Utama**:
  * Menggunakan Radix Dialog / Framer Motion untuk modal pratinjau yang halus.
  * Jika berkas berupa **Gambar**: Menampilkan gambar resolusi penuh dengan latar belakang *backdrop* gelap.
  * Jika berkas berupa **PDF**: Menampilkan dokumen PDF di dalam frame interaktif (`<iframe src={url} />` atau `<object />`).
  * Tombol tutup yang mudah diakses (tombol silang & klik luar).

### C. `RegistrationForm.tsx` (Integrasi & Validasi)
* **Indikator Kelengkapan**:
  * Menampilkan badge / progress status: *"X dari 4 Dokumen Terunggah"*.
  * Jika pendaftar mencoba mengirim saat dokumen belum lengkap, sistem menampilkan pesan error dan menandai kartu dokumen yang belum diisi dengan garis merah berdenyut.
* **Tombol Kirim Pendaftaran**:
  * Status awal: *"Lengkapi 4 Dokumen Wajib"*.
  * Status lengkap: *"Kirim Pendaftaran (4 Dokumen Lengkap)"*.
  * Status proses: *"Mengunggah berkas [Nama Dokumen] (X/4)..."* -> *"Menyimpan data pendaftaran..."*.

---

## 4. Alur Data & Unggah ke Supabase

1. **Pemilihan Berkas (Klien)**:
   * Berkas disimpan sementara di state memori React `uploadedFiles`.
   * Object URL sementara dibuat via `URL.createObjectURL(file)` untuk keperluan pratinjau instan.
2. **Kirim Formulir (*Submit*)**:
   * Sistem memvalidasi kelengkapan 4 berkas.
   * `uploadRegistrationDocuments` mengunggah setiap berkas secara langsung ke bucket `dokumen_pendaftaran` Supabase Storage dengan path:  
     `dokumen_pendaftaran/{nik}/{jenisDokumen}_{timestamp}.{ext}`
   * URL publik yang dihasilkan dipetakan ke dalam objek `documentUrls`.
   * Memanggil `submitRegistrationAction(data, documentUrls)` untuk menyimpan seluruh data calon murid ke tabel `public.pendaftar`.
3. **Pembersihan State**:
   * Setelah submit berhasil, LocalStorage draft dibersihkan secara permanen, object URLs di-revoke, dan pendaftar dialihkan ke Halaman Sukses.

---

## 5. Penanganan Kasus Khusus & Error (*Edge Cases*)

* **Format File Tidak Sesuai**: Menampilkan toast/alert error spesifik jika pendaftar memilih format selain PDF/JPG/PNG/WEBP.
* **Ukuran File > 5MB**: Menolak berkas dan menampilkan pesan: *"Ukuran file melebihi batas maksimal 5MB"*.
* **Gagal Koneksi saat Upload**: Jika satu berkas gagal diunggah, proses berhenti dan memberikan pesan detail berkas mana yang gagal serta opsi untuk mencoba kembali tanpa kehilangan data isian teks.

---

## 6. Rencana Verifikasi

1. **Pengujian Fungsional**:
   * Uji pilih berkas via klik & drag-and-drop.
   * Uji coba hapus lalu pilih berkas yang sama (*re-selection*).
   * Uji coba buka modal pratinjau untuk format Foto dan PDF.
   * Uji coba validasi jika hanya 2 atau 3 berkas yang dipilih.
2. **Pengujian Integrasi**:
   * Uji coba submit penuh ke Supabase Storage & tabel `pendaftar`.
   * Pastikan URL publik di database dapat diakses dengan benar.
