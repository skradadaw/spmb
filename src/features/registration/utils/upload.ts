import { supabase } from '@/lib/supabase';
import { DocumentUrls } from '../actions';

export const DOC_MAP: { [key: string]: { column: keyof DocumentUrls; label: string } } = {
  aktaKelahiran: { column: 'dokumen_akta_kelahiran', label: 'Akta Kelahiran' },
  kartuKeluarga: { column: 'dokumen_kartu_keluarga', label: 'Kartu Keluarga' },
  pasFoto: { column: 'dokumen_pas_foto', label: 'Pas Foto Anak' },
  buktiPembayaran: { column: 'dokumen_bukti_pembayaran', label: 'Bukti Pembayaran' },
};

/**
 * Remove uploaded files from Supabase Storage (used for rollback/cleanup)
 */
export async function rollbackUploadedDocuments(paths: string[]): Promise<void> {
  if (!paths || paths.length === 0) return;
  try {
    const { error } = await supabase.storage
      .from('dokumen_pendaftaran')
      .remove(paths);
    if (error) {
      console.warn('Failed to cleanup rollback storage files:', error);
    }
  } catch (err) {
    console.warn('Error during storage rollback:', err);
  }
}

/**
 * Upload registration documents concurrently in parallel with rollback protection
 */
export async function uploadRegistrationDocuments(
  nik: string,
  files: { [docId: string]: File },
  onProgress?: (message: string) => void
): Promise<{ urls: DocumentUrls; paths: string[]; error?: string }> {
  const entries = Object.entries(files).filter(([_, file]) => !!file);
  const total = entries.length;
  const urls: DocumentUrls = {};
  const uploadedPaths: string[] = [];

  if (total === 0) {
    return { urls, paths: [] };
  }

  let completedCount = 0;
  if (onProgress) {
    onProgress(`Memulai unggahan ${total} berkas secara bersamaan...`);
  }

  const cleanNik = (nik || 'dokumen').replace(/\D/g, '') || 'pendaftar';
  const timestamp = Date.now();

  try {
    // Execute all file uploads concurrently via Promise.all
    const uploadPromises = entries.map(async ([docId, file], index) => {
      const docMeta = DOC_MAP[docId];
      const label = docMeta ? docMeta.label : docId;

      const rawExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const ext = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(rawExt) ? rawExt : 'webp';
      const filePath = `${cleanNik}/${docId}_${timestamp}_${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen_pendaftaran')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Gagal mengunggah berkas ${label}: ${uploadError.message}`);
      }

      uploadedPaths.push(filePath);

      const { data: publicUrlData } = supabase.storage
        .from('dokumen_pendaftaran')
        .getPublicUrl(filePath);

      if (docMeta) {
        urls[docMeta.column] = publicUrlData.publicUrl;
      }

      completedCount++;
      if (onProgress) {
        onProgress(`Mengunggah berkas (${completedCount}/${total} selesai)...`);
      }

      return { docId, filePath, url: publicUrlData.publicUrl };
    });

    await Promise.all(uploadPromises);
    return { urls, paths: uploadedPaths };
  } catch (err: any) {
    console.error('Parallel upload failure, rolling back files:', err);
    // Compensating transaction: Clean up any files that were uploaded in this batch
    await rollbackUploadedDocuments(uploadedPaths);
    return {
      urls: {},
      paths: [],
      error: err?.message || 'Terjadi gangguan saat mengunggah berkas dokumen. Pastikan koneksi internet stabil.',
    };
  }
}
