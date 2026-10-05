import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../badge';
import { Separator } from '../separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';

describe('admin shadcn primitives', () => {
  it('renders semantic table structure', () => {
    render(
      <Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>Alya</TableCell></TableRow></TableBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByRole('columnheader', { name: 'Nama' })).toBeDefined();
    expect(screen.getByRole('cell', { name: 'Alya' })).toBeDefined();
  });

  it('applies the requested badge variant', () => {
    render(<Badge variant="success">Terverifikasi</Badge>);
    expect(screen.getByText('Terverifikasi').className).toContain('bg-emerald-50');
  });

  it('renders a horizontal separator by default', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
  });
});
