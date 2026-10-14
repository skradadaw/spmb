# 02: Status Terjadwal OKB berwarna khusus dengan nama Gelombang, dan filter Gelombang

**What to build:** Di daftar Pendaftar, admin bisa langsung membedakan anak yang sudah dijadwalkan. Status Terjadwal OKB punya warna sendiri (biru), dan nama Gelombang OKB tampil di bawahnya. Admin juga bisa menyaring daftar per Gelombang, sehingga daftar hadir per gelombang bisa diekspor.

Keputusan yang sudah disepakati:

- Warna biru (sky/indigo) hanya untuk Terjadwal OKB. Warna lain tetap: hijau untuk selesai (Terverifikasi, Diterima), amber untuk proses (Menunggu Verifikasi, Sudah OKB), merah untuk Ditolak, abu-abu untuk nonaktif.
- Di bawah status hanya tampil nama Gelombang ("Gelombang 1"), tanpa tanggal. Catatan Perlu Perhatian tetap tampil seperti sekarang.
- Warna yang sama berlaku di tabel desktop, kartu HP, dan badge di header detail Pendaftar.
- Filter Gelombang lewat parameter URL `?gelombang=1|2|3`, bisa dikombinasikan dengan filter lain. Ekspor mengikuti filter yang aktif. Filter ini hanya mencocokkan Pendaftar berstatus Terjadwal OKB.

**Blocked by:** 01 (Pilih Gelombang OKB saat menjadwalkan)

**Status:** ready-for-agent

- [ ] Status Terjadwal OKB tampil biru di tabel desktop, kartu HP, dan badge detail. Status lain tidak berubah warna.
- [ ] Baris Terjadwal OKB menampilkan "Gelombang N" di bawah status. Status lain tidak menampilkan Gelombang.
- [ ] Query daftar Pendaftar mengambil kolom Gelombang.
- [ ] Panel filter punya pilihan Gelombang. Nilai di luar 1–3 di URL diabaikan, dan tautan halaman/paginasi mempertahankan filter ini.
- [ ] "Hapus filter" ikut mengosongkan filter Gelombang.
- [ ] Ekspor dengan filter Gelombang aktif hanya berisi Pendaftar di Gelombang tersebut.
- [ ] Tes daftar Pendaftar, parsing query, repository, dan ekspor mencakup perilaku di atas.
