insert into public.konten (key, isi) values
('jadwal', '[
  {"tahapan": "Pendaftaran Gelombang 1", "tanggal": "1 Oktober – 31 Desember 2026"},
  {"tahapan": "Pendaftaran Gelombang 2", "tanggal": "1 Januari – 31 Maret 2027"},
  {"tahapan": "Pengumuman Hasil", "tanggal": "15 April 2027"},
  {"tahapan": "Daftar Ulang", "tanggal": "16 – 30 April 2027"}
]'::jsonb),
('syarat', '[
  {"teks": "Usia minimal 6 tahun pada 1 Juli 2027"},
  {"teks": "Fotokopi Kartu Keluarga"},
  {"teks": "Fotokopi Akta Kelahiran"},
  {"teks": "Pas foto terbaru"}
]'::jsonb),
('biaya', '[
  {"item": "Biaya Pendaftaran", "jumlah": "Rp 200.000"},
  {"item": "Uang Pangkal", "jumlah": "Hubungi panitia"},
  {"item": "SPP per Bulan", "jumlah": "Hubungi panitia"}
]'::jsonb),
('faq', '[
  {"tanya": "Apakah pendaftaran harus datang ke sekolah?", "jawab": "Tidak. Pendaftaran dilakukan online melalui website ini. Verifikasi berkas asli dilakukan saat daftar ulang."},
  {"tanya": "Bagaimana cara mengetahui hasil seleksi?", "jawab": "Gunakan menu Cek Status dengan nomor pendaftaran dan tanggal lahir anak."}
]'::jsonb),
('kontak', '{"whatsapp": "081234567890", "telepon": "0264-123456", "alamat": "Jl. Contoh No. 1, Purwakarta"}'::jsonb)
on conflict (key) do nothing;
