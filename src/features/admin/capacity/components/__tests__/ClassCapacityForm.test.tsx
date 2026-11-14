import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ClassCapacity } from '@/features/registration/classCapacity';
import { ClassCapacityForm } from '../ClassCapacityForm';

vi.mock('../actions/saveClassCapacitiesAction', () => ({
  saveClassCapacitiesAction: vi.fn(),
}));

const mockCapacities: ClassCapacity[] = [
  { pilihanKelas: 'Reguler', kuota: 28, terpakai: 20 },
  { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 45 },
  { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 15 },
];

describe('ClassCapacityForm', () => {
  it('renders a single total capacity input prefilled with total capacity', () => {
    render(<ClassCapacityForm capacities={mockCapacities} />);

    const input = screen.getByLabelText('Kapasitas Total Siswa Baru') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('112');
    expect(screen.getByText(/80/)).toBeDefined(); // 20 + 45 + 15 = 80 kursi terpakai
    const button = screen.getByRole('button', { name: 'Simpan kapasitas' }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
