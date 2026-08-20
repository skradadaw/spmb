'use client';

import { createClient } from '@supabase/supabase-js';
import type { SignedUploadTarget } from './contracts';
import type { RegistrationFiles } from './clientSubmission';

let client: ReturnType<typeof createClient> | undefined;

function getUploadClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Konfigurasi unggah belum tersedia.');
  client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

export async function uploadSignedDocuments(
  targets: SignedUploadTarget[],
  files: RegistrationFiles,
  onProgress: (completed: number, total: number) => void,
) {
  const storage = getUploadClient().storage.from('dokumen_pendaftaran');
  let completed = 0;
  for (const target of targets) {
    const file = files[target.id];
    if (!file) throw new Error('Dokumen wajib tidak ditemukan.');
    const { error } = await storage.uploadToSignedUrl(target.path, target.token, file, {
      contentType: file.type,
      cacheControl: '3600',
    });
    if (error) throw new Error('Dokumen gagal diunggah.');
    completed += 1;
    onProgress(completed, targets.length);
  }
}
