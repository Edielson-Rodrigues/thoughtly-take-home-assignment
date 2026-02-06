import { describe, it, expect } from 'vitest';

import { render, screen } from '../../../../test/test-utils';

import { StatCard } from './../StatCard';

describe('StatCard', () => {
  it('renders the title', () => {
    render(
      <StatCard title="Total Revenue" value="$10,000" icon={<span data-testid="icon">$</span>} />,
    );
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders the value', () => {
    render(
      <StatCard title="Total Revenue" value="$10,000" icon={<span data-testid="icon">$</span>} />,
    );
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(
      <StatCard title="Total Revenue" value="$10,000" icon={<span data-testid="icon">$</span>} />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders numeric values', () => {
    render(
      <StatCard title="Total Bookings" value={1234} icon={<span data-testid="icon">#</span>} />,
    );
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders with proper styling', () => {
    render(<StatCard title="Test" value="Value" icon={<span>Icon</span>} />);
    expect(screen.getByText('Test')).toHaveClass('text-sm', 'font-medium');
    expect(screen.getByText('Value')).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders within a Card component', () => {
    const { container } = render(<StatCard title="Test" value="Value" icon={<span>Icon</span>} />);
    // Check that the Card wrapper exists (has the Card's styling)
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
  });
});
