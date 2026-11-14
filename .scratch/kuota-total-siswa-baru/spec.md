Status: ready-for-agent

# Spec: Kuota Total Siswa Baru Tanpa Pembatasan per Pilihan Kelas

## Problem Statement

Sebelumnya, batas 112 kursi Siswa Baru dibagi secara kaku ke setiap Pilihan Kelas (56 Bilingual, 28 Reguler, 28 Tahfizh). Pembagian kaku ini menimbulkan sejumlah kendala:
1. Orang tua terhalang memilih program kelas yang diinginkan karena status kuota kelas tersebut di formulir sudah penuh, padahal secara keseluruhan kapasitas sekolah untuk 4 rombongan belajar (112 kursi) masih tersedia.
2. Muncul beban operasional bagi admin sekolah yang harus terus-menerus memantau dan menggeser alokasi angka antarkelas secara manual di menu Pengaturan ketika minat pada satu kelas melebihi kelas lainnya.
3. Tampilan badge ketersediaan di Landing Page menimbulkan persepsi bahwa pendaftaran kelas tertentu telah ditutup permanen sebelum periode berakhir.

## Solution

Sistem memberlakukan batas kuota 112 kursi Siswa Baru secara tunggal pada tingkat sekolah tanpa membagi kuota maksimal ke masing-masing Pilihan Kelas:
- Di **Landing Page**, badge status ketersediaan kuota per kelas (*Tersedia*, *Hampir penuh*, *Penuh*) ditiadakan. Kartu kelas murni menyajikan profil dan keunggulan program.
- Di **Formulir Pendaftaran**, ketiga opsi Pilihan Kelas (Reguler, Bilingual, Tahfizh) selalu aktif dan dapat dipilih bebas oleh pendaftar Siswa Baru selama kuota total 112 belum habis. Jika total pendaftar Siswa Baru (berproses dan diterima) telah mencapai 112, opsi Jenis Pendaftaran *Siswa Baru* otomatis ditutup/dinonaktifkan dengan penanda kuota penuh. Pendaftar Pindahan tetap tidak dibatasi kuota.
- Di **Dashboard Admin**, kartu kapasitas menyajikan satu progress bar utama Total Kuota Siswa Baru (misal: "45 / 112 Kursi Terpakai") dengan rincian jumlah pendaftar per Pilihan Kelas di bawahnya murni sebagai statistik distribusi peminat tanpa batas maksimal per kelas.
- Di **Menu Pengaturan Admin**, tab Kuota disederhanakan menjadi satu form pengaturan Kapasitas Total Siswa Baru (default 112) yang memvalidasi bahwa batas baru tidak boleh lebih kecil dari kursi yang sedang terpakai.
- Di **Basis Data**, transaksi finalisasi pendaftaran dan validasi perubahan pendaftar oleh admin memverifikasi akumulasi seluruh pendaftar Siswa Baru aktif terhadap kuota total sekolah.
- Jika suatu kelas diminati melebihi kapasitas fisik kelasnya (*over-subscribed*), penyesuaian rombongan kelas definitif diserahkan sepenuhnya kepada Panitia saat observasi OKB melalui fitur **Kelas Penempatan** (*Class Placement*).

## User Stories

### Pendaftar & Orang Tua (Publik)

1. Sebagai orang tua calon murid, saya ingin melihat informasi program kelas di Landing Page tanpa terganggu oleh label status kuota kelas, agar saya dapat memilih program yang paling sesuai dengan minat anak saya.
2. Sebagai orang tua calon murid Siswa Baru, saya ingin dapat memilih program kelas (Reguler, Bilingual, atau Tahfizh) secara bebas di formulir pendaftaran selama pendaftaran sekolah masih dibuka, agar saya tidak terblokir oleh kuota kelas yang sempit.
3. Sebagai orang tua calon murid Siswa Baru, saya ingin diberitahu dengan jelas di formulir jika kuota total 112 siswa baru telah penuh, agar saya tahu bahwa jalur Siswa Baru untuk periode ini sudah ditutup.
4. Sebagai orang tua calon murid Pindahan, saya ingin tetap dapat mendaftar kapan saja meskipun kuota Siswa Baru sudah penuh, agar pendaftaran pindahan tidak terpengaruh kuota kelas 1.
5. Sebagai orang tua calon murid, saya ingin Bukti Pendaftaran mencantumkan Pilihan Kelas yang saya pilih tanpa label kuota, agar menjadi bukti pemilihan program saat observasi.

