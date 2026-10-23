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

  it('starts hidden on the first visit, leaving only the panel toggle', () => {
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    const sidebar = screen.getByTestId('admin-sidebar');

    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(sidebar.hasAttribute('inert')).toBe(true);
    expect(screen.getByRole('button', { name: 'Tampilkan sidebar' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('remembers the expanded preference', async () => {
    const { unmount } = render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan sidebar' }));
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('expanded');
    expect(screen.getByTestId('admin-sidebar').hasAttribute('inert')).toBe(false);
    expect(window.localStorage.getItem('admin-sidebar-collapsed')).toBe('false');

    unmount();
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sembunyikan sidebar' })).toBeDefined());
  });

  it('hides the desktop sidebar and remembers the preference', async () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    const { unmount } = render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Sembunyikan sidebar' }));

    expect(screen.getByRole('button', { name: 'Tampilkan sidebar' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('collapsed');
    expect(screen.getByTestId('admin-content').getAttribute('data-sidebar-state')).toBe('collapsed');
    expect(window.localStorage.getItem('admin-sidebar-collapsed')).toBe('true');

    unmount();
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tampilkan sidebar' })).toBeDefined());
  });

  it('toggles the sidebar with Ctrl+B', () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('collapsed');

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('admin-sidebar').getAttribute('data-state')).toBe('expanded');
  });

  it('keeps logout inside the account menu', () => {
    window.localStorage.setItem('admin-sidebar-collapsed', 'false');
    render(<AdminShell active="summary"><h1>Konten admin</h1></AdminShell>);
    const sidebar = screen.getByTestId('admin-sidebar');

    expect(within(sidebar).getByRole('link', { name: 'Ringkasan' }).getAttribute('aria-current')).toBe('page');
    expect(within(sidebar).queryByRole('button', { name: 'Keluar dari panel admin' })).toBeNull();
    fireEvent.click(within(sidebar).getByRole('button', { name: 'Menu akun admin' }));
    expect(screen.getByRole('button', { name: 'Keluar dari panel admin' })).toBeDefined();
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
