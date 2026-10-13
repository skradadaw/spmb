'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

const NOMOR_PATTERN = /^OB-\d{4}-\d{3,}$/;

export type ScanApplicant = {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  status: string;
  jadwalTanggal: string | null;
  jadwalSesi: string | null;
};

export type ScanAttendanceResult = {
  outcome: 'present' | 'rejected';
  message: string;
  applicant: ScanApplicant | null;
};

const rejected = (message: string, applicant: ScanApplicant | null = null): ScanAttendanceResult => ({ outcome: 'rejected', message, applicant });

/** Tanggal hari ini menurut waktu sekolah (WIB), format YYYY-MM-DD. */
function todayInJakarta(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now);
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

export async function scanAttendanceAction(rawNomor: string): Promise<ScanAttendanceResult> {
  if (!await getAdminSession()) return rejected('Sesi admin tidak valid. Silakan masuk kembali.');

  const nomor = String(rawNomor ?? '').trim().toUpperCase();
  if (!NOMOR_PATTERN.test(nomor)) return rejected('QR bukan Nomor Pendaftaran yang valid.');

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('pendaftar')
      .select('id,nomor_pendaftaran,nama_lengkap,status,jadwal_okb_tanggal,jadwal_okb_sesi')
      .eq('nomor_pendaftaran', nomor)
      .maybeSingle();
    if (error) throw error;
    if (!data) return rejected(`Nomor ${nomor} tidak ditemukan.`);

    const applicant: ScanApplicant = {
      id: String(data.id),
      nomorPendaftaran: nomor,
      namaLengkap: String(data.nama_lengkap ?? ''),
      status: String(data.status ?? ''),
      jadwalTanggal: typeof data.jadwal_okb_tanggal === 'string' ? data.jadwal_okb_tanggal : null,
      jadwalSesi: typeof data.jadwal_okb_sesi === 'string' ? data.jadwal_okb_sesi : null,
    };

    if (applicant.status === 'Sudah OKB') return rejected('Sudah tercatat hadir OKB.', applicant);
    if (applicant.status === 'Menunggu Verifikasi' || applicant.status === 'Terverifikasi') {
      return rejected('Belum dijadwalkan OKB. Jadwalkan terlebih dahulu di detail pendaftar.', applicant);
    }
    if (applicant.status !== 'Terjadwal OKB') return rejected(`Status pendaftar: ${applicant.status}. Tidak dapat dicatat hadir.`, applicant);

    const today = todayInJakarta();
    if (applicant.jadwalTanggal !== today) {
      const jadwal = applicant.jadwalTanggal ? `${formatDate(applicant.jadwalTanggal)}${applicant.jadwalSesi ? `, ${applicant.jadwalSesi}` : ''}` : 'belum ada tanggal';
      return rejected(`Bukan jadwal OKB hari ini (jadwal: ${jadwal}). Jadwalkan ulang terlebih dahulu.`, applicant);
    }

    const { data: updated, error: updateError } = await supabase
      .from('pendaftar')
      .update({ status: 'Sudah OKB' })
      .eq('id', applicant.id)
      .eq('status', 'Terjadwal OKB')
      .eq('jadwal_okb_tanggal', today)
      .select('id')
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return rejected('Status pendaftar sudah berubah. Silakan scan ulang.', applicant);

    revalidatePath(`/admin/pendaftar/${applicant.id}`);
    revalidatePath('/admin/pendaftar');
    return { outcome: 'present', message: 'Hadir tercatat.', applicant: { ...applicant, status: 'Sudah OKB' } };
  } catch {
    return rejected('Kehadiran tidak dapat dicatat. Periksa koneksi lalu coba lagi.');
  }
}