### Admin Sekolah

6. Sebagai admin, saya ingin melihat satu progress bar keterisian Kuota Total Siswa Baru di Dashboard Admin, agar saya langsung mengetahui sisa daya tampung sekolah secara keseluruhan dalam sekali lihat.
7. Sebagai admin, saya ingin melihat sebaran jumlah peminat per kelas (Reguler, Bilingual, Tahfizh) di Dashboard Admin, agar saya mengetahui tren minat pendaftar tahun ini.
8. Sebagai admin, saya ingin sebaran peminat per kelas di dashboard tidak menampilkan status "Penuh" atau batas maksimal kelas, agar tidak menimbulkan kebingungan bagi panitia.
9. Sebagai admin, saya ingin membuka menu Pengaturan Kuota dan hanya melihat satu kolom input Kapasitas Total Siswa Baru, agar pengaturannya sederhana dan cepat.
10. Sebagai admin, saya ingin ditolak jika memasukkan angka kapasitas total yang lebih kecil dari jumlah kursi Siswa Baru yang sudah terpakai saat ini, agar tidak merusak integritas data pendaftar yang sudah ada.
11. Sebagai admin, saya ingin ditolak jika memasukkan angka kapasitas total bernilai nol atau negatif, agar daya tampung sekolah selalu bernilai valid.
12. Sebagai admin, saya ingin dapat mengubah Pilihan Kelas seorang Pendaftar Siswa Baru di halaman detail tanpa dicegat validasi kuota kelas tujuan, karena perubahan antarkelas tidak menambah jumlah total kursi yang terpakai.
13. Sebagai admin, saya ingin saat mengubah status Pendaftar Ditolak atau Dibatalkan kembali menjadi Berproses atau Diterima, sistem memastikan kuota total 112 belum terlampaui.
14. Sebagai admin, saya ingin saat mengubah Jenis Pendaftaran dari Pindahan menjadi Siswa Baru, sistem memastikan kuota total masih memiliki sisa kursi.
15. Sebagai admin, saya ingin saat mengubah Jenis Pendaftaran dari Siswa Baru menjadi Pindahan, kursi Siswa Baru yang ditinggalkan otomatis terbebas untuk pendaftar lain.

### Panitia OKB

16. Sebagai panitia seleksi, saya ingin menerima seluruh data pendaftar sesuai kelas peminatan awal tanpa ada pembatasan artifisial dari sistem saat pendaftaran, agar seleksi objektif.
17. Sebagai panitia seleksi, saya ingin tetap dapat menempatkan pendaftar ke kelas yang berbeda dari Pilihan Kelasnya melalui Kelas Penempatan saat hasil OKB diumumkan, agar rombongan belajar dapat diseimbangkan sesuai kapasitas fisik ruangan dan kriteria akademik anak.

## Implementation Decisions

### 1. Struktur Domain dan Konfigurasi
- Nilai default kapasitas total 112 tetap bersumber dari konstanta konfigurasi pendaftaran.
- Tipe data dan fungsi pembantu ketersediaan kapasitas diadaptasi dari yang sebelumnya mengevaluasi kapasitas per kelas menjadi mengevaluasi kapasitas total sekolah.
- Fungsi pengecekan status kuota kelas (*Tersedia*, *Hampir penuh*, *Penuh*) per opsi kelas dihapus; digantikan dengan status ketersediaan kuota total pendaftaran Siswa Baru.

### 2. Tampilan Publik
- Komponen kartu pilihan kelas pada Landing Page tidak lagi menerima prop status ketersediaan kuota atau badge keterisian, dan murni merender detail fasilitas serta deskripsi kurikulum.
- Formulir pendaftaran publik merender opsi `pilihanKelas` (Reguler, Bilingual, Tahfizh) tanpa atribut `disabled` per opsi. Opsi radio `jenisPendaftaran` untuk *Siswa Baru* dinonaktifkan hanya jika total pendaftar Siswa Baru mencapai batas kuota total.

### 3. Dashboard Admin
- Kartu kapasitas di Admin Dashboard menampilkan ringkasan tunggal: persentase dan angka keterisian total (kursi terpakai vs total kuota 112).
- Di bawah progress bar total, disajikan daftar breakdown ringkas berupa jumlah pendaftar untuk masing-masing kelas (Reguler, Bilingual, Tahfizh) tanpa indikator batas kuota atau badge peringatan penuh.

