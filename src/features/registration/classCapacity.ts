export const CLASS_OPTIONS = ['Reguler', 'Bilingual', 'Tahfizh'] as const;

export type ClassOption = (typeof CLASS_OPTIONS)[number];

export type ClassCapacity = {
  pilihanKelas: ClassOption;
  kuota: number;
  terpakai: number;
};

export function isClassFull(capacity: ClassCapacity) {
  return capacity.terpakai >= capacity.kuota;
}

export function fullClasses(capacities: readonly ClassCapacity[]): ClassOption[] {
  return capacities.filter(isClassFull).map(({ pilihanKelas }) => pilihanKelas);
}

export function totalUsedSeats(capacities: readonly ClassCapacity[]) {
  return capacities.reduce((sum, { terpakai }) => sum + terpakai, 0);
}
