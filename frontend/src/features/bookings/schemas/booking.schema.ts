import { z } from 'zod';

/**
 * Zod schema for booking form validation
 * Matches backend validation rules
 * @see backend/src/presentation/http/bookings/dtos/create-booking.dto.ts
 */
export const bookingFormSchema = z.object({
  userEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum 10 tickets per booking'),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
