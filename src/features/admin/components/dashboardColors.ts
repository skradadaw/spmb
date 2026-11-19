import { CLASS_OPTIONS, type ClassOption } from '@/features/registration/classCapacity';

/** One fixed color per Pilihan Kelas so the donut, the legend and the bars always agree. */
export const CLASS_COLORS: Record<ClassOption, string> = {
  Reguler: '#059669',
  Bilingual: '#0284c7',
  Tahfizh: '#d97706',
};

export const REMAINING_SEAT_COLOR = '#e2e8f0';

/** Validated as a categorical pair (light surface, CVD-safe) and kept apart from the Pilihan Kelas colors; grey is for old rows left blank. */
export const GENDER_COLORS = { 'Laki-laki': '#4f46e5', Perempuan: '#db2777', unknown: '#cbd5e1' } as const;

export const genderColor = (label: string) =>
  label === 'Laki-laki' || label === 'Perempuan' ? GENDER_COLORS[label] : GENDER_COLORS.unknown;

/** CSS-variable-safe key for a class label, e.g. "Reguler" -> "reguler". */
export const classKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const classColor = (label: string) =>
  (CLASS_OPTIONS as readonly string[]).includes(label) ? CLASS_COLORS[label as ClassOption] : '#94a3b8';
