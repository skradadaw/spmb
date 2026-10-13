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

const getPinInput = () => screen.getByLabelText('PIN Admin') as HTMLInputElement;

describe('AdminLoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PIN input masked by default with toggle button', () => {
    render(<AdminLoginForm />);
    const input = getPinInput();
    expect(input.type).toBe('password');

    fireEvent.click(screen.getByRole('button', { name: /tampilkan pin/i }));
    expect(input.type).toBe('text');

    fireEvent.click(screen.getByRole('button', { name: /sembunyikan pin/i }));
    expect(input.type).toBe('password');
  });

  it('shows six PIN boxes that fill as digits are typed', () => {
    render(<AdminLoginForm />);
    const boxes = screen.getByTestId('pin-boxes').querySelectorAll('[aria-hidden="true"]');
    expect(boxes).toHaveLength(6);

    fireEvent.change(getPinInput(), { target: { value: '12' } });
    expect(boxes[0].childElementCount).toBe(1);
    expect(boxes[1].childElementCount).toBe(1);
    expect(boxes[2].childElementCount).toBe(0);
  });

  it('keeps only digits and at most 6 of them', () => {
    mockVerifyAction.mockResolvedValue({ success: false, error: 'x' });
    render(<AdminLoginForm />);
    const input = getPinInput();

    fireEvent.change(input, { target: { value: '12 ab3' } });
    expect(input.value).toBe('123');
  });

  it('submits automatically on the sixth digit and redirects on success', async () => {
    mockVerifyAction.mockResolvedValue({ success: true, redirectUrl: '/admin' });
    render(<AdminLoginForm />);

    fireEvent.change(getPinInput(), { target: { value: '123456' } });

    await waitFor(() => {
      expect(mockVerifyAction).toHaveBeenCalledTimes(1);
      expect(mockVerifyAction).toHaveBeenCalledWith('123456');
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('clears the boxes and shows an alert when verification fails', async () => {
    mockVerifyAction.mockResolvedValue({
      success: false,
      error: 'PIN salah. Sisa 3 kesempatan.',
    });
    render(<AdminLoginForm />);
    const input = getPinInput();

    fireEvent.change(input, { target: { value: '999999' } });

    await waitFor(() => {
      expect(screen.getByText('PIN salah. Sisa 3 kesempatan.')).toBeDefined();
      expect(input.value).toBe('');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('admin-pin-error');
      expect(screen.getByRole('alert').getAttribute('id')).toBe('admin-pin-error');
      expect(document.activeElement).toBe(input);
    });
  });

  it('only enables the submit button for a complete 6 digit PIN', () => {
    mockVerifyAction.mockReturnValue(new Promise(() => {}));
    render(<AdminLoginForm />);
    const submitBtn = screen.getByRole('button', { name: /masuk ke panel admin/i });

    fireEvent.change(getPinInput(), { target: { value: '12345' } });
    expect(submitBtn.getAttribute('disabled')).not.toBeNull();
  });

  it('does not open the keyboard on mobile', () => {
    render(<AdminLoginForm />);
    expect(document.activeElement).not.toBe(getPinInput());
  });

  it('warns not to share the Admin PIN', () => {
    render(<AdminLoginForm />);
    expect(screen.getByText(/jangan bagikan pin admin/i)).toBeDefined();
  });

  it('has a link back to home page', () => {
    render(<AdminLoginForm />);
    const backLink = screen.getByRole('link', { name: /kembali ke beranda/i });
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('links support to the official WhatsApp number', () => {
    render(<AdminLoginForm />);
    const supportLink = screen.getByRole('link', { name: /hubungi support/i });

    expect(supportLink.getAttribute('href')).toBe('https://wa.me/6287723487776');
  });
});
