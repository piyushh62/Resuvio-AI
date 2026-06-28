import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactPage from './ContactPage';

describe('ContactPage UI', () => {
  it('renders the contact us heading', () => {
    render(<ContactPage />);
    const heading = screen.getByRole('heading', { name: /get in touch/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the contact form fields', () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
});
