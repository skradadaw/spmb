import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RegistrationCapacityGate from '../components/RegistrationCapacityGate';

describe('RegistrationCapacityGate', () => {
  it('shows the registration form while fewer than 112 participants are complete', () => {
    render(
      <RegistrationCapacityGate isFull={false}>
        <div>Form pendaftaran tersedia</div>
      </RegistrationCapacityGate>,
    );

    expect(screen.getByText('Form pendaftaran tersedia')).toBeDefined();
    expect(screen.queryByText(/kuota pendaftaran sudah penuh/i)).toBeNull();
  });

  it('hides the form and explains that capacity is full at 112 participants', () => {
    render(
      <RegistrationCapacityGate isFull>
        <div>Form pendaftaran tersedia</div>
      </RegistrationCapacityGate>,
    );

    expect(screen.queryByText('Form pendaftaran tersedia')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Kuota pendaftaran sudah penuh' })).toBeDefined();
    expect(screen.getByText(/112 peserta/i)).toBeDefined();
  });
});
