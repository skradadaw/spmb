import 'server-only';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Bucket privat template Surat Penerimaan, terpisah dari Berkas Pendaftar. */
export const TEMPLATE_BUCKET = 'template_surat';
export const TEMPLATE_MAX_FILE_SIZE = 5_242_880;

const TEMPLATE_PATH_PATTERN = /^templates\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i;

/** Hanya path buatan sistem yang boleh dibaca, diaktifkan, atau dihapus. */
export function isTemplatePath(path: string) {
  return TEMPLATE_PATH_PATTERN.test(path);
}

export function newTemplatePath() {
  return `templates/${randomUUID()}.pdf`;
}

export type ActiveTemplate = { path: string; uploadedAt: string };

const failure = () => new Error('Template Surat Penerimaan tidak dapat diproses.');

export function createTemplateRepository(supabase: SupabaseClient) {
  const storage = () => supabase.storage.from(TEMPLATE_BUCKET);
  return {
    async getActive(): Promise<ActiveTemplate | null> {
      const { data, error } = await supabase.from('template_surat_penerimaan').select('path,diunggah_pada').eq('id', 'aktif').maybeSingle();
      if (error) throw failure();
      if (!data || typeof data.path !== 'string') return null;
      return { path: data.path, uploadedAt: String(data.diunggah_pada) };
    },
    async createUploadToken(path: string): Promise<string> {
      const { data, error } = await storage().createSignedUploadUrl(path);
      if (error || !data?.token) throw failure();
      return data.token;
    },
    async download(path: string): Promise<Uint8Array> {
      const { data, error } = await storage().download(path);
      if (error || !data) throw failure();
      return new Uint8Array(await data.arrayBuffer());
    },
    /** Menjadikan path ini template aktif dan mengembalikan path template sebelumnya, bila ada. */
    async activate(path: string): Promise<string | null> {
      const previous = await this.getActive();
      const { error } = await supabase.from('template_surat_penerimaan').upsert({ id: 'aktif', path, diunggah_pada: new Date().toISOString() });
      if (error) throw failure();
      return previous && previous.path !== path ? previous.path : null;
    },
    async remove(path: string): Promise<void> {
      const { error } = await storage().remove([path]);
      if (error) throw failure();
    },
  };
}

export type TemplateRepository = ReturnType<typeof createTemplateRepository>;
