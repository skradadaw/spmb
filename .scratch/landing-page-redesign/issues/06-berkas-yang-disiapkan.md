# 06: Berkas yang Disiapkan

**What to build:** Daftar yang perlu disiapkan orang tua sama persis dengan yang diminta formulir, menggantikan bagian "Persyaratan". Bagian "Mengapa Al-Muhajirin" dihapus. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** 02 (Token warna dan tipografi landing page)

**Status:** ready-for-agent

- [ ] Bagian "Berkas yang Disiapkan" (`#berkas`) berisi empat Berkas: Akta Kelahiran, Kartu Keluarga, Pas Foto, dan Bukti Pembayaran OKB, dengan keterangan "berupa foto atau scan".
- [ ] NISN disebut tepat sekali, sebagai data yang diisi di formulir.
- [ ] Kata "fotokopi" tidak muncul di halaman.
- [ ] Bagian "Mengapa Al-Muhajirin" dihapus.
- [ ] Menu "Persyaratan" (`#persyaratan`) diganti menjadi "Berkas" (`#berkas`) di navigasi desktop dan menu mobile.
- [ ] Tes render `LandingPage` mencakup keempat Berkas, NISN yang disebut sekali, tidak adanya kata "fotokopi", dan anchor menu.
