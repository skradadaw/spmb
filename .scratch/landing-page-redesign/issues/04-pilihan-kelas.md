# 04: Pilihan Kelas dengan status kuota live

**What to build:** Orang tua melihat tiga Pilihan Kelas beserta deskripsi dan status kuotanya, sehingga tidak memilih kelas yang sudah penuh di formulir. Bagian ini juga menjelaskan jalur Pindahan dan memperlihatkan akreditasi sekolah. Spec: `.scratch/landing-page-redesign/spec.md`. Aturan kuota mengikuti ADR 0001.

**Blocked by:** 01 (Data kuota per Pilihan Kelas), 02 (Token warna dan tipografi landing page)

**Status:** ready-for-agent

- [ ] Bagian "Pilihan Kelas" (`#kelas`) tampil setelah Alur, dengan badge "Terakreditasi A".
- [ ] Tiga kartu, dengan deskripsi yang disimpan di modul data home agar mudah diubah pemilik:
  - **Reguler:** kurikulum nasional dipadukan dengan pendidikan Islam, yaitu pembiasaan ibadah, akhlak, dan pengenalan kitab.
  - **Bilingual:** penguatan bahasa Inggris dalam pembelajaran untuk membekali anak berwawasan global.
  - **Tahfizh:** menghafal Al-Qur'an sejak dini dengan bimbingan guru, termasuk kegiatan Tahfizh Camp.
- [ ] Status tiap kartu, dengan sisa = kuota − terpakai:
  - **Penuh:** sisa ≤ 0.
  - **Hampir penuh:** sisa ≤ 20% dari kuota kelas.
  - **Tersedia:** selain kedua kondisi di atas.
- [ ] Angka sisa kursi tidak ditampilkan.
- [ ] Kartu Penuh tetap tampil dengan catatan "Pilihan kelas ini sudah penuh".
- [ ] Bila `classCapacities` bernilai `null`, semua badge status disembunyikan dan kartu tetap tampil.
- [ ] Ada kartu Pindahan: "Pindahan ke kelas 2–6? Daftar lewat formulir yang sama, pilih Jenis Pendaftaran Pindahan." Kartu ini tanpa status kuota.
- [ ] Ada catatan bahwa Kelas Penempatan ditetapkan Panitia setelah OKB.
- [ ] Di HP, kartu tersusun satu kolom. Di desktop, kartu tersusun tiga kolom.
- [ ] Menu "Kelas" (`#kelas`) ditambahkan setelah "Alur" di navigasi desktop dan menu mobile.
- [ ] Tes render `LandingPage` mencakup:
  - ketiga status, termasuk batas tepat 20% dan sisa 0;
  - status yang tersembunyi saat data `null`;
  - kartu Pindahan;
  - badge akreditasi.
