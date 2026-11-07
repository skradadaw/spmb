import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../../actions/saveRuangOkbAction', () => ({ saveRuangOkbAction: mocks.save }));

import { RuangOkbForm } from '../RuangOkbForm';

const applicantId = '123e4567-e89b-12d3-a456-426614174000';
const renderForm = (ruangOkb: string | null = null, suggestions: string[] = []) => render(<RuangOkbForm applicantId={applicantId} ruangOkb={ruangOkb} suggestions={suggestions} />);

describe('RuangOkbForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB disimpan untuk 1 Pendaftar.', updated: 1 });
  });

  it('saves the typed room for this applicant and shows the result', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Ruang OKB'), { target: { value: 'Ruang B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Ruang OKB disimpan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([applicantId], 'Ruang B');
  });

  it('clears the room regardless of what is typed', async () => {
    mocks.save.mockResolvedValue({ status: 'success', message: 'Ruang OKB dikosongkan untuk 1 Pendaftar.', updated: 1 });
    renderForm('Ruang A');
    fireEvent.click(screen.getByRole('button', { name: 'Kosongkan' }));

    expect(await screen.findByText('Ruang OKB dikosongkan untuk 1 Pendaftar.')).toBeDefined();
    expect(mocks.save).toHaveBeenCalledWith([applicantId], '');
  });

  it('shows why the room could not be saved', async () => {
    mocks.save.mockResolvedValue({ status: 'error', message: 'Nama ruangan maksimal 30 karakter.', updated: 0 });
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Simpan ruangan' }));

    expect(await screen.findByText('Nama ruangan maksimal 30 karakter.')).toBeDefined();
  });

  it('suggests rooms already in use while still accepting a new name', () => {
    renderForm(null, ['Ruang A', 'Ruang B']);
    const input = screen.getByLabelText('Ruang OKB');
    const list = document.getElementById(input.getAttribute('list') ?? '');

    expect([...(list?.querySelectorAll('option') ?? [])].map(option => option.value)).toEqual(['Ruang A', 'Ruang B']);
  });

  it('leaves the length limit to the server, so an over-long name gets its message', () => {
    renderForm();

    expect(screen.getByLabelText('Ruang OKB').hasAttribute('maxlength')).toBe(false);
  });
});
