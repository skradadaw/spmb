import { describe, expect, it } from 'vitest';
import {
  CLASS_OPTIONS,
  fullClasses,
  isRegistrationFull,
  parseClassOption,
  totalCapacity,
  totalUsedSeats,
  type ClassCapacity,
} from '../classCapacity';

describe('class capacity model', () => {
  const sampleCapacities: ClassCapacity[] = [
    { pilihanKelas: 'Reguler', kuota: 28, terpakai: 20 },
    { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 60 }, // over nominal 56
    { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 10 },
  ];

  it('calculates total used seats across all classes', () => {
    expect(totalUsedSeats(sampleCapacities)).toBe(90);
  });

  it('calculates total capacity across all classes', () => {
    expect(totalCapacity(sampleCapacities)).toBe(112);
  });

  it('reports registration as not full when total used is below total capacity', () => {
    expect(isRegistrationFull(sampleCapacities)).toBe(false);
  });

  it('reports no classes as full when total capacity is not reached even if a single class has high demand', () => {
    expect(fullClasses(sampleCapacities)).toEqual([]);
  });

  it('reports registration and all classes as full when total used equals or exceeds total capacity', () => {
    const full: ClassCapacity[] = [
      { pilihanKelas: 'Reguler', kuota: 28, terpakai: 28 },
      { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 60 },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 24 }, // 28 + 60 + 24 = 112
    ];
    expect(totalUsedSeats(full)).toBe(112);
    expect(isRegistrationFull(full)).toBe(true);
    expect(fullClasses(full)).toEqual([...CLASS_OPTIONS]);
  });

  it('parses valid class options and rejects invalid ones', () => {
    expect(parseClassOption('Reguler')).toBe('Reguler');
    expect(parseClassOption('Bilingual')).toBe('Bilingual');
    expect(parseClassOption('Tahfizh')).toBe('Tahfizh');
    expect(parseClassOption('Akselerasi')).toBeNull();
    expect(parseClassOption(null)).toBeNull();
  });
});
