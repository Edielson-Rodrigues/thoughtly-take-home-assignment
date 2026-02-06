import { render, screen } from '../../../test/test-utils';
import { describe, it, expect } from 'vitest';
import { Alert } from './../Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies info variant styling by default', () => {
    render(<Alert>Info alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });

  it('applies success variant styling', () => {
    render(<Alert variant="success">Success alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });

  it('applies warning variant styling', () => {
    render(<Alert variant="warning">Warning alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
  });

  it('applies error variant styling', () => {
    render(<Alert variant="error">Error alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('has proper base styling', () => {
    render(<Alert>Base alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('rounded-lg', 'border', 'p-4');
  });

  it('displays appropriate icon for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });
});
