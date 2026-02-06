import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SalesChart } from '../SalesChart';

describe('SalesChart', () => {
  const mockData = [
    {
      date: '2024-01-01',
      revenue: 5000,
      tickets: 50,
    },
    {
      date: '2024-01-02',
      revenue: 7500,
      tickets: 75,
    },
    {
      date: '2024-01-03',
      revenue: 3000,
      tickets: 30,
    },
  ];

  it('should render legend with Revenue label', () => {
    render(<SalesChart data={mockData} />);

    const legend = screen.getByText('Revenue');
    expect(legend).toBeInTheDocument();
  });

  it('should return null when data is empty', () => {
    const { container } = render(<SalesChart data={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render chart container with correct height classes', () => {
    const { container } = render(<SalesChart data={mockData} />);

    const chartContainer = container.querySelector('.h-56');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render legend with blue indicator', () => {
    render(<SalesChart data={mockData} />);

    const blueIndicator = screen.getByText('Revenue').previousSibling;
    expect(blueIndicator).toHaveClass('bg-blue-500');
  });

  it('should display correct structure with legend', () => {
    const { container } = render(<SalesChart data={mockData} />);

    const legendContainer = container.querySelector('.flex.justify-center.gap-6.mt-4.text-sm');
    expect(legendContainer).toBeInTheDocument();
  });

  it('should handle single data point', () => {
    const singlePoint = [
      {
        date: '2024-01-01',
        revenue: 1000,
        tickets: 10,
      },
    ];

    render(<SalesChart data={singlePoint} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should handle multiple data points', () => {
    const multiplePoints = Array.from({ length: 10 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      revenue: (i + 1) * 1000,
      tickets: (i + 1) * 10,
    }));

    render(<SalesChart data={multiplePoints} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should render sm:h-64 responsive class', () => {
    const { container } = render(<SalesChart data={mockData} />);

    const chartContainer = container.querySelector('.sm\\:h-64');
    expect(chartContainer).toBeInTheDocument();
  });
});
