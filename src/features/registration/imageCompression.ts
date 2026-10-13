/** Long edge after compression: small enough to upload fast, large enough to read a Kartu Keluarga. */
export const MAX_IMAGE_EDGE = 2000;
export const JPEG_QUALITY = 0.85;
const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function scaledSize(width: number, height: number, maxEdge = MAX_IMAGE_EDGE) {
  const ratio = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}

/**
 * Re-encodes a photo as a JPEG of at most 2000 px before upload. PDFs, unsupported browsers and
 * results that would not be smaller keep the original file, so this never blocks an upload.
 */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type) || typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const { width, height } = scaledSize(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }
    // JPEG has no transparency; a white page reads better than black behind a transparent PNG.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'berkas'}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export async function compressFiles<T extends Record<string, File>>(files: T): Promise<T> {
  const entries = await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await compressImage(file)] as const));
  return Object.fromEntries(entries) as T;
}
