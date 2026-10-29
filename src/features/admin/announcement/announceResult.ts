import { formatProperName } from '@/lib/properName';

export type AnnounceState = { status: 'idle' | 'success' | 'error'; message: string; /** Pendaftar Diterima yang Nomor VA-nya belum diisi. */ missingVa?: string[] };

/** Hasil fungsi database announce_results. */
export type AnnounceRpcResult =
  | { status: 'ok'; diterima?: number; ditolak?: number; dilewati?: number; ditarik?: number }
  | { status: 'no-template' }
  | { status: 'missing-va'; pendaftar: Array<{ nama: string | null; nomor: string | null }> }
  | { status: 'invalid' };

export const announceOk = (message: string): AnnounceState => ({ status: 'success', message });
export const announceFail = (message: string, missingVa?: string[]): AnnounceState => ({ status: 'error', message, ...(missingVa ? { missingVa } : {}) });

/** Penolakan dari announce_results sebagai pesan untuk admin; null bila berhasil. */
export function describeAnnounceFailure(result: AnnounceRpcResult): AnnounceState | null {
  if (result.status === 'no-template') return announceFail('Belum ada template Surat Penerimaan yang aktif. Unggah template di menu Pengumuman terlebih dahulu.');
  if (result.status === 'missing-va') {
    const names = result.pendaftar.map(({ nama, nomor }) => `${nama ? formatProperName(nama) : 'Tanpa nama'}${nomor ? ` (${nomor})` : ''}`);
    return announceFail('Isi Nomor VA Pendaftar Diterima berikut terlebih dahulu:', names);
  }
  if (result.status !== 'ok') return announceFail('Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.');
  return null;
}
