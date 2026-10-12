import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentPreviewButton } from '../components/DocumentPreviewButton';

describe('DocumentPreviewButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('opens an image preview with zoom and rotation controls', async () => {
    const href = '/admin/pendaftar/id/dokumen/aktaKelahiran?contentType=image%2Fjpeg';
    render(<DocumentPreviewButton href={href} title="Akta Kelahiran" />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat berkas Akta Kelahiran' }));
    const dialog = await screen.findByRole('dialog', { name: 'Berkas Akta Kelahiran' });
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe(href);
    expect(screen.getByRole('button', { name: 'Perbesar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Perkecil' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Atur ulang tampilan' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Putar ke kanan' }));
    expect(screen.getByRole('img', { name: 'Akta Kelahiran' }).getAttribute('style')).toContain('rotate(90deg)');
    const preview = screen.getByRole('dialog', { name: 'Berkas Akta Kelahiran' }).querySelector('[data-document-preview]');
    vi.spyOn(preview as HTMLElement, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.wheel(preview as HTMLElement, { deltaY: -100, clientX: 300, clientY: 200 });
    expect(screen.getByText('120%')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Akta Kelahiran' }).getAttribute('style')).toContain('scale(1.2)');
    expect(screen.getByRole('img', { name: 'Akta Kelahiran' }).getAttribute('style')).toContain('translate3d(20px, 20px, 0)');
    expect(screen.getByRole('link', { name: 'Unduh berkas Akta Kelahiran' }).getAttribute('href')).toBe(`${href}&download=1`);
  });

  it('uses the in-app PDF.js renderer instead of a browser PDF frame', async () => {
    const href = '/admin/pendaftar/id/dokumen/aktaKelahiran?contentType=application%2Fpdf';
    render(<DocumentPreviewButton href={href} title="Akta Kelahiran" />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat pratinjau PDF Akta Kelahiran' }));
    const dialog = await screen.findByRole('dialog', { name: 'Berkas Akta Kelahiran' });
    expect(dialog.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('link', { name: 'Unduh berkas Akta Kelahiran' }).getAttribute('href')).toBe(`${href}&download=1`);
    expect(await screen.findByTestId('pdfjs-preview')).toBeTruthy();
  });
});
