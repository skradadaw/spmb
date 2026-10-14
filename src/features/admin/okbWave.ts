/** Gelombang OKB (lihat CONTEXT.md): tiga kelompok pelaksanaan OKB, tidak menentukan tanggal. */
export const OKB_WAVES = [1, 2, 3] as const;

export type OkbWave = (typeof OKB_WAVES)[number];

/** Accepts the stored number or a form value such as "2"; anything else is not a Gelombang. */
export function parseOkbWave(value: unknown): OkbWave | null {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return OKB_WAVES.find(wave => String(wave) === text) ?? null;
}

export const okbWaveLabel = (wave: OkbWave) => `Gelombang ${wave}`;
