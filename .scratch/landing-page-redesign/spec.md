Status: ready-for-agent

# Spec: Perbaikan konten dan tampilan landing page setelah hero

## Problem Statement

Orang tua yang membuka landing page Open Booking SD Plus 3 Al-Muhajirin mendapat hero yang menarik: hijau tua, aksen amber, kartu kaca, pola dot/grid, dan pemisah gelombang. Namun bagian-bagian setelah hero terasa seperti halaman lain, sehingga landing page tidak terlihat modern dan profesional, baik di desktop maupun di HP.

**Masalah tampilan**

- Gaya visual bagian setelah hero:
  - Kartu abu-abu polos.
  - Lima warna hijau berbeda.
  - Kartu biru langit yang keluar dari tema.
  - Footer hitam keabuan (slate).
  - `font-black` di hampir semua judul, sehingga tidak ada jenjang tipografi.

**Masalah isi**

- Isinya tidak sesuai dengan cara sistem bekerja:
  - Persyaratan menyebut "fotokopi" padahal orang tua mengunggah file digital.
  - Langkah pendaftaran memakai kata "seleksi", istilah yang dihindari.
  - Alur berhenti di OKB, padahal masih ada Keputusan Penerimaan.
  - Kalimat "NISN cukup dicatat sebagai nomor" diulang tiga kali.
- Informasi penting tidak ada:
  - Pilihan Kelas (Reguler, Bilingual, Tahfizh) beserta ketersediaan kuotanya.
  - Jalur Pindahan.
  - Kontak panitia, alamat, dan tautan peta.
  - Jawaban atas pertanyaan yang sering diajukan.
- Bagian "Mengapa Al-Muhajirin" berisi klaim umum yang bisa dipakai sekolah mana pun.

## Solution

Bagian setelah hero didesain ulang dengan bahasa visual hero:

- **Latar:** terang (krem atau putih), dengan aksen amber, pola dot/grid tipis, dan pemisah gelombang.
- **Pita hijau tua:** dipakai seperlunya, untuk Biaya & Rekening, CTA penutup, dan footer.
- **Palet:** hijau tua `#064E1B` untuk pita dan footer, hijau utama `#007A10` untuk tombol dan tautan, satu tint hijau muda, dan amber sebagai satu-satunya warna aksen. Hero ikut diseragamkan ke palet ini tanpa mengubah strukturnya.
- **Tipografi:** tetap Plus Jakarta Sans, dengan jenjang yang jelas. `font-black` hanya untuk judul bagian, judul kartu memakai `font-bold`, dan eyebrow kapital kecil berwarna amber di latar gelap atau hijau di latar terang. Lebar paragraf sekitar 65 karakter.

**Urutan bagian baru setelah hero:**

1. **Alur Pendaftaran** (lima langkah):
   1. Bayar biaya OKB.
   2. Isi formulir dan unggah Berkas.
   3. Verifikasi Berkas oleh panitia.
   4. Ikuti OKB sesuai Jadwal OKB.
   5. Keputusan Penerimaan: "Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp."

   Di desktop, langkah tampil berderet horizontal dengan garis penghubung. Di HP, langkah tampil sebagai timeline vertikal bernomor.
2. **Pilihan Kelas:**
   - Badge "Terakreditasi A".
   - Tiga kartu (Reguler, Bilingual, Tahfizh) dengan status kuota live.
   - Kartu kecil Pindahan: "Pindahan ke kelas 2–6? Daftar lewat formulir yang sama, pilih Jenis Pendaftaran Pindahan."
   - Catatan bahwa Kelas Penempatan ditetapkan Panitia setelah OKB.
3. **Biaya & Rekening** (pita hijau tua): rekening OKB, nominal, tombol salin, dan unduhan PDF rincian biaya.
4. **Berkas yang Disiapkan:** empat Berkas, yaitu Akta Kelahiran, Kartu Keluarga, Pas Foto, dan Bukti Pembayaran OKB, berupa foto atau scan. NISN disebut sekali sebagai data yang diisi di formulir.
5. **FAQ:** enam pertanyaan, ditutup dengan ajakan "Masih ada pertanyaan?" dan tombol WhatsApp.
6. **CTA penutup:** tombol Mulai Pendaftaran dan tombol WhatsApp panitia.
7. **Footer** (hijau tua):
   - Nama sekolah dan badge Terakreditasi A.
   - Alamat.
   - Jam layanan 07.00–17.00.
   - WhatsApp Panitia Open Booking 0819-9831-1470.
   - Tombol "Buka di Google Maps".

