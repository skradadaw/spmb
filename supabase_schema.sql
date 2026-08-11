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
CREATE POLICY "Public pendaftar insert"
ON public.pendaftar
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can select pendaftar" ON public.pendaftar;
CREATE POLICY "Authenticated users can select pendaftar"
ON public.pendaftar
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can update pendaftar" ON public.pendaftar;
CREATE POLICY "Authenticated users can update pendaftar"
ON public.pendaftar
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Setup Storage Bucket (Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dokumen_pendaftaran', 'dokumen_pendaftaran', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Upload Dokumen" ON storage.objects;
CREATE POLICY "Public Upload Dokumen"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'dokumen_pendaftaran');

DROP POLICY IF EXISTS "Public Read Dokumen" ON storage.objects;
CREATE POLICY "Public Read Dokumen"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'dokumen_pendaftaran');
