-- ==========================================================
-- SKEMA & MIGRASI LENGKAP DATABASE SPMB
-- Tabel: public.pendaftar
-- ==========================================================

-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buat Tabel Jika Belum Ada
CREATE TABLE IF NOT EXISTS public.pendaftar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tambahkan / Pastikan Semua Kolom Tersedia (Aman untuk tabel yang sudah ada sebelumnya)
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi';
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS catatan_admin TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS submission_id UUID;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS submission_secret_hash TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS upload_expires_at TIMESTAMPTZ;

-- Lepaskan constraint NOT NULL dari kolom no_telp lama (jika ada dari skema lama)
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='pendaftar' AND column_name='no_telp'
    ) THEN 
        ALTER TABLE public.pendaftar ALTER COLUMN no_telp DROP NOT NULL;
    END IF;
END $$;

-- Data Murid
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jenis_pendaftaran VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS pilihan_kelas VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kelas_tujuan VARCHAR(10);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jenis_kelamin VARCHAR(20);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nik VARCHAR(16);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nisn VARCHAR(20);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS bekerja_di_direktorat2 VARCHAR(10) DEFAULT 'Tidak';
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS profesi_di_direktorat2 VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_orangtua_direktorat2 VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS unit_orangtua_direktorat2 VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS saudara_di_direktorat2 VARCHAR(10) DEFAULT 'Tidak';
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_saudara_direktorat2 VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS unit_saudara_direktorat2 VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS asal_sekolah VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS prestasi_anak TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS tingkat_prestasi VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jarak_ke_sekolah VARCHAR(20);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS alamat_jalan TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS rt VARCHAR(10);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS rw VARCHAR(10);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kelurahan VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kota VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS provinsi VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS alamat_rumah TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS ada_pengusul VARCHAR(10) DEFAULT 'Tidak';
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS tipe_pengusul VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_tk_pengusul VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_pengusul VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_wa_pengusul VARCHAR(20);

-- Data Ayah
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_ayah VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nik_ayah VARCHAR(16);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS pendidikan_ayah VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS pekerjaan_ayah VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS penghasilan_ayah VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS telepon_ayah VARCHAR(20);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS alamat_ayah TEXT;

-- Data Ibu
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nama_ibu VARCHAR(255);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nik_ibu VARCHAR(16);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS pendidikan_ibu VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS pekerjaan_ibu VARCHAR(100);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS penghasilan_ibu VARCHAR(50);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS telepon_ibu VARCHAR(20);
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS alamat_ibu TEXT;

-- Dokumen
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS dokumen_akta_kelahiran TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS dokumen_kartu_keluarga TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS dokumen_pas_foto TEXT;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS dokumen_bukti_pembayaran TEXT;

-- OKB dan pembatalan
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jadwal_okb_tanggal DATE;
-- Gelombang OKB (1-3) menggantikan sesi teks bebas; jadwal lama semuanya masuk Gelombang 1.
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jadwal_okb_gelombang SMALLINT CHECK (jadwal_okb_gelombang BETWEEN 1 AND 3);
UPDATE public.pendaftar SET jadwal_okb_gelombang = 1 WHERE jadwal_okb_tanggal IS NOT NULL AND jadwal_okb_gelombang IS NULL;
ALTER TABLE public.pendaftar DROP COLUMN IF EXISTS jadwal_okb_sesi;
-- Terjadwal OKB selalu punya tanggal dan Gelombang.
ALTER TABLE public.pendaftar DROP CONSTRAINT IF EXISTS pendaftar_jadwal_okb_check;
ALTER TABLE public.pendaftar
  ADD CONSTRAINT pendaftar_jadwal_okb_check
  CHECK (status <> 'Terjadwal OKB' OR (jadwal_okb_tanggal IS NOT NULL AND jadwal_okb_gelombang IS NOT NULL));
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS status_sebelum_dibatalkan VARCHAR(50);

-- Keputusan Penerimaan
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kelas_penempatan VARCHAR(50);
-- Pengumuman Hasil OKB: terisi sejak Keputusan Penerimaan dapat dilihat orang tua.
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS diumumkan_pada TIMESTAMPTZ;

-- Nomor Pendaftaran (OB-<tahun ajaran>-<urut>), diberikan saat pendaftaran berhasil
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_pendaftaran VARCHAR(20);

