import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: () => ({
    className: 'font-jakarta',
    variable: '--font-plus-jakarta',
  }),
}));

import RootLayout from '../layout';

describe('RootLayout', () => {
  it('declares smooth scroll behavior so Next.js can manage route transitions', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>Konten</main>
      </RootLayout>,
    );

    expect(markup).toContain('data-scroll-behavior="smooth"');
  });
});
