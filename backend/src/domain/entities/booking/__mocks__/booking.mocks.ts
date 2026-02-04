import { faker } from '@faker-js/faker';

import { IBooking } from '../booking.interface';

export class BookingMock implements IBooking {
  public readonly id: string;
  public readonly userEmail: string;
  public readonly quantity: number;
  public readonly totalPrice: number;
  public readonly tierId: string;
  public readonly createdAt: Date;

  constructor() {
    this.id = faker.string.uuid();
    this.userEmail = faker.internet.email();
    this.quantity = faker.number.int({ min: 1, max: 10 });
    this.totalPrice = faker.number.float({
      min: 10,
      max: 1000,
    });
    this.tierId = faker.string.uuid();
    this.createdAt = faker.date.past();
  }

  public static getList(length: number = 2): IBooking[] {
    return Array.from({ length }, () => new BookingMock());
  }
}
