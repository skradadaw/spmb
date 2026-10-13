# SPMB SD Plus 3 Al-Muhajirin

Sistem pendaftaran calon murid baru SD Plus 3 Al-Muhajirin: orang tua mengisi data dan mengunggah berkas, lalu admin sekolah memverifikasi berkas, menjadwalkan OKB, dan mencatat keputusan penerimaan. Istilah utama ditulis dalam Bahasa Indonesia, padanan Inggris (dipakai di kode) dalam tanda kurung.

## Program

**Open Booking** (*Open Booking*):
Nama program sekolah untuk menerima pendaftaran calon murid sebelum SPMB resmi dari dinas pendidikan boleh dibuka. Dalam sistem ini, Open Booking adalah satu-satunya jalur pendaftaran.
_Avoid_: SPMB, PPDB (untuk merujuk program sekolah ini)

**Kuota** (*Capacity*):
Batas 112 kursi Siswa Baru, setara empat rombongan kelas, yang dibagi per Pilihan Kelas (awalnya 56 Bilingual, 28 Reguler, 28 Tahfizh). Admin dapat menggeser pembagian antarkelas selama totalnya tetap 112. Pilihan Kelas yang kuotanya penuh tidak dapat dipilih lagi. Yang memakai kursi hanya Pendaftar yang masih berproses atau Diterima; Pendaftar Ditolak, Dibatalkan, dan Pindahan tidak dihitung.

**OKB — Observasi Kesiapan Belajar** (*Learning Readiness Observation*):
Tes yang diikuti Pendaftar (Siswa Baru maupun Pindahan) setelah Berkasnya terverifikasi; hasilnya menjadi dasar Keputusan Penerimaan oleh Panitia.
_Avoid_: tes masuk, seleksi

**Jadwal OKB** (*OKB Schedule*):
Tanggal dan sesi OKB yang ditetapkan admin langsung pada seorang Pendaftar. Pendaftar yang tidak hadir dapat dijadwalkan ulang.

## Orang

**Pendaftar** (*Applicant*):
Seorang anak yang diajukan oleh orang tuanya dalam Open Booking, beserta seluruh data pengajuannya. Tetap disebut Pendaftar setelah Keputusan Penerimaan.
_Avoid_: Peserta, Participant, Murid, Siswa, Anak

**Admin** (*Admin*):
Satu-satunya pengguna sistem dari pihak sekolah; memverifikasi Berkas, menetapkan Jadwal OKB, dan memasukkan Keputusan Penerimaan yang sudah ditetapkan Panitia.

**Panitia** (*Committee*):
Tim sekolah yang menentukan Keputusan Penerimaan dan Kelas Penempatan berdasarkan hasil OKB.

**Pengusul** (*Referrer*):
Guru/karyawan SD Plus 3 atau kepala TK yang merujuk seorang Pendaftar. Hanya dicatat sebagai data tambahan untuk pemberian reward di luar sistem; tidak memengaruhi Keputusan Penerimaan.
_Avoid_: rujukan, referral (untuk orangnya)

## Data Pendaftar

**Nomor Pendaftaran** (*Registration Number*):
Nomor pengenal pendek seorang Pendaftar berformat `OB-<tahun ajaran>-<urut>`, misalnya `OB-2027-001`, yang diberikan saat pendaftaran berhasil (Berkas selesai terunggah).
_Avoid_: ID, kode pendaftaran

**Bukti Pendaftaran** (*Registration Proof*):
Dokumen PDF yang diterima orang tua saat pendaftaran berhasil, memuat Nomor Pendaftaran, QR berisi Nomor Pendaftaran, nama anak, Jenis Pendaftaran, Pilihan Kelas, dan Kelas Tujuan (Pindahan). Ditunjukkan saat datang OKB; tidak memuat Jadwal OKB. Bila hilang, admin mengunduhkannya kembali.
_Avoid_: kartu peserta, tiket

**Jenis Pendaftaran** (*Registration Type*):
Pembeda antara **Siswa Baru** (masuk kelas 1, dihitung dalam Kuota) dan **Pindahan** (pindah dari sekolah lain ke kelas yang lebih tinggi, tidak dihitung dalam Kuota dan tidak dibatasi jumlahnya oleh sistem).

**Kelas Tujuan** (*Target Grade*):
Tingkat kelas (2–6) yang dituju seorang Pendaftar Pindahan.

**Pilihan Kelas** (*Class Preference*):
Program kelas yang diminta orang tua saat mendaftar: Reguler, Bilingual, atau Tahfizh.