-- Nomor VA: 16 digit dari bank untuk Pendaftar Diterima, berbeda untuk setiap Pendaftar.
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_va VARCHAR(16);
ALTER TABLE public.pendaftar DROP CONSTRAINT IF EXISTS pendaftar_nomor_va_check;
ALTER TABLE public.pendaftar
  ADD CONSTRAINT pendaftar_nomor_va_check
  CHECK (nomor_va IS NULL OR nomor_va ~ '^[0-9]{16}$');

-- 4. Indeks
CREATE INDEX IF NOT EXISTS idx_pendaftar_nik ON public.pendaftar (nik);
CREATE INDEX IF NOT EXISTS idx_pendaftar_created_at ON public.pendaftar (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pendaftar_status ON public.pendaftar (status);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.pendaftar
    WHERE nik IS NOT NULL AND status <> 'Menunggu Unggahan'
    GROUP BY nik HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate finalized NIK values must be resolved before migration';
  END IF;
END $$;

DROP INDEX IF EXISTS public.uq_pendaftar_nik;
CREATE UNIQUE INDEX uq_pendaftar_nik
ON public.pendaftar (nik)
WHERE nik IS NOT NULL AND status <> 'Menunggu Unggahan';

CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_submission_id
ON public.pendaftar (submission_id)
WHERE submission_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_nomor_pendaftaran
ON public.pendaftar (nomor_pendaftaran)
WHERE nomor_pendaftaran IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_nomor_va
ON public.pendaftar (nomor_va)
WHERE nomor_va IS NOT NULL;

-- Nomor urut berikutnya untuk Open Booking 2027/2028. Ganti prefiks untuk tahun ajaran berikutnya.
CREATE OR REPLACE FUNCTION public.next_registration_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'OB-2027-' || lpad((COALESCE(max(substring(nomor_pendaftaran FROM 9)::INTEGER), 0) + 1)::TEXT, 3, '0')
  FROM public.pendaftar
  WHERE nomor_pendaftaran LIKE 'OB-2027-%';
$$;

REVOKE ALL ON FUNCTION public.next_registration_number() FROM PUBLIC, anon, authenticated;

-- Beri nomor kepada Pendaftar lama, berurutan sesuai waktu daftar.
DO $$
DECLARE v_id UUID;
BEGIN
  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;
  FOR v_id IN
    SELECT id FROM public.pendaftar
    WHERE nomor_pendaftaran IS NULL AND status <> 'Menunggu Unggahan'
    ORDER BY created_at, id
  LOOP
    UPDATE public.pendaftar SET nomor_pendaftaran = public.next_registration_number() WHERE id = v_id;
  END LOOP;
END $$;

-- 5. Trigger Otomatis updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pendaftar_updated_at ON public.pendaftar;
CREATE TRIGGER set_pendaftar_updated_at
BEFORE UPDATE ON public.pendaftar
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE public.pendaftar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public pendaftar insert" ON public.pendaftar;
DROP POLICY IF EXISTS "Authenticated users can select pendaftar" ON public.pendaftar;
DROP POLICY IF EXISTS "Authenticated users can update pendaftar" ON public.pendaftar;

DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pendaftar'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.pendaftar', policy_record.policyname);
  END LOOP;
END $$;

REVOKE ALL ON TABLE public.pendaftar FROM PUBLIC, anon, authenticated;

-- 6a. Internal admin document reviews
CREATE TABLE IF NOT EXISTS public.verifikasi_dokumen (
  pendaftar_id UUID NOT NULL REFERENCES public.pendaftar(id) ON DELETE CASCADE,
  dokumen_id TEXT NOT NULL CHECK (dokumen_id IN ('aktaKelahiran', 'kartuKeluarga', 'pasFoto', 'buktiPembayaran')),
  status TEXT NOT NULL CHECK (status = 'verified'),
  catatan TEXT,
  diperiksa_oleh TEXT NOT NULL DEFAULT 'Admin',
  diperiksa_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pendaftar_id, dokumen_id)
);
ALTER TABLE public.verifikasi_dokumen DROP CONSTRAINT IF EXISTS verifikasi_dokumen_check;
-- Perlu Tindak Lanjut dihapus: Berkas hanya belum diperiksa (tanpa baris) atau terverifikasi.
DELETE FROM public.verifikasi_dokumen WHERE status <> 'verified';
ALTER TABLE public.verifikasi_dokumen DROP CONSTRAINT IF EXISTS verifikasi_dokumen_status_check;
ALTER TABLE public.verifikasi_dokumen ADD CONSTRAINT verifikasi_dokumen_status_check CHECK (status = 'verified');
UPDATE public.pendaftar AS peserta
SET catatan_admin = catatan_terlama.catatan
FROM (
  SELECT pendaftar_id, string_agg(DISTINCT trim(catatan), E'\n' ORDER BY trim(catatan)) AS catatan
  FROM public.verifikasi_dokumen
  WHERE catatan IS NOT NULL AND trim(catatan) <> ''
  GROUP BY pendaftar_id
) AS catatan_terlama
WHERE peserta.id = catatan_terlama.pendaftar_id
  AND peserta.catatan_admin IS NULL;
