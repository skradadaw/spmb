import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginHero } from '../LoginHero';

describe('LoginHero Component', () => {
  it('renders school branding and portal badge', () => {
    render(<LoginHero />);
    expect(screen.getByText('SD Plus 3 Al-Muhajirin')).toBeDefined();
    expect(screen.getByText('Portal Khusus Panitia SPMB')).toBeDefined();
  });

  it('renders security guarantee information', () => {
    render(<LoginHero />);
    expect(screen.getByText(/Akses Khusus & Terproteksi/i)).toBeDefined();
    expect(screen.getByText(/Pastikan tidak membagikan PIN keamanan/i)).toBeDefined();
  });
});
