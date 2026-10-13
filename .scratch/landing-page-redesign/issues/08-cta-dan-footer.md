# 08: CTA penutup dan footer berisi kontak

**What to build:** Halaman ditutup dengan ajakan mendaftar dan footer hijau tua yang berisi semua informasi kontak dan lokasi sekolah. Tiket ini juga memverifikasi landing page secara utuh. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** 03 (Alur Pendaftaran), 04 (Pilihan Kelas dengan status kuota live), 05 (Biaya), 06 (Berkas yang Disiapkan), 07 (FAQ dan data kontak panitia)

**Status:** ready-for-agent

- [ ] CTA penutup berupa pita hijau tua, berisi tombol "Mulai Pendaftaran" dan tombol WhatsApp panitia.
- [ ] Footer berwarna hijau tua dan berisi:
  - nama sekolah dan badge "Terakreditasi A";
  - alamat dan jam layanan 07.00–17.00;
  - WhatsApp Panitia Open Booking 0819-9831-1470;
  - tombol "Buka di Google Maps" yang terbuka di tab baru;
  - tahun pelajaran 2027/2028.
- [ ] Urutan akhir bagian: Hero → Alur → Pilihan Kelas → Biaya → Berkas → FAQ → CTA → Footer.
- [ ] Navigasi desktop dan menu mobile berisi tepat enam item, Jadwal · Alur · Kelas · Biaya · Berkas · FAQ, dengan anchor yang benar.
- [ ] Tes render `LandingPage` mencakup isi footer, kedua tautan eksternal, dan urutan menu.
- [ ] Landing page dijalankan dan dicek manual di lebar HP (sekitar 375px) dan desktop:
  - tidak ada scroll ke samping;
  - semua anchor menu mendarat tepat di bawah header sticky;
  - animasi mati saat reduced motion aktif.