Bagian "Mengapa Al-Muhajirin" dihapus. Menu navigasi menjadi **Jadwal · Alur · Kelas · Biaya · Berkas · FAQ**.

## User Stories

1. Sebagai orang tua, saya ingin bagian setelah hero terlihat satu tema dengan hero, supaya halaman terasa profesional dan dapat dipercaya.
2. Sebagai orang tua yang membuka halaman di HP, saya ingin setiap bagian nyaman dibaca tanpa scroll ke samping, supaya saya bisa memahami pendaftaran dari ponsel.
3. Sebagai orang tua, saya ingin melihat alur pendaftaran dari pembayaran sampai Keputusan Penerimaan, supaya saya tahu seluruh proses sejak awal.
4. Sebagai orang tua di HP, saya ingin alur tampil sebagai timeline vertikal bernomor, supaya urutannya jelas di layar sempit.
5. Sebagai orang tua di desktop, saya ingin alur tampil berderet dengan garis penghubung, supaya saya melihat seluruh proses sekilas.
6. Sebagai orang tua, saya ingin tahu bahwa Berkas saya akan diverifikasi panitia, supaya saya mengunggah file yang jelas dan benar.
7. Sebagai orang tua, saya ingin tahu bahwa hasil OKB diumumkan di website dan diinformasikan lewat WhatsApp, supaya saya tahu ke mana harus memantau.
8. Sebagai orang tua, saya ingin melihat tiga Pilihan Kelas beserta deskripsinya, supaya saya bisa memilih program yang cocok untuk anak.
9. Sebagai orang tua, saya ingin melihat apakah sebuah Pilihan Kelas masih Tersedia, Hampir penuh, atau Penuh, supaya saya tidak memilih kelas yang tidak bisa dipilih di formulir.
10. Sebagai orang tua yang tertarik pada kelas yang Hampir penuh, saya ingin tanda itu terlihat jelas, supaya saya segera mendaftar.
11. Sebagai orang tua, saya ingin tahu bahwa Kelas Penempatan ditetapkan Panitia setelah OKB, supaya saya tidak kaget bila anak ditempatkan di kelas lain.
12. Sebagai orang tua yang anaknya pindah sekolah, saya ingin tahu bahwa Pindahan ke kelas 2–6 memakai formulir yang sama, supaya saya tidak mencari jalur lain.
13. Sebagai orang tua, saya ingin melihat bahwa sekolah Terakreditasi A, supaya saya yakin dengan kualitas sekolah.
14. Sebagai orang tua, saya ingin rekening OKB, nominal, dan tombol salin tampil menonjol, supaya saya bisa membayar tanpa salah ketik.
15. Sebagai orang tua, saya ingin mengunduh PDF rincian biaya resmi, supaya saya tahu biaya pendidikan secara lengkap.
16. Sebagai orang tua, saya ingin daftar Berkas sama persis dengan yang diminta formulir, supaya saya menyiapkan file yang tepat.
17. Sebagai orang tua, saya ingin tahu bahwa Berkas boleh berupa foto atau scan, bukan fotokopi, supaya saya tidak salah menyiapkannya.
18. Sebagai orang tua, saya ingin NISN disebut sekali dan jelas sebagai data formulir, supaya informasinya tidak berulang dan membingungkan.
19. Sebagai orang tua, saya ingin FAQ tentang biaya dan rekening OKB, supaya pertanyaan dasar terjawab tanpa menghubungi panitia.
20. Sebagai orang tua, saya ingin FAQ tentang kelas yang bisa dipilih dan apa yang terjadi bila kelas penuh, supaya saya paham batas kuota.
21. Sebagai orang tua, saya ingin FAQ apakah kelas yang ditempatkan pasti sama dengan pilihan, supaya harapan saya realistis.
22. Sebagai orang tua, saya ingin FAQ tentang Berkas yang salah unggah, supaya saya tahu harus menghubungi panitia dan admin akan menggantinya.
23. Sebagai orang tua, saya ingin FAQ tentang Bukti Pendaftaran yang hilang, supaya saya tahu panitia bisa mengunduhkannya kembali.
24. Sebagai orang tua, saya ingin FAQ tentang berhalangan hadir OKB, supaya saya tahu OKB bisa dijadwalkan ulang.
25. Sebagai orang tua, saya ingin jawaban FAQ bisa dibuka-tutup, supaya halaman tidak terlalu panjang di HP.
26. Sebagai orang tua yang masih bingung, saya ingin tombol WhatsApp panitia di FAQ dan CTA, supaya saya langsung bisa bertanya.
27. Sebagai orang tua, saya ingin tahu jam layanan panitia 07.00–17.00, supaya saya menghubungi di waktu yang tepat.
28. Sebagai orang tua, saya ingin alamat sekolah dan tombol Buka di Google Maps, supaya saya bisa menemukan lokasi OKB.
29. Sebagai orang tua, saya ingin menu navigasi berisi Jadwal, Alur, Kelas, Biaya, Berkas, dan FAQ, supaya saya bisa langsung melompat ke bagian yang saya cari.
30. Sebagai orang tua di HP, saya ingin menu mobile berisi item yang sama, supaya navigasinya konsisten.
31. Sebagai orang tua, saya ingin CTA penutup mengajak memulai pendaftaran, supaya langkah berikutnya jelas setelah membaca semuanya.
32. Sebagai orang tua, saya ingin halaman tetap tampil normal saat data kuota gagal dimuat, supaya saya tetap mendapat informasi lain.
33. Sebagai pengguna keyboard atau pembaca layar, saya ingin semua bagian punya judul, label, dan fokus yang jelas, supaya halaman tetap dapat diakses.
34. Sebagai pengguna yang mengaktifkan reduced motion, saya ingin animasi dinonaktifkan, supaya halaman nyaman dibuka.
35. Sebagai Admin, saya ingin status kuota di landing page mengikuti pembagian kuota yang saya atur, supaya informasi publik selalu sesuai sistem.
36. Sebagai Admin, saya ingin landing page memakai istilah yang sama dengan sistem, yaitu Berkas, OKB, Pilihan Kelas, dan Kelas Penempatan, supaya pertanyaan orang tua lebih sedikit.

