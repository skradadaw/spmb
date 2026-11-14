# 01: Model Kapasitas & Transaksi Pendaftaran Basis Data

**What to build:**
Memperbarui kontrak ketersediaan kapasitas dan fungsi transaksi pendaftaran di basis data agar validasi kapasitas hanya mengunci batas akumulasi total kursi Siswa Baru (112 kursi), tanpa membatasi kuota per pilihan kelas. Calon Siswa Baru dapat mendaftar dengan memilih program kelas mana pun (Reguler, Bilingual, Tahfizh) selama total kursi Siswa Baru yang terpakai belum mencapai total kuota. Pendaftar Pindahan tetap tidak mengonsumsi kuota.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Fungsi transaksi basis data (`finalize_registration_with_capacity`) memvalidasi kapasitas berdasarkan akumulasi seluruh pendaftar Siswa Baru yang aktif (`status NOT IN ('Ditolak', 'Dibatalkan') AND jenis_pendaftaran = 'Siswa Baru'`) terhadap batas total 112 kursi.
- [x] Pendaftar Siswa Baru dapat memilih program kelas mana pun tanpa dicegat kuota kelas individual selama total kursi Siswa Baru masih tersedia.
- [x] Fungsi transaksi menolak finalisasi pendaftaran Siswa Baru dengan eksepsi kuota penuh jika total pendaftar Siswa Baru aktif sudah $\ge 112$.
- [x] Pendaftar Pindahan dapat menyelesaikan pendaftaran meskipun total pendaftar Siswa Baru sudah mencapai 112 kursi.
- [x] Fungsi `get_class_capacity_usage` dan repositori kapasitas mengembalikan informasi keterisian total kuota serta rincian pendaftar per kelas untuk konsumsi modul lain.
- [x] Seluruh unit test dan integrasi untuk model kapasitas dan transaksi registrasi berjalan hijau.
