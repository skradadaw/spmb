# 02: Tampilan Landing Page & Formulir Pendaftaran Publik

**What to build:**
Menghilangkan badge status kuota (*Tersedia*, *Hampir penuh*, *Penuh*) pada kartu program kelas di Landing Page sehingga kartu murni menampilkan informasi kurikulum dan profil kelas. Pada formulir pendaftaran publik, seluruh opsi Pilihan Kelas (Reguler, Bilingual, Tahfizh) selalu dapat dipilih bebas oleh Siswa Baru. Formulir hanya menonaktifkan opsi Jenis Pendaftaran *Siswa Baru* dengan penanda kuota penuh jika total 112 kursi Siswa Baru telah terisi penuh. Pendaftaran Pindahan tetap dapat dipilih kapan saja.

**Blocked by:** 01: Model Kapasitas & Transaksi Pendaftaran Basis Data

**Status:** ready-for-agent

- [ ] Kartu pilihan kelas di Landing Page tidak menampilkan badge status ketersediaan kuota (*Tersedia*, *Hampir penuh*, *Penuh*).
- [ ] Dropdown / pilihan kelas di formulir pendaftaran tidak menonaktifkan opsi kelas individual dan tidak menampilkan label "(Kuota penuh)" pada nama kelas.
- [ ] Opsi Jenis Pendaftaran *Siswa Baru* dinonaktifkan dan dilabeli "(Kuota penuh)" hanya jika total kursi Siswa Baru yang terpakai telah mencapai kuota total.
- [ ] Opsi Jenis Pendaftaran *Pindahan* tetap selalu aktif dan dapat disubmit walaupun jalur Siswa Baru penuh.
- [ ] Halaman pendaftaran berhasil memuat dan menyajikan formulir pendaftaran dengan data status kapasitas total terbaru.
- [ ] Pengujian visual/komponen dan end-to-end pendaftaran publik berjalan hijau.
