import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const schemaPath = existsSync(resolve(process.cwd(), 'supabase/schema.sql'))
  ? resolve(process.cwd(), 'supabase/schema.sql')
  : resolve(process.cwd(), 'supabase_schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

function compactSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

const compactSchema = compactSql(schema);

describe('Supabase registration security schema', () => {
  it('stores internal document reviews privately per participant and document', () => {
    expect(compactSchema).toContain('CREATE TABLE IF NOT EXISTS public.verifikasi_dokumen');
    expect(compactSchema).toContain('PRIMARY KEY (pendaftar_id, dokumen_id)');
    expect(compactSchema).toContain("status TEXT NOT NULL CHECK (status = 'verified')");
    // Perlu Tindak Lanjut was removed: old follow-up reviews become belum diperiksa.
    expect(compactSchema).toContain("DELETE FROM public.verifikasi_dokumen WHERE status <> 'verified';");
    expect(compactSchema).toContain("ADD CONSTRAINT verifikasi_dokumen_status_check CHECK (status = 'verified');");
    expect(compactSchema).toContain('ALTER TABLE public.verifikasi_dokumen ENABLE ROW LEVEL SECURITY;');
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.verifikasi_dokumen FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT ALL ON TABLE public.verifikasi_dokumen TO service_role;');
    expect(compactSchema).toContain('ALTER TABLE public.verifikasi_dokumen DROP CONSTRAINT IF EXISTS verifikasi_dokumen_check;');
  });
  it('adds separate parent and sibling Direktorat 2 columns without dropping legacy data', () => {
    for (const column of [
      'nama_orangtua_direktorat2 VARCHAR(255)',
      'unit_orangtua_direktorat2 VARCHAR(100)',
      "saudara_di_direktorat2 VARCHAR(10) DEFAULT 'Tidak'",
      'nama_saudara_direktorat2 VARCHAR(255)',
      'unit_saudara_direktorat2 VARCHAR(100)',
    ]) {
      expect(compactSchema).toContain(`ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS ${column};`);
    }
    expect(schema).not.toMatch(/DROP\s+COLUMN\s+profesi_di_direktorat2/i);
  });

  it('adds referral columns to pendaftar table', () => {
    for (const column of [
      "ada_pengusul VARCHAR(10) DEFAULT 'Tidak'",
      'tipe_pengusul VARCHAR(50)',
      'nama_tk_pengusul VARCHAR(255)',
      'nama_pengusul VARCHAR(255)',
      'nomor_wa_pengusul VARCHAR(20)',
    ]) {
      expect(compactSchema).toContain(`ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS ${column};`);
    }
  });

  it('upserts a private document bucket with the server upload limits', () => {
    expect(compactSchema).toContain(
      compactSql(`
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
      `),
    );
  });

  it.each([
    ['Public Upload Dokumen', 'storage.objects'],
    ['Public Read Dokumen', 'storage.objects'],
    ['Public pendaftar insert', 'public.pendaftar'],
    ['Authenticated users can select pendaftar', 'public.pendaftar'],
    ['Authenticated users can update pendaftar', 'public.pendaftar'],
  ])('drops the browser-facing %s policy without recreating it', (policy, table) => {
    expect(compactSchema).toContain(`DROP POLICY IF EXISTS "${policy}" ON ${table};`);
    expect(schema).not.toMatch(new RegExp(`CREATE\\s+POLICY\\s+"${policy}"`, 'i'));
  });

  it('keeps applicant RLS enabled and adds authoritative non-null NIK uniqueness', () => {
    expect(compactSchema).toContain(
      'ALTER TABLE public.pendaftar ENABLE ROW LEVEL SECURITY;',
    );
    expect(compactSchema).toContain(
      compactSql(`
        DROP INDEX IF EXISTS public.uq_pendaftar_nik;
        CREATE UNIQUE INDEX uq_pendaftar_nik
        ON public.pendaftar (nik)
        WHERE nik IS NOT NULL AND status <> 'Menunggu Unggahan';
      `),
    );
  });

  it('creates a positive-count rate-limit table with RLS and no policies', () => {
    expect(compactSchema).toContain(
      compactSql(`
        CREATE TABLE IF NOT EXISTS public.registration_rate_limits (
          identifier_hash TEXT PRIMARY KEY,
          window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0)
        );
      `),
    );
    expect(compactSchema).toContain(
      'ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;',
    );
    expect(schema).not.toMatch(
      /CREATE\s+POLICY[\s\S]*?ON\s+public\.registration_rate_limits\b/i,
    );
  });

  it('defines the validated security-definer function with a fixed search path', () => {
    expect(compactSchema).toContain(
      compactSql(`
        CREATE OR REPLACE FUNCTION public.consume_registration_rate_limit(
          p_identifier_hash TEXT,
          p_limit INTEGER,
          p_window_seconds INTEGER
        )
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
      `),
    );
    expect(compactSchema).toContain(
      compactSql(`
        IF btrim(p_identifier_hash) = '' OR p_limit <= 0 OR p_window_seconds <= 0 THEN
          RAISE EXCEPTION 'Invalid registration rate-limit parameters';
        END IF;
      `),
    );
  });

  it('consumes a rate-limit attempt through one atomic upsert', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.consume_registration_rate_limit\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(functionSql).toContain(
      compactSql(`
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
      `),
    );
    expect(functionSql.match(/\bINSERT INTO\b/gi)).toHaveLength(1);
    expect(functionSql).not.toMatch(/;\s*(SELECT|UPDATE|DELETE)\b/i);
  });

  it('revokes access from browser roles and grants execution only to service_role', () => {
    expect(compactSchema).toContain(
      'REVOKE ALL ON TABLE public.registration_rate_limits FROM PUBLIC, anon, authenticated;',
    );
    expect(compactSchema).toContain(
      compactSql(`
        REVOKE ALL ON FUNCTION public.consume_registration_rate_limit(TEXT, INTEGER, INTEGER)
        FROM PUBLIC, anon, authenticated;
      `),
    );
    expect(compactSchema).toContain(
      compactSql(`
        GRANT EXECUTE ON FUNCTION public.consume_registration_rate_limit(TEXT, INTEGER, INTEGER)
        TO service_role;
      `),
    );
    expect(schema).not.toMatch(
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.consume_registration_rate_limit\([\s\S]*?\)\s+TO\s+(?:PUBLIC|anon|authenticated)\b/i,
    );
  });

  it('finalizes registrations under one table lock and enforces the class capacity atomically', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.finalize_registration_with_capacity\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain(
      "IF EXISTS ( SELECT 1 FROM public.pendaftar WHERE submission_id = p_submission_id AND status <> 'Menunggu Unggahan' ) THEN RETURN TRUE;",
    );
    expect(functionSql).toContain("IF v_jenis IS DISTINCT FROM 'Pindahan' THEN");
    expect(functionSql).toContain('FROM public.get_class_capacity_usage() AS usage WHERE usage.pilihan_kelas = v_kelas;');
    expect(functionSql).toContain('IF NOT FOUND OR v_terpakai >= v_kuota THEN RETURN FALSE;');
    expect(functionSql).toContain("SET status = 'Menunggu Verifikasi'");
    expect(functionSql).toContain("AND status = 'Menunggu Unggahan'");
    expect(compactSchema).toContain('DROP FUNCTION IF EXISTS public.finalize_registration_with_capacity(UUID, INTEGER);');
    expect(compactSchema).toContain(
      'GRANT EXECUTE ON FUNCTION public.finalize_registration_with_capacity(UUID) TO service_role;',
    );
    expect(schema).not.toMatch(
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.finalize_registration_with_capacity\([\s\S]*?\)\s+TO\s+(?:PUBLIC|anon|authenticated)/i,
    );
  });

  it('counts used seats only for active Siswa Baru registrations per class', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.get_class_capacity_usage\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(functionSql).toContain("AND p.jenis_pendaftaran = 'Siswa Baru'");
    expect(functionSql).toContain("AND p.status NOT IN ('Menunggu Unggahan', 'Ditolak', 'Dibatalkan')");
    expect(compactSchema).toContain("('Bilingual', 56), ('Reguler', 28), ('Tahfizh', 28) ON CONFLICT (pilihan_kelas) DO NOTHING;");
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.kuota_kelas FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.get_class_capacity_usage() TO service_role;');
  });

  it('lets admins rebalance class capacity only when the total is unchanged and no class drops below used seats', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.update_class_capacities\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(functionSql).toContain("IF p_reguler + p_bilingual + p_tahfizh <> p_total THEN RETURN 'total_mismatch';");
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("RETURN 'below_used:' || v_kelas;");
    expect(compactSchema).toContain(
      'GRANT EXECUTE ON FUNCTION public.update_class_capacities(INTEGER, INTEGER, INTEGER, INTEGER) TO service_role;',
    );
  });

  it('restores cancelled applicants only when their class still has a free seat', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.restore_cancelled_applicant\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS status_sebelum_dibatalkan VARCHAR(50);');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jadwal_okb_tanggal DATE;');
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("IF NOT FOUND OR v_terpakai >= v_kuota THEN RETURN 'full';");
    expect(functionSql).toContain("SET status = COALESCE(v_sebelum, 'Menunggu Verifikasi'), status_sebelum_dibatalkan = NULL");
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.restore_cancelled_applicant(UUID) TO service_role;');
  });

  it('records admission decisions only after OKB and re-checks capacity when overturning a rejection', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.decide_admission\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS kelas_penempatan VARCHAR(50);');
    expect(functionSql).toContain("IF NOT FOUND OR v_status NOT IN ('Sudah OKB', 'Diterima', 'Ditolak') THEN RETURN 'invalid';");
    expect(functionSql).toContain("IF p_keputusan = 'Diterima' AND v_status = 'Ditolak' AND v_jenis IS DISTINCT FROM 'Pindahan' THEN");
    expect(functionSql).toContain("kelas_penempatan = CASE WHEN p_keputusan = 'Diterima' THEN p_kelas_penempatan ELSE NULL END");
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.decide_admission(UUID, TEXT, TEXT) TO service_role;');
  });

  it('assigns sequential registration numbers on finalization and backfills earlier applicants', () => {
    const finalizeSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.finalize_registration_with_capacity\([\s\S]*?\$\$;/,
    )?.[0] ?? '');
    const nextSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.next_registration_number\([\s\S]*?\$\$;/,
    )?.[0] ?? '');

    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_pendaftaran VARCHAR(20);');
    expect(compactSchema).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_nomor_pendaftaran ON public.pendaftar (nomor_pendaftaran) WHERE nomor_pendaftaran IS NOT NULL;');
    expect(nextSql).toContain("SELECT 'OB-2027-' || lpad((COALESCE(max(substring(nomor_pendaftaran FROM 9)::INTEGER), 0) + 1)::TEXT, 3, '0')");
    expect(finalizeSql).toContain('nomor_pendaftaran = COALESCE(nomor_pendaftaran, public.next_registration_number())');
    expect(compactSchema).toContain("WHERE nomor_pendaftaran IS NULL AND status <> 'Menunggu Unggahan' ORDER BY created_at, id");
    expect(compactSchema).toContain('REVOKE ALL ON FUNCTION public.next_registration_number() FROM PUBLIC, anon, authenticated;');
  });

  it('aggregates the admin dashboard in the database, sharing the Kuota rule with the capacity menu', () => {
    const functionSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.get_admin_dashboard_summary\([\s\S]*?\$\$;/,
    )?.[0] ?? '');

    expect(functionSql).toContain("'total', (SELECT count(*) FROM public.pendaftar WHERE status <> 'Menunggu Unggahan')");
    expect(functionSql).toContain("'awaiting', count(*) FILTER (WHERE status = 'Menunggu Verifikasi')");
    expect(functionSql).toContain("jadwal_okb_tanggal < (SELECT d FROM today)");
    expect(functionSql).toContain('FROM public.get_class_capacity_usage() AS usage');
    expect(functionSql).toContain("(now() AT TIME ZONE 'Asia/Jakarta')::date");
    expect(functionSql).not.toContain('LIMIT 8');
    expect(compactSchema).toContain('REVOKE ALL ON FUNCTION public.get_admin_dashboard_summary() FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_summary() TO service_role;');
    // Perlu Perhatian never counts withdrawn or rejected applicants.
    expect(functionSql).toContain("'nisn', count(*) FILTER (WHERE nisn_tidak_sesuai)");
    expect(functionSql).not.toContain('berkas_tindak_lanjut');
    expect(functionSql).toContain("WHERE status NOT IN ('Dibatalkan', 'Ditolak')");
  });

  it('stores Jadwal OKB as a date plus one of three Gelombang OKB, replacing the free-text session', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jadwal_okb_gelombang SMALLINT CHECK (jadwal_okb_gelombang BETWEEN 1 AND 3);');
    // Jadwal OKB made before Gelombang existed all belong to Gelombang 1.
    expect(compactSchema).toContain('UPDATE public.pendaftar SET jadwal_okb_gelombang = 1 WHERE jadwal_okb_tanggal IS NOT NULL AND jadwal_okb_gelombang IS NULL;');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar DROP COLUMN IF EXISTS jadwal_okb_sesi;');
    expect(compactSchema).not.toContain('ADD COLUMN IF NOT EXISTS jadwal_okb_sesi');
    // Terjadwal OKB always has both a date and a Gelombang.
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar DROP CONSTRAINT IF EXISTS pendaftar_jadwal_okb_check;');
    expect(compactSchema).toContain("ADD CONSTRAINT pendaftar_jadwal_okb_check CHECK (status <> 'Terjadwal OKB' OR (jadwal_okb_tanggal IS NOT NULL AND jadwal_okb_gelombang IS NOT NULL));");
  });

  it('counts upcoming OKB days per Gelombang on the dashboard', () => {
    const functionSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.get_admin_dashboard_summary\([\s\S]*?\$\$;/,
    )?.[0] ?? '');

    expect(functionSql).toContain("jsonb_build_object('date', tanggal, 'total', total, 'waves', gelombang)");
    expect(functionSql).toContain('GROUP BY jadwal_okb_tanggal, jadwal_okb_gelombang');
    expect(functionSql).not.toContain('jadwal_okb_sesi');
  });

  it('stores NISN Tidak Sesuai and per-applicant document counts for the participant list', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nisn_tidak_sesuai BOOLEAN NOT NULL DEFAULT false;');
    expect(compactSchema).toContain('ADD COLUMN IF NOT EXISTS berkas_belum_tersedia SMALLINT GENERATED ALWAYS AS');
    // Changing the NISN clears the mark unless the same update sets it explicitly.
    expect(compactSchema).toContain('IF NEW.nisn IS DISTINCT FROM OLD.nisn AND NEW.nisn_tidak_sesuai IS NOT DISTINCT FROM OLD.nisn_tidak_sesuai THEN NEW.nisn_tidak_sesuai := false;');
    expect(compactSchema).toContain('BEFORE UPDATE OF nisn ON public.pendaftar FOR EACH ROW EXECUTE FUNCTION public.clear_nisn_flag_on_change();');
    // The follow-up count is gone together with Perlu Tindak Lanjut.
    expect(compactSchema).toContain('DROP TRIGGER IF EXISTS trg_sync_berkas_tindak_lanjut ON public.verifikasi_dokumen;');
    expect(compactSchema).toContain('DROP FUNCTION IF EXISTS public.sync_berkas_tindak_lanjut();');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar DROP COLUMN IF EXISTS berkas_tindak_lanjut;');
  });

  it('lets admins change class choice only when the destination class has a free seat', () => {
    const functionSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.update_applicant_registration\([\s\S]*?\$\$;/,
    )?.[0] ?? '');

    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("AND (v_jenis IS DISTINCT FROM 'Siswa Baru' OR v_kelas IS DISTINCT FROM p_kelas) THEN");
    expect(functionSql).toContain("IF NOT FOUND OR v_terpakai >= v_kuota THEN RETURN 'full';");
    expect(functionSql).toContain("kelas_tujuan = CASE WHEN p_jenis = 'Pindahan' THEN p_kelas_tujuan ELSE NULL END");
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.update_applicant_registration(UUID, TEXT, TEXT, TEXT) TO service_role;');
  });
});
