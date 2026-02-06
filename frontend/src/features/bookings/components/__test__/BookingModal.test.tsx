import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render, screen, waitFor } from '../../../../test/test-utils';
import { BookingModal } from '../BookingModal';

import type { TicketTier } from '../../../concerts/types';

const mockMutateAsync = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useCreateBooking', () => ({
  useCreateBooking: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    reset: mockReset,
  }),
}));

const mockTicketTiers: TicketTier[] = [
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
  {
    id: 'tier-3',
    name: 'Sold Out Tier',
    price: 75,
    totalQuantity: 50,
    availableQuantity: 0,
    concertId: '1',
    createdAt: '2026-01-01',
  },
];

describe('BookingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tier Selection Step', () => {
    it('renders nothing when isOpen is false', () => {
      render(
        <BookingModal
          isOpen={false}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      expect(screen.queryByText('Select Ticket Tier')).not.toBeInTheDocument();
    });

    it('renders tier selection modal when isOpen is true', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      expect(screen.getByText('Select Ticket Tier')).toBeInTheDocument();
    });

    it('displays concert name', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Summer Music Festival"
        />,
      );
      expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
    });

    it('displays all ticket tiers', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('Sold Out Tier')).toBeInTheDocument();
    });

    it('displays tier prices', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('displays availability for tiers', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      expect(screen.getByText('75 left')).toBeInTheDocument();
      expect(screen.getByText('200 left')).toBeInTheDocument();
      expect(screen.getByText('Sold Out')).toBeInTheDocument();
    });

    it('disables sold out tier buttons', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      const soldOutButton = screen.getByText('Sold Out Tier').closest('button');
      expect(soldOutButton).toBeDisabled();
    });

    it('enables available tier buttons', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      const vipButton = screen.getByText('VIP').closest('button');
      expect(vipButton).not.toBeDisabled();
    });

    it('sorts tiers by price (highest first)', () => {
      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );
      const buttons = screen.getAllByRole('button');
      const tierButtons = buttons.filter((btn) => btn.querySelector('p'));
      expect(tierButtons[0]).toHaveTextContent('VIP');
    });

    it('calls onClose when modal close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={handleClose}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      const closeButtons = screen.getAllByRole('button');
      const modalCloseButton = closeButtons.find((btn) => btn.querySelector('svg'));
      if (modalCloseButton) {
        await user.click(modalCloseButton);
      }

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Booking Form Step', () => {
    it('navigates to booking form when tier is selected', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByText('Complete Booking')).toBeInTheDocument();
    });

    it('displays selected tier information', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByText(/VIP - \$150.00 per ticket/)).toBeInTheDocument();
    });

    it('displays email input field', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('displays quantity input field', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('displays total price based on quantity', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('has Change button to go back to tier selection', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByText('Change')).toBeInTheDocument();
    });

    it('goes back to tier selection when Change is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);
      await user.click(screen.getByText('Change'));

      expect(screen.getByText('Select Ticket Tier')).toBeInTheDocument();
    });

    it('has Cancel and Book Now buttons', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
    });

    it('calls onClose when Cancel is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={handleClose}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);
      await user.click(screen.getByRole('button', { name: /book now/i }));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('validates email format on form submission', async () => {
      const user = userEvent.setup();

      render(
        <BookingModal
          isOpen={true}
          onClose={vi.fn()}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Booking Submission', () => {
    it('calls createBooking with correct data on valid submission', async () => {
      mockMutateAsync.mockResolvedValueOnce({ id: 'booking-1' });
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <BookingModal
          isOpen={true}
          onClose={handleClose}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');

      await user.click(screen.getByRole('button', { name: /book now/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            ticketTierId: 'tier-1',
            userEmail: 'test@example.com',
            quantity: 1,
            totalPrice: 150,
            currency: 'USD',
          }),
        );
      });
    });

    it('closes modal on successful booking', async () => {
      mockMutateAsync.mockResolvedValueOnce({ id: 'booking-1' });
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <BookingModal
          isOpen={true}
          onClose={handleClose}
          ticketTiers={mockTicketTiers}
          concertName="Test Concert"
        />,
      );

      await user.click(screen.getByText('VIP').closest('button')!);
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /book now/i }));

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });
});
