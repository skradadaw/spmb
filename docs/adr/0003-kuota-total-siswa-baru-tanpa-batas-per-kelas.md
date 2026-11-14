# Kuota Total Siswa Baru Tanpa Pembatasan per Pilihan Kelas

> **Status:** Accepted (Supersedes [ADR-0001](0001-kuota-per-pilihan-kelas.md))

Batas kuota 112 kursi Siswa Baru (4 rombongan kelas) diberlakukan secara tunggal pada tingkat sekolah tanpa pembatasan kuota per Pilihan Kelas (Reguler, Bilingual, Tahfizh). Seluruh opsi Pilihan Kelas dapat dipilih bebas di formulir pendaftaran hingga total pendaftar Siswa Baru mencapai 112. Penyesuaian kelebihan peminat (*over-subscription*) pada suatu kelas diserahkan kepada Panitia saat observasi OKB melalui Kelas Penempatan (*Class Placement*).

## Considered Options

- **Kuota ditegakkan per Pilihan Kelas (ADR-0001)**: ditolak karena membatasi minat orang tua di formulir pendaftaran secara kaku dan membebani admin untuk terus menggeser alokasi kuota antarkelas secara manual.
- **Tanpa batasan kuota sama sekali (unlimited)**: ditolak karena kapasitas fisik sekolah untuk Siswa Baru tetap dibatasi maksimal 112 siswa (4 rombel @ 28 anak).

## Consequences

- **Landing Page**: Badge status ketersediaan kuota per kelas (*Tersedia*, *Hampir penuh*, *Penuh*) ditiadakan; kartu kelas murni menampilkan profil program.
- **Formulir Pendaftaran**: Ketiga pilihan kelas selalu aktif bagi Siswa Baru hingga kuota total 112 terpenuhi; saat penuh, pendaftaran Siswa Baru ditutup secara keseluruhan.
- **Dashboard Admin**: Kartu kapasitas menampilkan satu progress bar utama total 112 kursi Siswa Baru dengan statistik distribusi peminat per kelas di bawahnya.
- **Pengaturan Admin**: Form kuota disederhanakan menjadi satu input daya tampung total Siswa Baru.
- **Database**: Validasi transaksi pendaftaran (`finalize_registration_with_capacity`) dan perubahan status admin memvalidasi akumulasi seluruh pendaftar Siswa Baru terhadap total kapasitas.
