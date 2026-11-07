import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../../actions/saveRuangOkbAction', () => ({ saveRuangOkbAction: mocks.save }));

import { RuangOkbForm } from '../RuangOkbForm';

const participantId = '123e4567-e89b-12d3-a456-426614174000';

describe('RuangOkbForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB disimpan untuk 1 Pendaftar.', updated: 1 });
  });

  it('saves the typed room for this applicant and shows the result', async () => {
    render(<RuangOkbForm participantId={participantId} ruangOkb={null} />);
    fireEvent.change(screen.getByLabelText('Ruang OKB'), { target: { value: 'Ruang B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Ruang OKB disimpan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([participantId], 'Ruang B');
  });

  it('clears the room regardless of what is typed', async () => {
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB dikosongkan untuk 1 Pendaftar.', updated: 1 });
    render(<RuangOkbForm participantId={participantId} ruangOkb="Ruang A" />);
    fireEvent.click(screen.getByRole('button', { name: 'Kosongkan' }));

    expect(await screen.findByText('Ruang OKB dikosongkan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([participantId], '');
  });

  it('shows why the room could not be saved', async () => {
    mocks.save.mockResolvedValue({ status: 'error', message: 'Nama ruangan maksimal 30 karakter.', updated: 0 });
    render(<RuangOkbForm participantId={participantId} ruangOkb={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Nama ruangan maksimal 30 karakter.')).toBeDefined();
  });
});