ALTER TABLE public.verifikasi_dokumen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.verifikasi_dokumen FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.verifikasi_dokumen TO service_role;

-- 6a-2. Perlu Perhatian: NISN Tidak Sesuai dan Berkas yang belum tersedia
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nisn_tidak_sesuai BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS berkas_belum_tersedia SMALLINT GENERATED ALWAYS AS (
  ((NULLIF(btrim(dokumen_akta_kelahiran), '') IS NULL)::INTEGER
  + (NULLIF(btrim(dokumen_kartu_keluarga), '') IS NULL)::INTEGER
  + (NULLIF(btrim(dokumen_pas_foto), '') IS NULL)::INTEGER
  + (NULLIF(btrim(dokumen_bukti_pembayaran), '') IS NULL)::INTEGER)::SMALLINT
) STORED;

-- Metode Pembayaran OKB: dicatat admin dari Bukti Pembayaran; kosong sampai admin memilih.
ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS metode_pembayaran_okb TEXT;
ALTER TABLE public.pendaftar DROP CONSTRAINT IF EXISTS pendaftar_metode_pembayaran_okb_check;
ALTER TABLE public.pendaftar
  ADD CONSTRAINT pendaftar_metode_pembayaran_okb_check
  CHECK (metode_pembayaran_okb IS NULL OR metode_pembayaran_okb IN ('cash', 'transfer'));

-- Mengganti NISN menghapus penanda NISN Tidak Sesuai, kecuali penandanya ikut diubah dalam update yang sama.
CREATE OR REPLACE FUNCTION public.clear_nisn_flag_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.nisn IS DISTINCT FROM OLD.nisn AND NEW.nisn_tidak_sesuai IS NOT DISTINCT FROM OLD.nisn_tidak_sesuai THEN
    NEW.nisn_tidak_sesuai := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clear_nisn_flag ON public.pendaftar;
CREATE TRIGGER trg_clear_nisn_flag
BEFORE UPDATE OF nisn ON public.pendaftar
FOR EACH ROW EXECUTE FUNCTION public.clear_nisn_flag_on_change();

-- Perlu Tindak Lanjut sudah tidak dipakai; hitungannya dibuang.
DROP TRIGGER IF EXISTS trg_sync_berkas_tindak_lanjut ON public.verifikasi_dokumen;
DROP FUNCTION IF EXISTS public.sync_berkas_tindak_lanjut();
ALTER TABLE public.pendaftar DROP COLUMN IF EXISTS berkas_tindak_lanjut;

