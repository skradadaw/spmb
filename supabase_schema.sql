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
