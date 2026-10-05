import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { Input } from '../input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('UI Primitives (Shadcn)', () => {
  describe('Button', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeDefined();
      expect(btn.className).toContain('inline-flex');
    });

    it('supports custom variant and disabled state', () => {
      render(<Button variant="destructive" disabled>Delete</Button>);
      const btn = screen.getByRole('button', { name: /delete/i }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(btn.className).toContain('bg-destructive');
    });
  });

  describe('Input', () => {
    it('renders text input with default classes', () => {
      render(<Input placeholder="Enter PIN" type="password" />);
      const input = screen.getByPlaceholderText(/enter pin/i) as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.type).toBe('password');
    });
  });

  describe('Card', () => {
    it('renders card structure properly', () => {
      render(
        <Card data-testid="test-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Body Content</CardContent>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      );
      expect(screen.getByTestId('test-card')).toBeDefined();
      expect(screen.getByText('Card Title')).toBeDefined();
      expect(screen.getByText('Body Content')).toBeDefined();
    });
  });

  describe('Alert', () => {
    it('renders alert with title and description', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Error Alert')).toBeDefined();
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });
  });
});
