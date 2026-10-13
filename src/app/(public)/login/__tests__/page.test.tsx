import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

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
    expect(screen.getByRole('heading', { level: 2, name: 'Masuk Panel Admin' })).toBeDefined();
    expect(screen.getByLabelText('Masukkan PIN')).toBeDefined();
  });

  it('gives mobile a green header band with a back arrow, logo, and school name above the form', () => {
    render(<LoginPage />);

    const header = screen.getByTestId('mobile-login-header');
    expect(header.className).toContain('lg:hidden');
    expect(header.className).toContain('bg-brand-green');
    expect(screen.getByRole('link', { name: 'Kembali ke beranda SPMB' }).getAttribute('href')).toBe('/');
    expect(within(header).getByAltText('Logo SD Plus 3 Al-Muhajirin')).toBeDefined();
    expect(within(header).getByRole('heading', { level: 1, name: 'SD Plus 3 Al-Muhajirin' })).toBeDefined();
    expect(within(header).queryByText('Akses Admin')).toBeNull();
    expect(within(header).queryByText('Panel Admin SPMB')).toBeNull();

    const sheet = screen.getByLabelText('Masukkan PIN').closest('[data-login-card]');
    expect(sheet?.className).toContain('-mt-14');
    expect(sheet?.className).toContain('rounded-3xl');
  });

  it('lets mobile scroll while keeping the desktop panel fixed', () => {
    render(<LoginPage />);

    const main = screen.getByRole('region', { name: 'Form masuk administrator' }).closest('main');
    expect(main?.className).toContain('min-h-dvh');
    expect(main?.className).toContain('lg:overflow-hidden');
  });
});