**Kelas Penempatan** (*Class Placement*):
Program kelas yang ditetapkan Panitia untuk Pendaftar yang Diterima; dapat berbeda dari Pilihan Kelas, misalnya Pendaftar Tahfizh ditempatkan di Reguler ketika Tahfizh tidak mencapai satu kelas.

**Berkas** (*Document*):
Salah satu dari empat dokumen wajib Pendaftar: Akta Kelahiran, Kartu Keluarga, Pas Foto, dan Bukti Pembayaran OKB.
_Avoid_: dokumen, file (di teks untuk pengguna)

**Afiliasi Direktorat 2** (*Directorate 2 Affiliation*):
Hubungan keluarga Pendaftar (orang tua bekerja atau saudara kandung bersekolah) dengan salah satu unit Direktorat 2 Al-Muhajirin. Menjadi dasar potongan uang bangunan bagi Pendaftar yang Diterima; potongannya diproses di luar sistem.

## Status Pendaftar

Urutan normal: **Menunggu Unggahan** → **Menunggu Verifikasi** → **Terverifikasi** → **Terjadwal OKB** → **Sudah OKB** → **Diterima** / **Ditolak**.

**Menunggu Unggahan**: data sudah dikirim tetapi Berkas belum selesai diunggah; belum dianggap mendaftar.

**Menunggu Verifikasi**: semua Berkas terunggah dan menunggu diperiksa admin.

**Terverifikasi**: keempat Berkas sudah dinyatakan sah.

**Terjadwal OKB**: Pendaftar sudah memiliki Jadwal OKB.

**Sudah OKB**: Pendaftar tercatat hadir mengikuti OKB dan menunggu Keputusan Penerimaan.

**Diterima** / **Ditolak**: hasil Keputusan Penerimaan oleh Panitia. Ditolak selalu berarti tidak lolos OKB.

**Dibatalkan** (*Withdrawn*): Pendaftar gugur di luar Keputusan Penerimaan atas keputusan admin, misalnya Berkas palsu, tidak hadir OKB dan tidak dijadwalkan ulang, atau mengundurkan diri, termasuk setelah Diterima. Admin dapat memulihkan Pendaftar ke status sebelumnya selama kuota Pilihan Kelasnya masih tersedia.
_Avoid_: Ditolak (untuk kasus ini)

## Proses

**Keputusan Penerimaan** (*Admission Decision*):
Penetapan Panitia bahwa seorang Pendaftar Diterima atau Ditolak, beserta Kelas Penempatannya, yang hanya diambil setelah Pendaftar mengikuti OKB.

**Scan Kehadiran** (*Attendance Scan*):
Pemindaian QR pada Bukti Pendaftaran oleh admin di hari OKB, yang langsung mencatat Pendaftar hadir (Terjadwal OKB → Sudah OKB). Hanya berlaku bagi Pendaftar Terjadwal OKB pada tanggal Jadwal OKB-nya; selain itu tidak ada yang dicatat dan admin menjadwalkan ulang bila perlu.

**Perlu Tindak Lanjut** (*Follow-up Required*):
Penanda admin pada satu Berkas yang belum dapat diterima. Admin menghubungi orang tua dan menerima berkas pengganti di luar sistem, lalu mengunggahnya sebagai Berkas Pengganti dan memverifikasinya.
_Avoid_: follow_up, ditolak (untuk berkas)

**Berkas Pengganti** (*Replacement Document*):
File yang diunggah admin untuk menggantikan salah satu Berkas Pendaftar, kapan pun dan pada status apa pun. File lama dihapus, Berkas kembali berstatus belum diperiksa, dan status Pendaftar tidak berubah.
_Avoid_: upload ulang, revisi berkas

**NISN Tidak Sesuai** (*Unverified NISN*):
Penanda admin pada Pendaftar yang NISN-nya diduga salah atau asal diisi orang tua. Bukan Status Pendaftar dan tidak menghalangi langkah apa pun; admin menghubungi orang tua untuk meminta NISN yang benar dari TK asal. Penanda hilang ketika admin mengganti NISN, atau dihapus admin bila NISN ternyata benar.
_Avoid_: NISN salah, NISN invalid, status NISN

**Perlu Perhatian** (*Needs Attention*):
Ringkasan masalah yang masih harus ditangani admin pada seorang Pendaftar: NISN Tidak Sesuai, Berkas Perlu Tindak Lanjut, atau Berkas yang belum tersedia. Berkas yang sekadar belum diperiksa tidak termasuk. Pendaftar Dibatalkan dan Ditolak tidak pernah Perlu Perhatian.
