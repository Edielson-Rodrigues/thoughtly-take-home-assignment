import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal, Button, Input, Alert, Badge } from '../../../components/ui';
import { getApiErrorMessages, isApiErrorCode } from '../../../lib/api-error';
import { generateIdempotencyKey, formatCurrency } from '../../../lib/utils';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { bookingFormSchema } from '../schemas/booking.schema';
import { SupportedCurrencies, BookingErrorCodes } from '../types';
import type { BookingFormData } from '../schemas/booking.schema';
import type { TicketTier } from '../../concerts/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketTiers: TicketTier[];
  concertName: string;
}

function getAvailabilityVariant(tier: TicketTier): 'success' | 'warning' | 'danger' {
  const percentAvailable = (tier.availableQuantity / tier.totalQuantity) * 100;
  if (percentAvailable > 50) return 'success';
  if (percentAvailable > 20) return 'warning';
  return 'danger';
}

export function BookingModal({
  isOpen,
  onClose,
  ticketTiers,
  concertName,
}: BookingModalProps) {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userEmail: '',
      quantity: 1,
    },
  });

  const quantity = watch('quantity') || 1;
  const totalPrice = selectedTier ? Number(selectedTier.price) * quantity : 0;

  const handleClose = () => {
    reset();
    setSelectedTier(null);
    setApiErrors([]);
    createBooking.reset();
    onClose();
  };

  const handleBack = () => {
    setSelectedTier(null);
    setApiErrors([]);
    reset();
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedTier) return;
    setApiErrors([]);

    if (data.quantity > selectedTier.availableQuantity) {
      setApiErrors([`Only ${selectedTier.availableQuantity} tickets available`]);
      return;
    }

    try {
      await createBooking.mutateAsync({
        ticketTierId: selectedTier.id,
        userEmail: data.userEmail,
        quantity: data.quantity,
        totalPrice: Number(selectedTier.price) * data.quantity,
        currency: SupportedCurrencies.USD,
        idempotencyKey: generateIdempotencyKey(),
      });

      handleClose();
    } catch (error) {
      if (isApiErrorCode(error, BookingErrorCodes.SOLD_OUT)) {
        setApiErrors(['These tickets just sold out. Please try another tier.']);
      } else if (isApiErrorCode(error, BookingErrorCodes.PAYMENT_FAILED)) {
        setApiErrors(['Payment failed. Please try again.']);
      } else {
        setApiErrors(getApiErrorMessages(error));
      }
    }
  };

  // Step 1: Tier Selection
  if (!selectedTier) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Select Ticket Tier">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">{concertName}</p>
          {ticketTiers
            .slice()
            .sort((a, b) => Number(b.price) - Number(a.price))
            .map((tier) => {
            const isSoldOut = tier.availableQuantity === 0;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => !isSoldOut && setSelectedTier(tier)}
                disabled={isSoldOut}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  isSoldOut
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{tier.name}</p>
                    <p className="text-blue-600 font-semibold">
                      {formatCurrency(Number(tier.price))}
                    </p>
                  </div>
                  <Badge variant={getAvailabilityVariant(tier)}>
                    {tier.availableQuantity > 0
                      ? `${tier.availableQuantity} left`
                      : 'Sold Out'}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }

  // Step 2: Booking Form
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Booking">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Selected Tier Info */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{concertName}</p>
              <p className="text-sm text-gray-600">
                {selectedTier.name} - {formatCurrency(Number(selectedTier.price))} per ticket
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>
        </div>

        {/* Error Alerts */}
        {apiErrors.map((error, index) => (
          <Alert key={index} variant="error">
            {error}
          </Alert>
        ))}

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          error={errors.userEmail?.message}
          {...register('userEmail')}
        />

        {/* Quantity Input */}
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={Math.min(10, selectedTier.availableQuantity)}
          error={errors.quantity?.message}
          {...register('quantity', { valueAsNumber: true })}
        />

        {/* Price Summary */}
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createBooking.isPending}
            className="flex-1"
          >
            Book Now
          </Button>
        </div>
      </form>
    </Modal>
  );
}
