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

    // Dari LoginHero
    expect(screen.getByText('SD Plus 3 Al-Muhajirin')).toBeDefined();
    expect(screen.getByText('Portal Khusus Panitia SPMB')).toBeDefined();

    // Dari AdminLoginForm
    expect(screen.getByText('Masuk Panel Admin')).toBeDefined();
    expect(screen.getByPlaceholderText(/masukkan pin/i)).toBeDefined();
  });
});
