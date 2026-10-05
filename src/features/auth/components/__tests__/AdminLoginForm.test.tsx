import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockVerifyAction = vi.fn();
vi.mock('@/features/auth/actions', () => ({
  verifyAdminPinAction: (pin: string) => mockVerifyAction(pin),
}));

// Mock next/navigation useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { AdminLoginForm } from '../AdminLoginForm';

describe('AdminLoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PIN input masked by default with toggle button', () => {
    render(<AdminLoginForm />);
    const input = screen.getByPlaceholderText(/masukkan pin/i) as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /tampilkan pin/i });
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.tabIndex).toBe(0);

    // Click toggle to show PIN
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');

    // Click toggle to hide PIN
    const hideBtn = screen.getByRole('button', { name: /sembunyikan pin/i });
    fireEvent.click(hideBtn);
    expect(input.type).toBe('password');
  });

  it('keeps the school identity visible when the desktop hero is unavailable', () => {
    render(<AdminLoginForm />);

    expect(screen.getByText('SD Plus 3 Al-Muhajirin')).toBeDefined();
    expect(screen.getByText('Sistem Penerimaan Murid Baru')).toBeDefined();
  });

  it('calls verifyAdminPinAction and redirects on success', async () => {
    mockVerifyAction.mockResolvedValue({ success: true, redirectUrl: '/admin' });
    render(<AdminLoginForm />);

    const input = screen.getByPlaceholderText(/masukkan pin/i);
    fireEvent.change(input, { target: { value: '123456' } });

    const submitBtn = screen.getByRole('button', { name: /masuk ke panel admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyAction).toHaveBeenCalledWith('123456');
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('displays alert message when verification fails', async () => {
    mockVerifyAction.mockResolvedValue({
      success: false,
      error: 'PIN salah. Sisa 3 kesempatan.',
    });
    render(<AdminLoginForm />);

    const input = screen.getByPlaceholderText(/masukkan pin/i);
    fireEvent.change(input, { target: { value: '999999' } });

    const submitBtn = screen.getByRole('button', { name: /masuk ke panel admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('PIN salah. Sisa 3 kesempatan.')).toBeDefined();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toContain('admin-pin-error');
      expect(screen.getByRole('alert').getAttribute('id')).toBe('admin-pin-error');
    });
  });

  it('has a link back to home page', () => {
    render(<AdminLoginForm />);
    const backLink = screen.getByRole('link', { name: /kembali ke beranda spmb/i });
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('only enables submission for a complete 6 digit PIN', () => {
    render(<AdminLoginForm />);
    const input = screen.getByPlaceholderText(/masukkan pin/i);
    const submitBtn = screen.getByRole('button', { name: /masuk ke panel admin/i });

    fireEvent.change(input, { target: { value: '12345' } });
    expect(submitBtn.getAttribute('disabled')).not.toBeNull();

    fireEvent.change(input, { target: { value: '123456' } });
    expect(submitBtn.getAttribute('disabled')).toBeNull();
  });
});
