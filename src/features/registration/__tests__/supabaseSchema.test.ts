import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(resolve(process.cwd(), 'supabase_schema.sql'), 'utf8');

function compactSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

const compactSchema = compactSql(schema);

describe('Supabase registration security schema', () => {
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
});
