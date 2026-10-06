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

  it('presents the desktop school identity without a card while keeping its separator', () => {
    render(<LoginHero />);

    const identity = screen.getByText('SD PLUS 3 AL-MUHAJIRIN').closest('header');
    const logo = screen.getByAltText('Logo SD Plus 3 Al-Muhajirin');
    const separator = logo.parentElement?.nextElementSibling;

    expect(identity?.className).not.toContain('rounded-2xl');
    expect(identity?.className).not.toContain('border');
    expect(identity?.className).not.toContain('bg-gradient-to-r');
    expect(identity?.className).not.toContain('shadow-[');
    expect(identity?.className).not.toContain('backdrop-blur');
    expect(separator?.className).toContain('w-px');
  });
});
