import type { OkbWave } from '@/features/admin/okbWave';

/**
 * Gelombang OKB sebagai satu ramp biru, gelap ke terang mengikuti urutan Gelombang, searah dengan biru status Terjadwal OKB.
 * Tervalidasi sebagai ramp ordinal di permukaan putih: terang-gelap monoton, beda terang tiap langkah cukup, ujung terang 2,54:1.
 */
export const WAVE_COLORS: Record<OkbWave, string> = { 1: '#1e40af', 2: '#2563eb', 3: '#60a5fa' };

/** Kunci aman untuk variabel CSS grafik, misalnya `gelombang1`. */
export const waveKey = (wave: OkbWave) => `gelombang${wave}` as const;

/**
 * Hasil OKB per Gelombang. Tervalidasi kategorikal untuk semua pasangan (buta warna ΔE ≥ 8, penglihatan normal ≥ 20).
 * Kuning di bawah 3:1 terhadap putih, jadi grafiknya selalu disertai angka dan tampilan tabel.
 */
export const RESULT_COLORS = { diterima: '#059669', ditolak: '#be123c', belum: '#ca8a04' } as const;

/** Meter satu rasio: isian hijau di atas lintasan dari ramp hijau yang sama. */
export const METER_COLORS = { fill: '#059669', track: '#d1fae5' } as const;
