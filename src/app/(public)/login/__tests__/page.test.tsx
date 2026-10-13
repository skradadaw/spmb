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
  it('renders the desktop hero, the mobile header, and the PIN form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Panel Administrasi SPMB')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: 'Masuk Panel Admin' })).toBeDefined();
    expect(screen.getByLabelText('PIN Admin')).toBeDefined();
  });

  it('gives mobile a green header with a back arrow above the form sheet', () => {
    render(<LoginPage />);

    const header = screen.getByTestId('mobile-login-header');
    expect(header.className).toContain('lg:hidden');
    expect(header.className).toContain('bg-[#064A18]');
    expect(screen.getByRole('link', { name: 'Kembali ke beranda SPMB' }).getAttribute('href')).toBe('/');

    const sheet = screen.getByLabelText('PIN Admin').closest('[data-login-card]');
    expect(sheet?.className).toContain('-mt-6');
    expect(sheet?.className).toContain('rounded-t-[1.75rem]');
    expect(sheet?.className).not.toContain('min-h-[80dvh]');
  });

  it('lets mobile scroll while keeping the desktop panel fixed', () => {
    render(<LoginPage />);

    const main = screen.getByRole('region', { name: 'Form masuk administrator' }).closest('main');
    expect(main?.className).toContain('min-h-dvh');
    expect(main?.className).toContain('lg:overflow-hidden');
  });
});