-- 6b. Kuota per Pilihan Kelas (lihat docs/adr/0001-kuota-per-pilihan-kelas.md)
CREATE TABLE IF NOT EXISTS public.kuota_kelas (
  pilihan_kelas TEXT PRIMARY KEY CHECK (pilihan_kelas IN ('Reguler', 'Bilingual', 'Tahfizh')),
  kuota INTEGER NOT NULL CHECK (kuota >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.kuota_kelas (pilihan_kelas, kuota) VALUES
  ('Bilingual', 56),
  ('Reguler', 28),
  ('Tahfizh', 28)
ON CONFLICT (pilihan_kelas) DO NOTHING;

ALTER TABLE public.kuota_kelas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.kuota_kelas FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.kuota_kelas TO service_role;

-- Kursi terpakai: Siswa Baru yang masih berproses atau Diterima.
CREATE OR REPLACE FUNCTION public.get_class_capacity_usage()
RETURNS TABLE(pilihan_kelas TEXT, kuota INTEGER, terpakai INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.pilihan_kelas, k.kuota, count(p.id)::INTEGER AS terpakai
  FROM public.kuota_kelas AS k
  LEFT JOIN public.pendaftar AS p
    ON p.pilihan_kelas = k.pilihan_kelas
   AND p.jenis_pendaftaran = 'Siswa Baru'
   AND p.status NOT IN ('Menunggu Unggahan', 'Ditolak', 'Dibatalkan')
  GROUP BY k.pilihan_kelas, k.kuota
  ORDER BY k.pilihan_kelas;
$$;

REVOKE ALL ON FUNCTION public.get_class_capacity_usage() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_capacity_usage() TO service_role;

-- Pembagian kuota diubah admin; total harus tetap dan tidak boleh di bawah kursi terpakai.
CREATE OR REPLACE FUNCTION public.update_class_capacities(
  p_reguler INTEGER,
  p_bilingual INTEGER,
  p_tahfizh INTEGER,
  p_total INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kelas TEXT;
BEGIN
  IF p_reguler IS NULL OR p_bilingual IS NULL OR p_tahfizh IS NULL
    OR p_reguler < 0 OR p_bilingual < 0 OR p_tahfizh < 0 THEN
    RETURN 'invalid';
  END IF;
  IF p_reguler + p_bilingual + p_tahfizh <> p_total THEN
    RETURN 'total_mismatch';
  END IF;

  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  SELECT usage.pilihan_kelas INTO v_kelas
  FROM public.get_class_capacity_usage() AS usage
  WHERE usage.terpakai > CASE usage.pilihan_kelas
    WHEN 'Reguler' THEN p_reguler
    WHEN 'Bilingual' THEN p_bilingual
    ELSE p_tahfizh
  END
  LIMIT 1;

  IF v_kelas IS NOT NULL THEN
    RETURN 'below_used:' || v_kelas;
  END IF;

  INSERT INTO public.kuota_kelas (pilihan_kelas, kuota, updated_at) VALUES
    ('Reguler', p_reguler, now()),
    ('Bilingual', p_bilingual, now()),
    ('Tahfizh', p_tahfizh, now())
  ON CONFLICT (pilihan_kelas) DO UPDATE
  SET kuota = EXCLUDED.kuota, updated_at = EXCLUDED.updated_at;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.update_class_capacities(INTEGER, INTEGER, INTEGER, INTEGER)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_class_capacities(INTEGER, INTEGER, INTEGER, INTEGER)
TO service_role;

-- Pemulihan Pendaftar Dibatalkan ke status sebelumnya, hanya jika kursi Pilihan Kelasnya masih ada.
CREATE OR REPLACE FUNCTION public.restore_cancelled_applicant(p_pendaftar_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_sebelum TEXT;
  v_jenis TEXT;
  v_kelas TEXT;
  v_kuota INTEGER;
  v_terpakai INTEGER;
BEGIN
  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  SELECT status, status_sebelum_dibatalkan, jenis_pendaftaran, pilihan_kelas
  INTO v_status, v_sebelum, v_jenis, v_kelas
  FROM public.pendaftar
  WHERE id = p_pendaftar_id;

  IF NOT FOUND OR v_status <> 'Dibatalkan' THEN
    RETURN 'invalid';
  END IF;

  IF v_jenis IS DISTINCT FROM 'Pindahan' THEN
    SELECT usage.kuota, usage.terpakai INTO v_kuota, v_terpakai
    FROM public.get_class_capacity_usage() AS usage
    WHERE usage.pilihan_kelas = v_kelas;

    IF NOT FOUND OR v_terpakai >= v_kuota THEN
      RETURN 'full';
    END IF;
  END IF;

  UPDATE public.pendaftar
  SET status = COALESCE(v_sebelum, 'Menunggu Verifikasi'),
      status_sebelum_dibatalkan = NULL
  WHERE id = p_pendaftar_id;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.restore_cancelled_applicant(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_cancelled_applicant(UUID) TO service_role;

-- Keputusan Penerimaan oleh Panitia, dicatat admin setelah OKB. Revisi Ditolak -> Diterima harus mendapat kursi lagi.
CREATE OR REPLACE FUNCTION public.decide_admission(
  p_pendaftar_id UUID,
  p_keputusan TEXT,
  p_kelas_penempatan TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_jenis TEXT;
  v_kelas TEXT;
  v_kuota INTEGER;
  v_terpakai INTEGER;
BEGIN
  IF p_keputusan NOT IN ('Diterima', 'Ditolak')
    OR (p_keputusan = 'Diterima' AND p_kelas_penempatan NOT IN ('Reguler', 'Bilingual', 'Tahfizh'))
    OR (p_keputusan = 'Diterima' AND p_kelas_penempatan IS NULL) THEN
    RETURN 'invalid';
  END IF;

  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  SELECT status, jenis_pendaftaran, pilihan_kelas INTO v_status, v_jenis, v_kelas
  FROM public.pendaftar
  WHERE id = p_pendaftar_id;

  IF NOT FOUND OR v_status NOT IN ('Sudah OKB', 'Diterima', 'Ditolak') THEN
    RETURN 'invalid';
  END IF;

  IF p_keputusan = 'Diterima' AND v_status = 'Ditolak' AND v_jenis IS DISTINCT FROM 'Pindahan' THEN
    SELECT usage.kuota, usage.terpakai INTO v_kuota, v_terpakai
    FROM public.get_class_capacity_usage() AS usage
    WHERE usage.pilihan_kelas = v_kelas;

    IF NOT FOUND OR v_terpakai >= v_kuota THEN
      RETURN 'full';
    END IF;
  END IF;

  UPDATE public.pendaftar
  SET status = p_keputusan,
      kelas_penempatan = CASE WHEN p_keputusan = 'Diterima' THEN p_kelas_penempatan ELSE NULL END
  WHERE id = p_pendaftar_id;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.decide_admission(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decide_admission(UUID, TEXT, TEXT) TO service_role;

-- Pengumuman Hasil OKB untuk satu Pendaftar atau satu Gelombang OKB, dalam satu transaksi.
-- Mengumumkan ditolak seluruhnya bila belum ada template aktif atau ada Pendaftar Diterima tanpa Nomor VA.
CREATE OR REPLACE FUNCTION public.announce_results(
  p_pendaftar_id UUID,
  p_gelombang SMALLINT,
  p_umumkan BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tanpa_va JSONB;
  v_diterima INTEGER;
  v_ditolak INTEGER;
  v_dilewati INTEGER;
  v_ditarik INTEGER;
BEGIN
  IF (p_pendaftar_id IS NULL) = (p_gelombang IS NULL) OR p_umumkan IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  -- Baris sasaran dikunci agar keputusan dan Nomor VA tidak berubah di tengah pengumuman.
  PERFORM 1 FROM public.pendaftar
  WHERE id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang
  FOR UPDATE;

  IF p_pendaftar_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.pendaftar WHERE id = p_pendaftar_id AND status IN ('Diterima', 'Ditolak')
  ) THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  IF NOT p_umumkan THEN
    UPDATE public.pendaftar
    SET diumumkan_pada = NULL
    WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang)
      AND diumumkan_pada IS NOT NULL;
    GET DIAGNOSTICS v_ditarik = ROW_COUNT;
    RETURN jsonb_build_object('status', 'ok', 'ditarik', v_ditarik);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.template_surat_penerimaan) THEN
    RETURN jsonb_build_object('status', 'no-template');
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('nama', nama_lengkap, 'nomor', nomor_pendaftaran) ORDER BY nama_lengkap), '[]'::JSONB)
  INTO v_tanpa_va
  FROM public.pendaftar
  WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang)
    AND status = 'Diterima'
    AND nomor_va IS NULL
    AND diumumkan_pada IS NULL;

  IF jsonb_array_length(v_tanpa_va) > 0 THEN
    RETURN jsonb_build_object('status', 'missing-va', 'pendaftar', v_tanpa_va);
  END IF;

  -- Yang belum diputuskan dilewati dan dilaporkan.
  SELECT count(*) INTO v_dilewati
  FROM public.pendaftar
  WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang) AND status = 'Sudah OKB';

  WITH diumumkan AS (
    UPDATE public.pendaftar
    SET diumumkan_pada = now()
    WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang)
      AND status IN ('Diterima', 'Ditolak')
      AND diumumkan_pada IS NULL
    RETURNING status
  )
  SELECT count(*) FILTER (WHERE status = 'Diterima'), count(*) FILTER (WHERE status = 'Ditolak')
  INTO v_diterima, v_ditolak
  FROM diumumkan;

  RETURN jsonb_build_object('status', 'ok', 'diterima', v_diterima, 'ditolak', v_ditolak, 'dilewati', v_dilewati);
END;
$$;

REVOKE ALL ON FUNCTION public.announce_results(UUID, SMALLINT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.announce_results(UUID, SMALLINT, BOOLEAN) TO service_role;

-- Impor Nomor VA: semua pasangan tersimpan atau tidak sama sekali. Hanya Pendaftar Diterima
-- yang belum diumumkan dan belum punya Nomor VA; selain itu impor ditolak karena data sudah berubah.
CREATE OR REPLACE FUNCTION public.import_nomor_va(p_pasangan JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disimpan INTEGER;
BEGIN
  IF jsonb_typeof(p_pasangan) <> 'array' OR jsonb_array_length(p_pasangan) = 0 THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_pasangan) AS x(nomor TEXT, va TEXT)
    LEFT JOIN public.pendaftar AS p ON p.nomor_pendaftaran = x.nomor
    WHERE p.id IS NULL
      OR p.status <> 'Diterima'
      OR p.diumumkan_pada IS NOT NULL
      OR p.nomor_va IS NOT NULL
      OR x.va IS NULL
      OR x.va !~ '^[0-9]{16}$'
  ) THEN
    RETURN jsonb_build_object('status', 'stale');
  END IF;

  UPDATE public.pendaftar AS p
  SET nomor_va = x.va
  FROM jsonb_to_recordset(p_pasangan) AS x(nomor TEXT, va TEXT)
  WHERE p.nomor_pendaftaran = x.nomor;
  GET DIAGNOSTICS v_disimpan = ROW_COUNT;

  RETURN jsonb_build_object('status', 'ok', 'disimpan', v_disimpan);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('status', 'duplicate');
END;
$$;

REVOKE ALL ON FUNCTION public.import_nomor_va(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_nomor_va(JSONB) TO service_role;

-- Admin mengubah Jenis Pendaftaran / Pilihan Kelas; kursi baru hanya diberikan bila kuota kelas tujuan masih ada.
CREATE OR REPLACE FUNCTION public.update_applicant_registration(
  p_pendaftar_id UUID,
  p_jenis TEXT,
  p_kelas TEXT,
  p_kelas_tujuan TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_jenis TEXT;
  v_kelas TEXT;
  v_kuota INTEGER;
  v_terpakai INTEGER;
BEGIN
  IF p_jenis NOT IN ('Siswa Baru', 'Pindahan')
    OR p_kelas NOT IN ('Reguler', 'Bilingual', 'Tahfizh')
    OR (p_jenis = 'Pindahan' AND (p_kelas_tujuan IS NULL OR p_kelas_tujuan NOT IN ('2', '3', '4', '5', '6'))) THEN
    RETURN 'invalid';
  END IF;

  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  SELECT status, jenis_pendaftaran, pilihan_kelas INTO v_status, v_jenis, v_kelas
  FROM public.pendaftar
  WHERE id = p_pendaftar_id;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  -- Kursi baru dibutuhkan bila hasilnya Siswa Baru yang memakai kursi di kelas yang belum ditempatinya.
  IF p_jenis = 'Siswa Baru'
    AND v_status NOT IN ('Menunggu Unggahan', 'Ditolak', 'Dibatalkan')
    AND (v_jenis IS DISTINCT FROM 'Siswa Baru' OR v_kelas IS DISTINCT FROM p_kelas) THEN
    SELECT usage.kuota, usage.terpakai INTO v_kuota, v_terpakai
    FROM public.get_class_capacity_usage() AS usage
    WHERE usage.pilihan_kelas = p_kelas;

    IF NOT FOUND OR v_terpakai >= v_kuota THEN
      RETURN 'full';
    END IF;
  END IF;

  UPDATE public.pendaftar
  SET jenis_pendaftaran = p_jenis,
      pilihan_kelas = p_kelas,
      kelas_tujuan = CASE WHEN p_jenis = 'Pindahan' THEN p_kelas_tujuan ELSE NULL END
  WHERE id = p_pendaftar_id;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.update_applicant_registration(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_applicant_registration(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Ringkasan dashboard admin dihitung di database: hanya angka agregat yang dikirim.
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH today AS (SELECT (now() AT TIME ZONE 'Asia/Jakarta')::date AS d)
  SELECT jsonb_build_object(
    'today', (SELECT d FROM today),
    -- Menunggu Unggahan belum dianggap mendaftar.
    'total', (SELECT count(*) FROM public.pendaftar WHERE status <> 'Menunggu Unggahan'),
    'tasks', (
      SELECT jsonb_build_object(
        'uploading', count(*) FILTER (WHERE status = 'Menunggu Unggahan'),
        'awaiting', count(*) FILTER (WHERE status = 'Menunggu Verifikasi'),
        'verified', count(*) FILTER (WHERE status = 'Terverifikasi'),
        -- Tidak Hadir OKB: tanggal Jadwal OKB sudah lewat tanpa Scan Kehadiran.
        'absent', count(*) FILTER (WHERE status = 'Terjadwal OKB' AND jadwal_okb_tanggal < (SELECT d FROM today)),
        'decision', count(*) FILTER (WHERE status = 'Sudah OKB'),
        -- Keputusan Penerimaan yang belum dibuka untuk orang tua.
        'unannounced', count(*) FILTER (WHERE status IN ('Diterima', 'Ditolak') AND diumumkan_pada IS NULL)
      )
      FROM public.pendaftar
    ),
    -- Perlu Perhatian tidak pernah menghitung Pendaftar Dibatalkan atau Ditolak.
    'attention', (
      SELECT jsonb_build_object(
        'any', count(*) FILTER (WHERE nisn_tidak_sesuai OR berkas_belum_tersedia > 0),
        'nisn', count(*) FILTER (WHERE nisn_tidak_sesuai)
      )
      FROM public.pendaftar
      WHERE status NOT IN ('Dibatalkan', 'Ditolak')
    ),
    -- Sama dengan menu Kuota Kelas agar kedua halaman tidak pernah berbeda angka.
    'capacity', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('label', usage.pilihan_kelas, 'kuota', usage.kuota, 'terpakai', usage.terpakai))
      FROM public.get_class_capacity_usage() AS usage
    ), '[]'::jsonb),
    'transfers', (
      SELECT count(*) FROM public.pendaftar
      WHERE jenis_pendaftaran = 'Pindahan' AND status NOT IN ('Menunggu Unggahan', 'Ditolak', 'Dibatalkan')
    ),
    'results', (
      SELECT jsonb_build_object(
        'accepted', count(*) FILTER (WHERE status = 'Diterima'),
        'rejected', count(*) FILTER (WHERE status = 'Ditolak'),
        'withdrawn', count(*) FILTER (WHERE status = 'Dibatalkan')
      )
      FROM public.pendaftar
    ),
    'acceptedByClass', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('label', kelas, 'count', jumlah))
      FROM (
        SELECT COALESCE(kelas_penempatan, pilihan_kelas) AS kelas, count(*) AS jumlah
        FROM public.pendaftar
        WHERE status = 'Diterima' AND jenis_pendaftaran = 'Siswa Baru'
        GROUP BY 1
      ) AS diterima
    ), '[]'::jsonb),
    -- Empat tanggal OKB terdekat, dihitung per Gelombang OKB.
    'schedule', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('date', tanggal, 'total', total, 'waves', gelombang) ORDER BY tanggal)
      FROM (
        SELECT tanggal, sum(jumlah)::INTEGER AS total, jsonb_agg(jsonb_build_object('wave', wave, 'count', jumlah) ORDER BY wave) AS gelombang
        FROM (
          SELECT jadwal_okb_tanggal AS tanggal, jadwal_okb_gelombang AS wave, count(*)::INTEGER AS jumlah
          FROM public.pendaftar
          WHERE status = 'Terjadwal OKB' AND jadwal_okb_tanggal >= (SELECT d FROM today)
          GROUP BY jadwal_okb_tanggal, jadwal_okb_gelombang
        ) AS per_gelombang
        GROUP BY tanggal
        ORDER BY tanggal
        LIMIT 4
      ) AS per_tanggal
    ), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_summary() TO service_role;

