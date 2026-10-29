import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../actions/vaImportActions', () => ({ previewVaImportAction: vi.fn(), commitVaImportAction: vi.fn() }));

import { VaImportCard } from '../VaImportCard';

describe('VaImportCard', () => {
  it('asks for an Excel or CSV file before anything can be saved', () => {
    render(<VaImportCard />);
    const input = screen.getByLabelText('File impor Nomor VA');
    expect(input.getAttribute('accept')).toContain('.xlsx');
    expect(input.getAttribute('accept')).toContain('.csv');
    expect(screen.getByRole('button', { name: 'Baca file' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Simpan/ })).toBeNull();
  });
});
