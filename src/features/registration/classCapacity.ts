export const CLASS_OPTIONS = ['Reguler', 'Bilingual', 'Tahfizh'] as const;

export type ClassOption = (typeof CLASS_OPTIONS)[number];

export function parseClassOption(value: unknown): ClassOption | null {
  return CLASS_OPTIONS.find((option) => option === value) ?? null;
}

export type ClassCapacity = {
  pilihanKelas: ClassOption;
  kuota: number;
  terpakai: number;
};

export function isClassFull(capacity: ClassCapacity) {
  return capacity.terpakai >= capacity.kuota;
}

export type ClassQuotaStatus = 'Tersedia' | 'Hampir penuh' | 'Penuh';

/** A Pilihan Kelas is Hampir penuh once at most this share of its kuota is left. */
const NEARLY_FULL_SHARE = 0.2;

export function classQuotaStatus(capacity: ClassCapacity): ClassQuotaStatus {
  if (isClassFull(capacity)) return 'Penuh';
  const remaining = capacity.kuota - capacity.terpakai;
  return remaining <= capacity.kuota * NEARLY_FULL_SHARE ? 'Hampir penuh' : 'Tersedia';
}

export function fullClasses(capacities: readonly ClassCapacity[]): ClassOption[] {
  return capacities.filter(isClassFull).map(({ pilihanKelas }) => pilihanKelas);
}

export function totalUsedSeats(capacities: readonly ClassCapacity[]) {
  return capacities.reduce((sum, { terpakai }) => sum + terpakai, 0);
}
