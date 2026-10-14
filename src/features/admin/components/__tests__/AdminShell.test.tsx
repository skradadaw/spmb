import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminShell } from '../AdminShell';

vi.mock('@/features/auth/logout-action', () => ({ logoutAdminAction: vi.fn() }));

describe('AdminShell navigation', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
  });

  it('starts minimised on the first visit', () => {
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);

    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('mini');
    expect(screen.getByRole('button', { name: 'Perluas sidebar' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('remembers the expanded preference', async () => {
    const { unmount } = render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Perluas sidebar' }));
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('expanded');
    expect(window.localStorage.getItem('admin-sidebar-collapsed')).toBe('false');

    unmount();
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Minimalkan sidebar' })).toBeDefined());
  });

  it('collapses the desktop sidebar to icon navigation and remembers the preference', async () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    const { unmount } = render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    const collapseButton = screen.getByRole('button', { name: 'Minimalkan sidebar' });

    fireEvent.click(collapseButton);

    expect(screen.getByRole('button', { name: 'Perluas sidebar' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('mini');
    expect(screen.getByTestId('admin-content').getAttribute('data-sidebar-state')).toBe('mini');
    expect(window.localStorage.getItem('admin-sidebar-collapsed')).toBe('true');

    unmount();
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Perluas sidebar' })).toBeDefined());
  });

  it('toggles the sidebar with Ctrl+B', () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('mini');

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('expanded');
  });

  it('keeps sidebar labels mounted while switching to mini mode', () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    const sidebar = screen.getByTestId('admin-sidebar');
    const summaryLabel = within(sidebar).getByText('Ringkasan');
    const schoolLabel = within(sidebar).getByText('SD Plus 3 Al-Muhajirin');
    const sessionLabel = within(sidebar).getByText('Sesi administrator');

    fireEvent.click(screen.getByRole('button', { name: 'Minimalkan sidebar' }));

    expect(summaryLabel.isConnected).toBe(true);
    expect(summaryLabel.getAttribute('aria-hidden')).toBe('true');
    expect(schoolLabel.isConnected).toBe(true);
    expect(sessionLabel.isConnected).toBe(true);
  });

  it('opens and closes the mobile admin navigation from a hamburger button', () => {
    render(<AdminShell active="participants"><h1>Konten admin</h1></AdminShell>);
    const menuButton = screen.getByRole('button', { name: 'Buka menu admin' });

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('navigation', { name: 'Navigasi admin mobile' })).toBeNull();

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Tutup menu admin' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('navigation', { name: 'Navigasi admin mobile' })).toBeDefined();

    const mobileNavigation = screen.getByRole('navigation', { name: 'Navigasi admin mobile' });
    expect(within(mobileNavigation).getByRole('link', { name: 'Data Pendaftar' }).getAttribute('aria-current')).toBe('page');
    expect(within(screen.getByRole('dialog', { name: 'Menu admin' })).getByRole('button', { name: 'Keluar dari panel admin' })).toBeDefined();

    fireEvent.click(within(mobileNavigation).getByRole('link', { name: 'Ringkasan' }));
    expect(screen.queryByRole('navigation', { name: 'Navigasi admin mobile' })).toBeNull();
  });
});
