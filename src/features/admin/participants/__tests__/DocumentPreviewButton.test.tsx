import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentPreviewButton } from '../components/DocumentPreviewButton';

describe('DocumentPreviewButton', () => {
  it('opens an image preview with zoom and a private download link', async () => {
    const href = '/admin/pendaftar/id/dokumen/aktaKelahiran?contentType=image%2Fjpeg';
    render(<DocumentPreviewButton href={href} title="Akta Kelahiran" />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat berkas Akta Kelahiran' }));
    const dialog = await screen.findByRole('dialog', { name: 'Berkas Akta Kelahiran' });
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe(href);
    expect(screen.getByRole('button', { name: 'Perbesar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Perkecil' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Atur ulang zoom' })).toBeTruthy();
    const preview = dialog.querySelector('[data-document-preview]');
    expect(preview).toBeTruthy();
    fireEvent.wheel(preview as HTMLElement, { deltaY: -100, clientX: 300, clientY: 200 });
    expect(screen.getByText('120%')).toBeTruthy();
    expect(dialog.querySelector('img')?.getAttribute('style')).toContain('scale(1.2)');
    expect(dialog.querySelector('img')?.getAttribute('style')).toContain('translate3d(-60px, -40px, 0)');
    expect(dialog.querySelector('img')?.getAttribute('style')).toContain('160ms');
    expect(screen.getByRole('link', { name: 'Unduh berkas Akta Kelahiran' }).getAttribute('href')).toBe(`${href}&download=1`);
  });

  it('keeps PDF preview and provides a private download link', async () => {
    const href = '/admin/pendaftar/id/dokumen/aktaKelahiran?contentType=application%2Fpdf';
    render(<DocumentPreviewButton href={href} title="Akta Kelahiran" />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat berkas Akta Kelahiran' }));
    const dialog = await screen.findByRole('dialog', { name: 'Berkas Akta Kelahiran' });
    expect(dialog.querySelector('iframe')?.getAttribute('src')).toBe(href);
    expect(screen.getByRole('link', { name: 'Unduh berkas Akta Kelahiran' }).getAttribute('href')).toBe(`${href}&download=1`);
  });
});
