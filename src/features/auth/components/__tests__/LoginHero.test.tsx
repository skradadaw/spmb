import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginHero } from '../LoginHero';

describe('LoginHero Component', () => {
  it('renders school branding and administration heading', () => {
    render(<LoginHero />);
    expect(screen.getByText('SD PLUS 3 AL-MUHAJIRIN')).toBeDefined();
    expect(screen.getByText('SISTEM PENERIMAAN MURID BARU')).toBeDefined();
    expect(screen.getByText('Panel Administrasi SPMB')).toBeDefined();
  });

  it('renders administrator access information', () => {
    render(<LoginHero />);
    expect(screen.getByText(/Akses khusus panitia/i)).toBeDefined();
    expect(screen.getByText(/Jangan bagikan PIN akses/i)).toBeDefined();
  });
});