## Implementation Decisions

**Data kuota**

- Data landing page berubah dari jumlah total menjadi data kuota per Pilihan Kelas.
  - Repository progres booking mengembalikan daftar kapasitas per kelas (Pilihan Kelas, kuota, terpakai) dari sumber yang sama, `fetchClassCapacities`. Tidak ada query baru.
  - Kalau gagal, repository tetap melempar error aman yang sama.
- Interface `LandingPage` berubah dari `completedCount: number | null` menjadi `classCapacities: ClassCapacity[] | null`.
  - Progres total di hero diturunkan di dalam halaman, memakai helper `totalUsedSeats` yang sudah ada.
  - Halaman server meneruskan `null` bila data gagal dimuat, sama seperti sekarang.
- Kuota mengikuti ADR 0001: dihitung per Pilihan Kelas, dan yang dihitung hanya kursi Siswa Baru yang masih terpakai. Pindahan tidak punya status kuota.

**Status kuota per Pilihan Kelas**

- Ambang status, dengan sisa = kuota − terpakai:
  - **Penuh:** sisa ≤ 0. Konsisten dengan `isClassFull`.
  - **Hampir penuh:** sisa ≤ 20% dari kuota kelas.
  - **Tersedia:** selain kedua kondisi di atas.
- Angka sisa kursi tidak ditampilkan. Pembagian kuota bisa digeser Admin, sehingga angkanya bisa naik turun.
- Kartu Penuh tetap tampil dengan catatan "Pilihan kelas ini sudah penuh".
- Kalau data `null`, semua status disembunyikan dan kartu tampil tanpa badge.

**Isi bagian**

- Isi Pilihan Kelas sengaja ditulis tanpa angka atau janji. Pemilik akan menyesuaikannya nanti.
  - **Reguler:** kurikulum nasional dipadukan dengan pendidikan Islam, yaitu pembiasaan ibadah, akhlak, dan pengenalan kitab.
  - **Bilingual:** penguatan bahasa Inggris dalam pembelajaran untuk membekali anak berwawasan global.
  - **Tahfizh:** menghafal Al-Qur'an sejak dini dengan bimbingan guru, termasuk kegiatan Tahfizh Camp.
- Konten statis dipusatkan di modul data home, mengikuti pola `registrationInfo` yang sudah ada. Isinya:
  - Kontak: nomor WhatsApp, tautan `wa.me/6281998311470`, alamat, jam layanan, dan tautan Google Maps yang bersih tanpa parameter pelacakan.
  - Akreditasi.
  - Deskripsi Pilihan Kelas.
  - Langkah alur.
  - Daftar FAQ.
  - Daftar Berkas.
