import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { acceptanceLetterFileName, buildAcceptanceLetter, type AcceptanceLetterData } from '../acceptanceLetter';
import { createTemplateRepository } from './templateRepository';

export type GeneratedLetter = { bytes: Uint8Array; fileName: string };

/** Surat Penerimaan dibuat saat diunduh dari template aktif, sehingga template baru langsung berlaku. */
export async function generateAcceptanceLetter(supabase: SupabaseClient, nomorPendaftaran: string, letter: AcceptanceLetterData): Promise<GeneratedLetter | null> {
  const templates = createTemplateRepository(supabase);
  const active = await templates.getActive();
  if (!active) return null;
  return {
    bytes: await buildAcceptanceLetter(await templates.download(active.path), letter),
    fileName: acceptanceLetterFileName(nomorPendaftaran, letter.namaLengkap),
  };
}

/** Data surat untuk unduhan admin: Pendaftar Diterima yang punya Nomor VA, sudah diumumkan atau belum. */
export async function findAdminLetterData(supabase: SupabaseClient, participantId: string): Promise<{ nomorPendaftaran: string; letter: AcceptanceLetterData } | null> {
  const { data, error } = await supabase
    .from('pendaftar')
    .select('status,nomor_pendaftaran,nama_lengkap,tempat_lahir,tanggal_lahir,nomor_va')
    .eq('id', participantId)
    .maybeSingle();
  if (error) throw new Error('Data pendaftar tidak dapat dimuat.');
  if (!data || data.status !== 'Diterima' || typeof data.nomor_va !== 'string' || !data.nomor_va) return null;
  return {
    nomorPendaftaran: String(data.nomor_pendaftaran ?? ''),
    letter: {
      namaLengkap: String(data.nama_lengkap ?? ''),
      nomorVa: data.nomor_va,
      tempatLahir: typeof data.tempat_lahir === 'string' ? data.tempat_lahir : null,
      tanggalLahir: typeof data.tanggal_lahir === 'string' ? data.tanggal_lahir : null,
    },
  };
}

export function letterResponse(letter: GeneratedLetter, headers: Record<string, string>) {
  return new Response(new Blob([letter.bytes as BlobPart]), {
    headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${letter.fileName}"` },
  });
}
