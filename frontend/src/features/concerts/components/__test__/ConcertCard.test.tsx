import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { render, screen } from '../../../../test/test-utils';

import { ConcertCard } from './../ConcertCard';

import type { Concert } from '../../types';

const mockConcert: Concert = {
  id: '1',
  name: 'Summer Music Festival',
  description: 'An amazing outdoor concert experience',
  date: '2026-07-15T19:00:00Z',
  location: 'Central Park, NYC',
  ticketTiers: [
    {
      id: 'tier-1',
      name: 'VIP',
      price: 150,
      totalQuantity: 100,
      availableQuantity: 75,
      concertId: '1',
      createdAt: '2026-01-01',
    },
    {
      id: 'tier-2',
      name: 'General Admission',
      price: 50,
      totalQuantity: 500,
      availableQuantity: 200,
      concertId: '1',
      createdAt: '2026-01-01',
    },
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ConcertCard', () => {
  it('renders concert name', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
  });

  it('renders concert location', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('Central Park, NYC')).toBeInTheDocument();
  });

  it('renders concert description', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('An amazing outdoor concert experience')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText(/Jul/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renders all ticket tiers', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('General Admission')).toBeInTheDocument();
  });

  it('shows ticket prices', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('shows available quantity for tiers', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByText('75 left')).toBeInTheDocument();
    expect(screen.getByText('200 left')).toBeInTheDocument();
  });

  it('shows "Book Tickets" button when tickets are available', () => {
    render(<ConcertCard concert={mockConcert} />);
    expect(screen.getByRole('button', { name: /book tickets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book tickets/i })).toBeEnabled();
  });

  it('shows "Sold Out" button when no tickets are available', () => {
    const soldOutConcert: Concert = {
      ...mockConcert,
      ticketTiers: mockConcert.ticketTiers?.map((tier) => ({
        ...tier,
        availableQuantity: 0,
      })),
    };
    render(<ConcertCard concert={soldOutConcert} />);
    expect(screen.getByRole('button', { name: /sold out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });

  it('opens booking modal when "Book Tickets" is clicked', async () => {
    const user = userEvent.setup();
    render(<ConcertCard concert={mockConcert} />);

    await user.click(screen.getByRole('button', { name: /book tickets/i }));

    expect(screen.getByText('Select Ticket Tier')).toBeInTheDocument();
  });

  it('displays "Sold Out" badge for sold out tiers', () => {
    const partialSoldOut: Concert = {
      ...mockConcert,
      ticketTiers: [
        {
          ...mockConcert.ticketTiers![0],
          availableQuantity: 0,
        },
        mockConcert.ticketTiers![1],
      ],
    };
    render(<ConcertCard concert={partialSoldOut} />);
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('sorts ticket tiers by price (highest first)', () => {
    render(<ConcertCard concert={mockConcert} />);

    const tiers = screen.getAllByText(/left|Sold Out/);
    const vipIndex = tiers.findIndex((el) => el.textContent?.includes('75'));
    const gaIndex = tiers.findIndex((el) => el.textContent?.includes('200'));
    expect(vipIndex).toBeLessThan(gaIndex);
  });
});
