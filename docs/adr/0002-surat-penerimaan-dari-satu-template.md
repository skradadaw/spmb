# Surat Penerimaan dibuat dari satu template dengan posisi isian tetap

Surat Penerimaan setiap Pendaftar Diterima dibuat otomatis saat orang tua mengunduhnya, dengan menulis nomor surat, nama anak, asal sekolah, Nomor VA, serta nama dan tempat/tanggal lahir anak di atas satu template PDF 2 halaman yang diunggah admin. Di halaman pengumuman, template memuat teks contoh (`{urut}` pada baris Nomor, `(NAMA SISWA)`, `(NAMA SEKOLAH)`, dan label `Account (VA):`); sistem menghapus teks contoh itu dan menulis datanya tepat di posisinya, sehingga tata letak boleh bergeser selama teks contohnya ada. Ini hanya berlaku untuk PDF yang teksnya terbaca langsung, seperti hasil Microsoft Word. Bila teks contoh tidak ditemukan, dan untuk titik-titik isian Surat Pernyataan yang tidak terbaca, sistem memakai posisi tetap yang diukur dari template sekolah dan dikunci di kode; admin melihat pratinjau berdata contoh setiap kali mengunggah template untuk memastikannya.

Isi nomor surat tidak diambil dari template: seluruh barisnya ditulis ulang sistem dari format yang diisi admin (misalnya `400.3.10.1/{urut}-SDS3AM/OKB/2026`) dan nomor urut anak. Nomor urut diberikan sekali saat Pengumuman Hasil OKB, urut Nomor Pendaftaran, melanjutkan nomor terakhir yang terpakai atau nomor urut awal yang diisi admin bila lebih besar, dan tidak berubah walau pengumuman ditarik lalu diumumkan lagi.

## Considered Options

- **Admin mengunggah satu PDF jadi per Pendaftar**: ditolak karena berarti membuat dan mengunggah sekitar 112 file di luar sistem, dan Nomor VA tidak tercatat di sistem sehingga tidak bisa diperiksa sebelum diumumkan.
- **Menggambar ulang seluruh surat di kode seperti Bukti Pendaftaran**: ditolak karena setiap perubahan teks surat oleh sekolah akan membutuhkan perubahan kode.
- **Admin mengatur posisi isian sendiri lewat antarmuka**: ditolak demi kesederhanaan; tata letak surat jarang berubah antartahun ajaran.
