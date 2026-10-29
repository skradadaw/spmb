import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CollapsibleCard } from '../components/CollapsibleCard';

describe('CollapsibleCard', () => {
  it('starts open and hides its content, keeping the hint visible, when the header is clicked', () => {
    render(
      <CollapsibleCard title="Berkas" hint="2 dari 5 berkas terverifikasi">
        <textarea aria-label="Catatan admin" defaultValue="draf" />
      </CollapsibleCard>,
    );
    const toggle = screen.getByRole('button', { name: 'Berkas' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Berkas' })).toBeDefined();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Buka')).toBeDefined();
    expect(screen.queryByRole('textbox', { name: 'Catatan admin' })).toBeNull();
    expect(screen.getByText('2 dari 5 berkas terverifikasi')).toBeDefined();

    fireEvent.click(toggle);
    expect((screen.getByRole('textbox', { name: 'Catatan admin' }) as HTMLTextAreaElement).value).toBe('draf');
  });
});
