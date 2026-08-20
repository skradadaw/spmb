import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CopyAccountButton from '@/features/home/components/CopyAccountButton';

describe('CopyAccountButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies the account number and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<CopyAccountButton accountNumber="1060017434" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('1060017434'));
    expect(screen.getByRole('status').textContent).toContain('Berhasil disalin');
  });

  it('asks for manual copy without reporting false success', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });

    render(<CopyAccountButton accountNumber="1060017434" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening' }));

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Silakan salin manual'),
    );
    expect(screen.queryByText('Berhasil disalin')).toBeNull();
  });

  it('resets the success label after 2,000ms', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<CopyAccountButton accountNumber="1060017434" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening' }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('button').textContent).toContain('Berhasil disalin');

    act(() => vi.advanceTimersByTime(1_999));
    expect(screen.getByRole('button').textContent).toContain('Berhasil disalin');

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('button').textContent).toContain('Salin rekening');
  });
});
