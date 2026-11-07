import { zipSync } from 'fflate';

/** Mengumpulkan PNG menjadi satu ZIP di browser. Nama file harus sudah unik. */
export async function createNameTagZip(files: { fileName: string; png: Blob }[]): Promise<Blob> {
  const entries = await Promise.all(files.map(async ({ fileName, png }) => [fileName, new Uint8Array(await png.arrayBuffer())] as const));
  // PNG sudah terkompresi, jadi cukup disimpan apa adanya.
  const zipped = zipSync(Object.fromEntries(entries), { level: 0 });
  return new Blob([zipped as BlobPart], { type: 'application/zip' });
}
