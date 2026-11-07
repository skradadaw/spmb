# 01: Menu OKB dengan tab Jadwal

**What to build:** Admin membuka item OKB di sidebar atau menu mobile dan melihat tab Jadwal di `/admin/okb`: tanggal hari ini dan seterusnya, dengan jumlah Pendaftar per Gelombang OKB. Dari tab ini admin dapat membuka Data Pendaftar dan daftar Tidak Hadir OKB. Lihat [spec](../spec.md).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Item OKB ada di sidebar dan menu mobile, dan aktif pada semua alamat di bawah `/admin/okb`
- [ ] Tab Jadwal menampilkan tanggal hari ini dan seterusnya, tanpa batas empat tanggal, urut dari yang terdekat
- [ ] Tanggal hari ini menampilkan jumlah hadir dari total, dan tetap tampil setelah semua Pendaftar hadir
- [ ] Tanggal lain menampilkan jumlah terjadwal saja
- [ ] Setiap Gelombang OKB menautkan ke Data Pendaftar dengan filter Gelombang
- [ ] Tautan Tidak Hadir OKB beserta jumlahnya hanya muncul bila jumlahnya lebih dari nol
- [ ] Keadaan kosong dan keadaan gagal dimuat tampil dengan jelas
- [ ] Pengguna tanpa sesi admin diarahkan ke halaman login sebelum data dibaca
- [ ] Tautan "Lihat semua" di kartu Jadwal OKB terdekat membuka tab Jadwal
- [ ] Angka diperbarui setelah Scan Kehadiran, Batalkan Kehadiran, perubahan Jadwal OKB, dan perubahan Status Pendaftar