- FAQ memakai elemen bawaan yang dapat dibuka-tutup tanpa JavaScript tambahan, misalnya `details`/`summary`, atau komponen accordion yang sudah ada.
- Peta tidak ditanam di halaman, hanya berupa tautan. Tidak ada tombol WhatsApp melayang.
- Bagian "Mengapa Al-Muhajirin" dihapus.

**Navigasi dan istilah**

- Anchor dan nama menu:

  | Menu | Anchor |
  | --- | --- |
  | Jadwal | `#jadwal` |
  | Alur | `#alur` |
  | Kelas | `#kelas` |
  | Biaya | `#biaya` |
  | Berkas | `#berkas` |
  | FAQ | `#faq` |

  Daftar yang sama dipakai di navigasi desktop dan menu mobile.
- Teks untuk pengguna mengikuti glosarium:
  - Pakai "Berkas", jangan "dokumen" atau "file".
  - Hindari "seleksi" dan "tes masuk".
  - Pakai "OKB" dan "Keputusan Penerimaan".

**Tampilan**

- Token warna landing page didefinisikan sekali, misalnya di variabel `--public-*` yang sudah ada di stylesheet global, dan dipakai oleh hero maupun bagian setelahnya. Warna hijau ad-hoc dan warna biru langit dihapus.
- Hero tidak berubah strukturnya, hanya warnanya yang diseragamkan.

## Testing Decisions

- **Tes yang baik** menguji perilaku yang terlihat orang tua, yaitu teks, peran ARIA, tautan, dan status, bukan nama kelas CSS atau struktur internal komponen.
- **Seam utama: render `LandingPage`**, mengikuti prior art di tes halaman home yang memakai Testing Library dan Vitest. Yang dites:
  - Urutan dan judul bagian.
  - Menu navigasi berisi enam item dengan anchor yang benar.
  - Lima langkah Alur, termasuk Keputusan Penerimaan.
  - Tiga kartu Pilihan Kelas dengan status Tersedia, Hampir penuh, dan Penuh, berdasarkan `classCapacities` yang diberikan, termasuk kasus batas tepat 20% dan sisa 0.
  - Status tersembunyi saat `classCapacities` bernilai `null`.
  - Progres hero yang dihitung dari total kapasitas.
  - Kartu Pindahan.
  - Badge Terakreditasi A muncul di bagian Kelas dan di footer.
  - Empat Berkas, tanpa kata "fotokopi", dan NISN disebut sekali.
  - Enam pertanyaan FAQ.
  - Tautan WhatsApp `wa.me/6281998311470`, tautan Google Maps, alamat, dan jam layanan.
  - Tidak ada kata "seleksi".
- **Seam kedua: repository progres booking**, mengikuti tes repository yang sudah ada. Yang dites: repository mengembalikan kapasitas per kelas dan tetap melempar error aman saat gagal.
- Tidak ada seam baru. Logika ambang status dites lewat render `LandingPage`.
- Tes lama yang mengunci navigasi, isi persyaratan, atau langkah lama diperbarui sesuai keputusan baru.
- Verifikasi visual desktop dan HP dilakukan manual dengan menjalankan aplikasi. Tidak ada tes snapshot.

## Out of Scope

- Halaman cek hasil OKB. Ini rencana terpisah, dan langkah 5 Alur belum diberi tautan.
- Perubahan struktur atau isi hero dan header, selain penyeragaman warna dan menu navigasi.
- Foto sekolah, galeri, testimoni, prestasi, dan daftar ekstrakurikuler.
- Font tambahan.
- Perubahan pada formulir pendaftaran, logika kuota, atau halaman admin.
- Peta yang ditanam di halaman dan tombol WhatsApp melayang.
- Informasi potongan uang bangunan Afiliasi Direktorat 2.

## Further Notes

- Deskripsi Pilihan Kelas dan klaim akreditasi bersifat sementara. Pemilik akan menyesuaikannya, jadi tempatkan di modul data agar mudah diubah.
- Sumber riset isi:
  - Situs resmi sdplus3almuhajirin.com, halaman Visi & Misi dan Sambutan.
  - Studi UPI di Jurnal Pendidikan Tambusai (2024) tentang kelas tahfidz dan kelas bahasa Inggris.
  - Data di situs sekolah tampak berasal dari template, misalnya NPSN placeholder, jadi tidak dipakai selain yang dikonfirmasi pemilik.
- Nomor WhatsApp yang ditampilkan hanya 0819-9831-1470 (Panitia Open Booking). Nomor lain di situs sekolah tidak dipakai.
- Sebelum menulis kode, baca panduan Next.js yang relevan di dokumentasi lokal paket `next`, sesuai instruksi `AGENTS.md`.
