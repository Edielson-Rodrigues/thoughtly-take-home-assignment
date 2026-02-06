import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RevenueByTierChart } from '../RevenueByTierChart';

describe('RevenueByTierChart', () => {
  const mockData = [
    {
      tierName: 'VIP',
      concertName: 'Rock Concert',
      revenue: 6000,
      percentage: 60,
    },
    {
      tierName: 'General',
      concertName: 'Rock Concert',
      revenue: 4000,
      percentage: 40,
    },
    {
      tierName: 'Premium',
      concertName: 'Jazz Night',
      revenue: 3500,
      percentage: 35,
    },
  ];

  it('should return null when data is empty', () => {
    const { container } = render(<RevenueByTierChart data={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render chart container with correct height classes', () => {
    const { container } = render(<RevenueByTierChart data={mockData} />);

    const chartContainer = container.querySelector('.h-72');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render sm:h-80 responsive class', () => {
    const { container } = render(<RevenueByTierChart data={mockData} />);

    const chartContainer = container.querySelector('.sm\\:h-80');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render with full width', () => {
    const { container } = render(<RevenueByTierChart data={mockData} />);

    const chartContainer = container.querySelector('.w-full');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle single tier data', () => {
    const singleTier = [
      {
        tierName: 'VIP',
        concertName: 'Solo Concert',
        revenue: 10000,
        percentage: 100,
      },
    ];

    const { container } = render(<RevenueByTierChart data={singleTier} />);
    expect(container.querySelector('.w-full')).toBeInTheDocument();
  });

  it('should handle multiple tiers', () => {
    const multipleTiers = Array.from({ length: 5 }, (_, i) => ({
      tierName: `Tier ${i + 1}`,
      concertName: `Concert ${i + 1}`,
      revenue: (5 - i) * 1000,
      percentage: ((5 - i) / 15) * 100,
    }));

    const { container } = render(<RevenueByTierChart data={multipleTiers} />);
    expect(container.querySelector('.w-full')).toBeInTheDocument();
  });

  it('should handle zero revenue', () => {
    const zeroRevenueData = [
      {
        tierName: 'Free',
        concertName: 'Free Concert',
        revenue: 0,
        percentage: 0,
      },
    ];

    const { container } = render(<RevenueByTierChart data={zeroRevenueData} />);
    expect(container.querySelector('.w-full')).toBeInTheDocument();
  });

  it('should render without errors for valid data', () => {
    const { container } = render(<RevenueByTierChart data={mockData} />);
    expect(container.firstChild).toBeTruthy();
  });
});
