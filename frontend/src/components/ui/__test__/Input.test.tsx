import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { render, screen } from '../../../test/test-utils';

import { Input } from './../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input name="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('has aria-invalid when error is present', () => {
    render(<Input name="email" error="Invalid email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not have aria-invalid when no error', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('applies error styling when error is present', () => {
    render(<Input name="email" error="Invalid" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
  });

  it('applies normal styling when no error', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-gray-300');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input name="email" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');

    expect(input).toHaveValue('test@example.com');
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input name="email" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input name="email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input name="email" className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input name="email" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('uses name as id when id is not provided', () => {
    render(<Input name="email" label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('uses provided id over name', () => {
    render(<Input name="email" id="custom-id" label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('links label to input correctly', () => {
    render(<Input name="email" label="Email Address" />);
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
  });

  it('has aria-describedby linking to error when error present', () => {
    render(<Input name="email" error="Required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });
});
