# 03: Alur Pendaftaran lima langkah

**What to build:** Orang tua melihat seluruh alur dari pembayaran sampai Keputusan Penerimaan, menggantikan bagian "Cara mendaftar" tiga langkah. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** 02 (Token warna dan tipografi landing page)

**Status:** ready-for-agent

- [ ] Bagian "Alur Pendaftaran" (`#alur`) berisi lima langkah berurutan:
  1. Bayar biaya OKB.
  2. Isi formulir dan unggah Berkas.
  3. Verifikasi Berkas oleh panitia.
  4. Ikuti OKB sesuai Jadwal OKB.
  5. Keputusan Penerimaan, dengan teks "Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp."
- [ ] Langkah 5 belum diberi tautan ke halaman cek hasil.
- [ ] Di desktop, langkah tampil berderet horizontal dengan garis penghubung. Di HP, langkah tampil sebagai timeline vertikal bernomor, tanpa scroll ke samping.
- [ ] Alur memakai daftar berurutan yang dapat diakses (`ol`, dengan label).
- [ ] Kata "seleksi" tidak muncul di halaman.
- [ ] Menu "Cara Daftar" (`#cara-daftar`) diganti menjadi "Alur" (`#alur`) di navigasi desktop dan menu mobile.
- [ ] Tes render `LandingPage` mencakup kelima langkah, anchor menu, dan tidak adanya kata "seleksi".
