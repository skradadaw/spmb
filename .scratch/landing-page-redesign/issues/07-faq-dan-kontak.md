# 07: FAQ dan data kontak panitia

**What to build:** Orang tua mendapat jawaban atas pertanyaan yang sering diajukan, dan bila masih bingung, bisa langsung menghubungi panitia lewat WhatsApp. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** 02 (Token warna dan tipografi landing page)

**Status:** ready-for-agent

- [ ] Data kontak disimpan di modul data home:
  - WhatsApp Panitia Open Booking 0819-9831-1470, dengan tautan `https://wa.me/6281998311470`;
  - alamat: Jl. Ipik Gandamanah No. 33, Ciseureuh, Purwakarta, Jawa Barat;
  - jam layanan 07.00–17.00;
  - tautan Google Maps yang bersih, tanpa parameter pelacakan.
- [ ] Bagian FAQ (`#faq`) berisi enam pertanyaan yang dapat dibuka-tutup dan dapat diakses dengan keyboard:
  1. Berapa biaya OKB dan ke mana membayarnya?
  2. Kelas apa saja yang bisa dipilih, dan bagaimana kalau kelasnya penuh?
  3. Apakah kelas yang ditempatkan pasti sama dengan pilihan? (Tidak selalu: Panitia menetapkan Kelas Penempatan.)
  4. Bagaimana jika Berkas yang diunggah salah? (Hubungi panitia, Admin mengganti Berkasnya.)
  5. Bukti Pendaftaran hilang? (Panitia mengunduhkannya kembali.)
  6. Berhalangan hadir OKB? (Bisa dijadwalkan ulang.)
- [ ] Jawaban FAQ memakai istilah glosarium. Tidak ada kata "seleksi", "tes masuk", atau "upload ulang".
- [ ] Di bawah FAQ ada ajakan "Masih ada pertanyaan?", jam layanan, dan tombol WhatsApp yang terbuka di tab baru.
- [ ] Menu "FAQ" (`#faq`) ditambahkan sebagai item terakhir di navigasi desktop dan menu mobile.
- [ ] Tes render `LandingPage` mencakup keenam pertanyaan, tautan WhatsApp, dan anchor menu.
