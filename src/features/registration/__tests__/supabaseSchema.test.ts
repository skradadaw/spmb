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
    expect(functionSql).toContain(
      'SELECT COALESCE(SUM(usage.kuota), 0), COALESCE(SUM(usage.terpakai), 0) INTO v_kuota, v_terpakai FROM public.get_class_capacity_usage() AS usage;',
    );
    expect(functionSql).toContain('IF v_terpakai >= v_kuota THEN RETURN FALSE;');
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

  it('lets admins update total capacity only when positive and not below total used seats', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.update_total_capacity\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(functionSql).toContain("IF p_total IS NULL OR p_total <= 0 THEN RETURN 'invalid';");
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain('SELECT COALESCE(SUM(usage.terpakai), 0) INTO v_terpakai FROM public.get_class_capacity_usage() AS usage;');
    expect(functionSql).toContain("IF p_total < v_terpakai THEN RETURN 'below_used';");
    expect(compactSchema).toContain(
      'GRANT EXECUTE ON FUNCTION public.update_total_capacity(INTEGER) TO service_role;',
    );
  });

  it('restores cancelled applicants only when total capacity still has a free seat', () => {
    const functionMatch = schema.match(
      /CREATE OR REPLACE FUNCTION public\.restore_cancelled_applicant\([\s\S]*?\$\$;/,
    );

    expect(functionMatch).not.toBeNull();
    const functionSql = compactSql(functionMatch?.[0] ?? '');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS status_sebelum_dibatalkan VARCHAR(50);');
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS jadwal_okb_tanggal DATE;');
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("IF v_jenis IS DISTINCT FROM 'Pindahan' THEN");
    expect(functionSql).toContain(
      'SELECT COALESCE(SUM(usage.kuota), 0), COALESCE(SUM(usage.terpakai), 0) INTO v_kuota, v_terpakai FROM public.get_class_capacity_usage() AS usage;',
    );
    expect(functionSql).toContain("IF v_terpakai >= v_kuota THEN RETURN 'full';");
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
    expect(functionSql).toContain(
      'SELECT COALESCE(SUM(usage.kuota), 0), COALESCE(SUM(usage.terpakai), 0) INTO v_kuota, v_terpakai FROM public.get_class_capacity_usage() AS usage;',
    );
    expect(functionSql).toContain("IF v_terpakai >= v_kuota THEN RETURN 'full';");
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

  it('stores one 16-digit Nomor VA per Pendaftar, never shared', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_va VARCHAR(16);');
    expect(compactSchema).toContain("ADD CONSTRAINT pendaftar_nomor_va_check CHECK (nomor_va IS NULL OR nomor_va ~ '^[0-9]{16}$');");
    expect(compactSchema).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_nomor_va ON public.pendaftar (nomor_va) WHERE nomor_va IS NOT NULL;');
  });

  it('announces results per Pendaftar or Gelombang in one transaction, only with a template and Nomor VA', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS diumumkan_pada TIMESTAMPTZ;');
    const functionSql = compactSql(schema.match(/CREATE OR REPLACE FUNCTION public\.announce_results\([\s\S]*?\$\$;/)?.[0] ?? '');
    expect(functionSql).toContain('IF (p_pendaftar_id IS NULL) = (p_gelombang IS NULL) OR p_umumkan IS NULL THEN');
    expect(functionSql).toContain('FOR UPDATE;');
    expect(functionSql).toContain("IF NOT EXISTS (SELECT 1 FROM public.template_surat_penerimaan) THEN RETURN jsonb_build_object('status', 'no-template');");
    expect(functionSql).toContain("AND status = 'Diterima' AND nomor_va IS NULL AND diumumkan_pada IS NULL;");
    expect(functionSql).toContain("RETURN jsonb_build_object('status', 'missing-va', 'pendaftar', v_tanpa_va);");
    expect(functionSql).toContain("SELECT nomor_awal INTO v_nomor_awal FROM public.pengaturan_nomor_surat WHERE id = 'aktif' FOR UPDATE;");
    expect(functionSql).toContain("IF v_nomor_awal IS NULL THEN RETURN jsonb_build_object('status', 'no-letter-number');");
    expect(functionSql).toContain("SET diumumkan_pada = now() WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang) AND status IN ('Diterima', 'Ditolak') AND diumumkan_pada IS NULL");
    expect(compactSchema).toContain('REVOKE ALL ON FUNCTION public.announce_results(UUID, SMALLINT, BOOLEAN) FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.announce_results(UUID, SMALLINT, BOOLEAN) TO service_role;');
  });

  it('numbers Surat Penerimaan once at announcement, continuing from the last number used, in Nomor Pendaftaran order', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS nomor_urut_surat INTEGER;');
    expect(compactSchema).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uq_pendaftar_nomor_urut_surat ON public.pendaftar (nomor_urut_surat) WHERE nomor_urut_surat IS NOT NULL;');
    expect(compactSchema).toContain("format TEXT NOT NULL CHECK (position('{urut}' in format) > 0)");
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.pengaturan_nomor_surat FROM PUBLIC, anon, authenticated;');
    const functionSql = compactSql(schema.match(/CREATE OR REPLACE FUNCTION public\.announce_results\([\s\S]*?\$\$;/)?.[0] ?? '');
    expect(functionSql).toContain('SELECT GREATEST(v_nomor_awal, COALESCE(max(nomor_urut_surat) + 1, v_nomor_awal)) INTO v_nomor_berikutnya FROM public.pendaftar;');
    expect(functionSql).toContain('SET nomor_urut_surat = v_nomor_berikutnya + x.urutan - 1');
    expect(functionSql).toContain("row_number() OVER (ORDER BY nomor_pendaftaran, id) AS urutan FROM public.pendaftar WHERE (id = p_pendaftar_id OR jadwal_okb_gelombang = p_gelombang) AND status = 'Diterima' AND diumumkan_pada IS NOT NULL AND nomor_urut_surat IS NULL");
  });

  it('imports Nomor VA all or nothing, only for Diterima without a Nomor VA and not yet announced', () => {
    const functionSql = compactSql(schema.match(/CREATE OR REPLACE FUNCTION public\.import_nomor_va\([\s\S]*?\$\$;/)?.[0] ?? '');
    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("WHERE p.id IS NULL OR p.status <> 'Diterima' OR p.diumumkan_pada IS NOT NULL OR p.nomor_va IS NOT NULL OR x.va IS NULL OR x.va !~ '^[0-9]{16}$'");
    expect(functionSql).toContain("WHEN unique_violation THEN RETURN jsonb_build_object('status', 'duplicate');");
    expect(compactSchema).toContain('REVOKE ALL ON FUNCTION public.import_nomor_va(JSONB) FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.import_nomor_va(JSONB) TO service_role;');
  });

  it('keeps the one active Surat Penerimaan template in a private PDF-only bucket', () => {
    expect(compactSchema).toContain(compactSql(`
      INSERT INTO storage.buckets ( id, name, public, file_size_limit, allowed_mime_types ) VALUES (
        'template_surat', 'template_surat', false, 5242880, ARRAY['application/pdf']
      )
    `));
    expect(compactSchema).toContain("id TEXT PRIMARY KEY DEFAULT 'aktif' CHECK (id = 'aktif')");
    expect(compactSchema).toContain('ALTER TABLE public.template_surat_penerimaan ENABLE ROW LEVEL SECURITY;');
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.template_surat_penerimaan FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT ALL ON TABLE public.template_surat_penerimaan TO service_role;');
  });

  it('counts failed Cek Hasil OKB attempts per client privately in the database', () => {
    expect(compactSchema).toContain('CREATE TABLE IF NOT EXISTS public.result_check_failures');
    expect(compactSchema).toContain('ALTER TABLE public.result_check_failures ENABLE ROW LEVEL SECURITY;');
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.result_check_failures FROM PUBLIC, anon, authenticated;');
    const lockedSql = compactSql(schema.match(/CREATE OR REPLACE FUNCTION public\.is_result_check_locked\([\s\S]*?\$\$;/)?.[0] ?? '');
    expect(lockedSql).toContain('failures >= p_limit AND window_started_at > now() - make_interval(secs => p_window_seconds)');
    const recordSql = compactSql(schema.match(/CREATE OR REPLACE FUNCTION public\.record_result_check_failure\([\s\S]*?\$\$;/)?.[0] ?? '');
    expect(recordSql).toContain('ON CONFLICT (identifier_hash) DO UPDATE');
    for (const fn of ['is_result_check_locked(TEXT, INTEGER, INTEGER)', 'record_result_check_failure(TEXT, INTEGER)']) {
      expect(compactSchema).toContain(`REVOKE ALL ON FUNCTION public.${fn} FROM PUBLIC, anon, authenticated;`);
      expect(compactSchema).toContain(`GRANT EXECUTE ON FUNCTION public.${fn} TO service_role;`);
    }
    expect(compactSchema).toContain("DELETE FROM public.result_check_failures WHERE window_started_at < now() - interval '1 day';");
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

  it('keeps Ruang OKB as an admin-only list of uniquely named rooms', () => {
    expect(compactSchema).toContain('CREATE TABLE IF NOT EXISTS public.ruang_okb');
    expect(compactSchema).toContain("CHECK (nama = btrim(regexp_replace(nama, '\\s+', ' ', 'g')) AND char_length(nama) BETWEEN 1 AND 30)");
    expect(compactSchema).toContain('CREATE UNIQUE INDEX IF NOT EXISTS ruang_okb_nama_key ON public.ruang_okb (lower(nama));');
    expect(compactSchema).toContain('ALTER TABLE public.ruang_okb ENABLE ROW LEVEL SECURITY;');
    expect(compactSchema).toContain('REVOKE ALL ON TABLE public.ruang_okb FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT ALL ON TABLE public.ruang_okb TO service_role;');
  });

  it('links each Pendaftar to a room that cannot be deleted while in use', () => {
    expect(compactSchema).toContain('ALTER TABLE public.pendaftar ADD COLUMN IF NOT EXISTS ruang_okb_id UUID REFERENCES public.ruang_okb(id) ON DELETE RESTRICT;');
    expect(compactSchema).not.toContain('ADD COLUMN IF NOT EXISTS ruang_okb TEXT');
  });

  it('turns typed Ruang OKB names into rooms once, merging names that differ only in case or spacing', () => {
    const migration = compactSql(schema.match(/-- Migrasi Ruang OKB teks bebas[\s\S]*?END \$\$;/)?.[0] ?? '');

    expect(migration).toContain("WHERE table_schema = 'public' AND table_name = 'pendaftar' AND column_name = 'ruang_okb'");
    expect(migration).toContain('ON CONFLICT ((lower(nama))) DO NOTHING;');
    expect(migration).toContain('UPDATE public.pendaftar AS p SET ruang_okb_id = r.id');
    expect(migration).toContain('ALTER TABLE public.pendaftar DROP COLUMN ruang_okb;');
  });

  it('still exposes the room name as ruang_okb for readers, through a computed column', () => {
    expect(compactSchema).toContain('CREATE OR REPLACE FUNCTION public.ruang_okb(public.pendaftar) RETURNS TEXT LANGUAGE sql STABLE');
    expect(compactSchema).toContain('SELECT nama FROM public.ruang_okb WHERE id = $1.ruang_okb_id');
    expect(compactSchema).toContain('REVOKE ALL ON FUNCTION public.ruang_okb(public.pendaftar) FROM PUBLIC, anon, authenticated;');
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.ruang_okb(public.pendaftar) TO service_role;');
  });

  it('clears the Ruang OKB only when the Jadwal OKB really changes', () => {
    expect(compactSchema).toContain('IF NEW.jadwal_okb_tanggal IS DISTINCT FROM OLD.jadwal_okb_tanggal OR NEW.jadwal_okb_gelombang IS DISTINCT FROM OLD.jadwal_okb_gelombang THEN NEW.ruang_okb_id := NULL;');
    expect(compactSchema).toContain('DROP TRIGGER IF EXISTS trg_clear_ruang_okb ON public.pendaftar;');
    expect(compactSchema).toContain('BEFORE UPDATE OF jadwal_okb_tanggal, jadwal_okb_gelombang ON public.pendaftar FOR EACH ROW EXECUTE FUNCTION public.clear_ruang_okb_on_schedule_change();');
  });

  it('lets admins change class choice freely and checks total capacity only when becoming Siswa Baru', () => {
    const functionSql = compactSql(schema.match(
      /CREATE OR REPLACE FUNCTION public\.update_applicant_registration\([\s\S]*?\$\$;/,
    )?.[0] ?? '');

    expect(functionSql).toContain('LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE;');
    expect(functionSql).toContain("AND v_jenis IS DISTINCT FROM 'Siswa Baru' THEN");
    expect(functionSql).toContain(
      'SELECT COALESCE(SUM(usage.kuota), 0), COALESCE(SUM(usage.terpakai), 0) INTO v_kuota, v_terpakai FROM public.get_class_capacity_usage() AS usage;',
    );
    expect(functionSql).toContain("IF v_terpakai >= v_kuota THEN RETURN 'full';");
    expect(functionSql).toContain("kelas_tujuan = CASE WHEN p_jenis = 'Pindahan' THEN p_kelas_tujuan ELSE NULL END");
    expect(compactSchema).toContain('GRANT EXECUTE ON FUNCTION public.update_applicant_registration(UUID, TEXT, TEXT, TEXT) TO service_role;');
  });
});
