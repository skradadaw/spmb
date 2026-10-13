import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

// jsdom tidak menyediakan elementFromPoint; input-otp memakainya untuk deteksi password manager.
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null;
}
