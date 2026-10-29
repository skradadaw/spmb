import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../actions/announceActions', () => ({ announceWaveAction: vi.fn() }));

import { WaveAnnouncementCard } from '../WaveAnnouncementCard';

const summary = { wave: 2 as const, diterima: { announced: 1, pending: 20 }, ditolak: { announced: 0, pending: 3 }, undecided: 2, missingVa: 4 };

describe('WaveAnnouncementCard', () => {
  it('confirms how many Diterima and Ditolak will be announced, and that undecided ones are skipped', () => {
    render(<WaveAnnouncementCard summary={summary} />);
    expect(screen.getByText('4 Pendaftar Diterima belum punya Nomor VA.')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Umumkan Gelombang 2' }));
    expect(screen.getByText(/20 Diterima dan 3 Ditolak akan diumumkan/)).toBeDefined();
    expect(screen.getByText(/2 pendaftar yang belum diputuskan dilewati/)).toBeDefined();
    const confirm = screen.getByRole('button', { name: 'Ya, umumkan' }) as HTMLButtonElement;
    expect(confirm.value).toBe('announce');
    expect((confirm.form?.querySelector('input[name="gelombang"]') as HTMLInputElement).value).toBe('2');
  });

  it('disables announcing when nothing is pending and withdrawing when nothing is announced', () => {
    render(<WaveAnnouncementCard summary={{ ...summary, diterima: { announced: 0, pending: 0 }, ditolak: { announced: 0, pending: 0 } }} />);
    expect((screen.getByRole('button', { name: 'Umumkan Gelombang 2' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Tarik' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
