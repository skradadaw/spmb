import { CLASS_OPTIONS, type ClassOption } from '@/features/registration/classCapacity';

/** One fixed color per Pilihan Kelas so the donut, the legend and the bars always agree. */
export const CLASS_COLORS: Record<ClassOption, string> = {
  Reguler: '#059669',
  Bilingual: '#0284c7',
  Tahfizh: '#d97706',
};

export const REMAINING_SEAT_COLOR = '#e2e8f0';

/** CSS-variable-safe key for a class label, e.g. "Reguler" -> "reguler". */
export const classKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const classColor = (label: string) =>
  (CLASS_OPTIONS as readonly string[]).includes(label) ? CLASS_COLORS[label as ClassOption] : '#94a3b8';
