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
});