### 4. Pengaturan Kuota Admin
- Tab Pengaturan Kuota (`/admin/pengaturan/kuota`) menyajikan form dengan satu input: **Kapasitas Total Siswa Baru**.
- Server action untuk menyimpan kapasitas memvalidasi:
  - Input adalah bilangan bulat positif (> 0).
  - Input tidak boleh lebih kecil dari jumlah kursi Siswa Baru yang saat ini berstatus terpakai (Berproses atau Diterima).
- Aksi ini memperbarui nilai kapasitas total di sistem dan memicu revalidasi path cache terkait.

### 5. Basis Data dan Fungsi Transaksi
- Tabel penyimpanan konfigurasi kuota disederhanakan untuk menyimpan angka kapasitas total sekolah (atau memanfaatkan satu baris representasi kapasitas total).
- Fungsi transaksi pendaftaran (`finalize_registration_with_capacity`) disederhanakan:
  - Mengambil total pendaftar Siswa Baru yang kursinya masih terpakai (`status NOT IN ('Ditolak', 'Dibatalkan') AND jenis_pendaftaran = 'Siswa Baru'`).
  - Membandingkan jumlah tersebut dengan total kuota.
  - Jika `terpakai >= kuota_total`, transaksi dibatalkan dengan eksepsi kuota penuh. Pilihan kelas pendaftar dicatat tanpa memvalidasi kuota per kelas.
- Fungsi transaksi pembaruan data/status oleh admin menyesuaikan logika pengecekan yang sama.

## Testing Decisions

### Seam Pengujian
Pengujian dilakukan pada seam level tertinggi yang mencakup kontrak perilaku sistem (behavioral contract):

1. **Seam Registrasi Publik (Server & Komponen Form)**:
   - Memverifikasi bahwa pendaftar Siswa Baru dapat memilih opsi kelas mana pun (Bilingual, Reguler, Tahfizh) secara bebas tanpa penolakan selama total pendaftar < 112.
   - Memverifikasi bahwa ketika total pendaftar Siswa Baru mencapai 112, registrasi Siswa Baru ditolak/ditutup, sedangkan pendaftar Pindahan tetap berhasil mendaftar.
   - Memverifikasi bahwa Landing Page tidak lagi menampilkan badge status ketersediaan kuota per kelas.
2. **Seam Aksi Pengaturan Kuota Admin (Server Action)**:
   - Memverifikasi bahwa admin dapat memperbarui angka kapasitas total.
   - Memverifikasi penolakan validasi jika angka yang dimasukkan <= 0 atau lebih kecil dari jumlah siswa baru yang sudah terdaftar.
3. **Seam Dashboard Admin (Server & Komponen Dashboard)**:
   - Memverifikasi rendering kartu kapasitas: menampilkan progress keterisian total 112 dan sebaran jumlah pendaftar per kelas tanpa status penuh per kelas.
4. **Seam Transaksi Basis Data**:
   - Memverifikasi fungsi transaksi RPC database mengunci dan memvalidasi batas akumulasi kursi Siswa Baru secara atomik.

### Prior Art
- `src/features/registration/__tests__/signedUploadCapacity.test.ts`
- `src/features/admin/capacity/actions/__tests__/saveClassCapacitiesAction.test.ts`
- `src/features/admin/components/__tests__/AdminDashboard.test.tsx`
- `src/features/home/__tests__/page.test.tsx`

## Out of Scope

- Penambahan pilihan kelas baru di luar Reguler, Bilingual, dan Tahfizh.
- Perubahan alur observasi OKB atau struktur tes OKB (Literasi, Numerasi, Tahsin).
- Perubahan tata cara penetapan Kelas Penempatan oleh Panitia di pengumuman hasil (tetap menggunakan mekanisme yang sudah ada).
- Perubahan dokumen persyaratan pendaftaran maupun integrasi biaya pendaftaran.

## Further Notes

- Perubahan ini merefleksikan kesepakatan pada [docs/adr/0003-kuota-total-siswa-baru-tanpa-batas-per-kelas.md](file:///c:/Users/Admin/Documents/Projek/spmb/docs/adr/0003-kuota-total-siswa-baru-tanpa-batas-per-kelas.md) yang menggantikan ADR-0001.
- Seluruh istilah mengacu pada glosarium domain di [CONTEXT.md](file:///c:/Users/Admin/Documents/Projek/spmb/CONTEXT.md).
