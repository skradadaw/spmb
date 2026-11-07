/** Mengunduh berkas buatan browser; tidak ada yang tersimpan di server. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Ditunda agar browser sempat mulai mengunduh sebelum alamatnya dicabut.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
