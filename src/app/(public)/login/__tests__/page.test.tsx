import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import LoginPage from '../page';

describe('LoginPage (/login)', () => {
  it('renders split screen with LoginHero and AdminLoginForm', () => {
    render(<LoginPage />);

    // Dari LoginHero dan AdminLoginForm
    expect(screen.getAllByText(/SD Plus 3 Al-Muhajirin/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Panel Administrasi SPMB')).toBeDefined();

    // Dari AdminLoginForm
    expect(screen.getByText('Masuk Panel Admin')).toBeDefined();
    expect(screen.getByPlaceholderText(/masukkan pin/i)).toBeDefined();
  });

  it('uses the mobile viewport height with a safe short-screen scroll fallback', () => {
    render(<LoginPage />);

    const section = screen.getByRole('region', { name: 'Form masuk administrator' });
    const main = section.closest('main');
    const card = screen.getByPlaceholderText(/masukkan pin/i).closest('[data-login-card]');

    expect(main?.className).toContain('h-dvh');
    expect(section.className).toContain('overflow-y-auto');
    expect(section.className).toContain('h-dvh');
    expect(card?.className).toContain('w-full');
    expect(card?.className).toContain('max-w-[31rem]');
  });
});
