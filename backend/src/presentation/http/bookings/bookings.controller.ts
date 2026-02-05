import { BookingService } from '@app/services/bookings/bookings.service';

import { CreateBookingBodyDTO, CreateBookingResponseDTO } from './dtos/create-booking.dto';

export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  async create(body: CreateBookingBodyDTO, path: string): Promise<CreateBookingResponseDTO> {
    const booking = await this.bookingService.create(body, path);
    return { booking };
  }
}