-- 7. Setup Storage Bucket (Supabase Storage)
INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) VALUES (
  'dokumen_pendaftaran',
  'dokumen_pendaftaran',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Upload Dokumen" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Dokumen" ON storage.objects;

-- 7a. Template Surat Penerimaan (lihat docs/adr/0002-surat-penerimaan-dari-satu-template.md)
-- Bucket privat terpisah dari Berkas; hanya diakses server dengan service role.
INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) VALUES (
  'template_surat',
  'template_surat',
  false,
  5242880,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Satu baris saja: template yang sedang aktif.
CREATE TABLE IF NOT EXISTS public.template_surat_penerimaan (
  id TEXT PRIMARY KEY DEFAULT 'aktif' CHECK (id = 'aktif'),
  path TEXT NOT NULL,
  diunggah_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.template_surat_penerimaan ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.template_surat_penerimaan FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.template_surat_penerimaan TO service_role;

-- 8. Pembatasan laju pendaftaran atomik (hanya service role)
CREATE TABLE IF NOT EXISTS public.registration_rate_limits (
  identifier_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0)
);

ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_registration_rate_limit(
  p_identifier_hash TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  IF btrim(p_identifier_hash) = '' OR p_limit <= 0 OR p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'Invalid registration rate-limit parameters';
  END IF;

  INSERT INTO public.registration_rate_limits AS limits (
    identifier_hash,
    window_started_at,
    attempts
  )
  VALUES (p_identifier_hash, now(), 1)
  ON CONFLICT (identifier_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN now()
      ELSE limits.window_started_at
    END,
    attempts = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.attempts + 1
    END
  RETURNING attempts INTO v_attempts;

  RETURN v_attempts <= p_limit;
END;
$$;

REVOKE ALL ON TABLE public.registration_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_registration_rate_limit(TEXT, INTEGER, INTEGER)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_registration_rate_limit(TEXT, INTEGER, INTEGER)
TO service_role;

-- 8a. Pembatasan percobaan gagal Cek Hasil OKB per klien (hanya service role).
-- Dicatat di database karena instance serverless tidak berbagi memori.
CREATE TABLE IF NOT EXISTS public.result_check_failures (
  identifier_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  failures INTEGER NOT NULL DEFAULT 1 CHECK (failures > 0)
);

ALTER TABLE public.result_check_failures ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.result_check_failures FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.result_check_failures TO service_role;

-- Terkunci bila kegagalan dalam jendela waktu yang masih berjalan sudah mencapai batas.
CREATE OR REPLACE FUNCTION public.is_result_check_locked(
  p_identifier_hash TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.result_check_failures
    WHERE identifier_hash = p_identifier_hash
      AND failures >= p_limit
      AND window_started_at > now() - make_interval(secs => p_window_seconds)
  );
$$;

CREATE OR REPLACE FUNCTION public.record_result_check_failure(
  p_identifier_hash TEXT,
  p_window_seconds INTEGER
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.result_check_failures AS f (identifier_hash, window_started_at, failures)
  VALUES (p_identifier_hash, now(), 1)
  ON CONFLICT (identifier_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN f.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE f.window_started_at
    END,
    failures = CASE
      WHEN f.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE f.failures + 1
    END
  RETURNING failures;
$$;

REVOKE ALL ON FUNCTION public.is_result_check_locked(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_result_check_locked(TEXT, INTEGER, INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.record_result_check_failure(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_result_check_failure(TEXT, INTEGER) TO service_role;

-- Finalisasi pendaftaran dan reservasi kuota Pilihan Kelas dilakukan dalam satu transaksi.
DROP FUNCTION IF EXISTS public.finalize_registration_with_capacity(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.finalize_registration_with_capacity(
  p_submission_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jenis TEXT;
  v_kelas TEXT;
  v_kuota INTEGER;
  v_terpakai INTEGER;
  v_updated INTEGER;
BEGIN
  IF p_submission_id IS NULL THEN
    RAISE EXCEPTION 'Invalid registration capacity parameters';
  END IF;

  LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;

  IF EXISTS (
    SELECT 1
    FROM public.pendaftar
    WHERE submission_id = p_submission_id
      AND status <> 'Menunggu Unggahan'
  ) THEN
    RETURN TRUE;
  END IF;

  SELECT jenis_pendaftaran, pilihan_kelas INTO v_jenis, v_kelas
  FROM public.pendaftar
  WHERE submission_id = p_submission_id
    AND status = 'Menunggu Unggahan';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Pindahan tidak memakai Kuota.
  IF v_jenis IS DISTINCT FROM 'Pindahan' THEN
    SELECT usage.kuota, usage.terpakai INTO v_kuota, v_terpakai
    FROM public.get_class_capacity_usage() AS usage
    WHERE usage.pilihan_kelas = v_kelas;

    IF NOT FOUND OR v_terpakai >= v_kuota THEN
      RETURN FALSE;
    END IF;
  END IF;

  UPDATE public.pendaftar
  SET status = 'Menunggu Verifikasi',
      nomor_pendaftaran = COALESCE(nomor_pendaftaran, public.next_registration_number())
  WHERE submission_id = p_submission_id
    AND status = 'Menunggu Unggahan';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_registration_with_capacity(UUID)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_registration_with_capacity(UUID)
TO service_role;

-- Jalankan berkala dari SQL Editor/cron untuk membuang sesi dan rate-limit kedaluwarsa.
CREATE OR REPLACE FUNCTION public.cleanup_expired_registration_security_data()
RETURNS TABLE(submission_id UUID, document_paths TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.registration_rate_limits
  WHERE window_started_at < now() - interval '1 day';

  DELETE FROM public.result_check_failures
  WHERE window_started_at < now() - interval '1 day';

  RETURN QUERY
  DELETE FROM public.pendaftar AS p
  WHERE p.status = 'Menunggu Unggahan'
    AND p.upload_expires_at < now()
  RETURNING p.submission_id, ARRAY[
    p.dokumen_akta_kelahiran,
    p.dokumen_kartu_keluarga,
    p.dokumen_pas_foto,
    p.dokumen_bukti_pembayaran
  ];
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_registration_security_data()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_registration_security_data()
TO service_role;
