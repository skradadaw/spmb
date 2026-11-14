# 03: Kartu Kapasitas di Dashboard Admin

**What to build:**
Memperbarui kartu kapasitas pada Dashboard Admin (`CapacityCard`) agar menampilkan satu progress bar utama Total Kuota Siswa Baru (misal: "X / 112 Kursi Terpakai") beserta persentase keterisian total. Di bawah progress bar, disajikan rincian statistik distribusi jumlah peminat per Pilihan Kelas (Reguler, Bilingual, Tahfizh) murni sebagai informasi sebaran peminat tanpa batas maksimal maupun badge "Penuh" per kelas.

**Blocked by:** 01: Model Kapasitas & Transaksi Pendaftaran Basis Data

**Status:** ready-for-agent

- [ ] Kartu kapasitas Dashboard Admin menampilkan satu progress bar keterisian Kuota Total Siswa Baru (kursi terpakai vs total kapasitas 112).
- [ ] Rincian jumlah peminat per kelas (Reguler, Bilingual, Tahfizh) ditampilkan dalam bentuk daftar/grid angka statistik tanpa batas kapasitas masing-masing kelas.
- [ ] Tidak ada status atau badge "Penuh" pada masing-masing opsi kelas di dashboard admin.
- [ ] Tautan navigasi kartu kapasitas tetap mengarahkan admin ke halaman `/admin/pengaturan/kuota`.
- [ ] Seluruh pengujian komponen dashboard admin berjalan hijau.
