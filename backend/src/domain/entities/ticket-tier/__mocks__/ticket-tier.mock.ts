import { faker } from '@faker-js/faker';

import { ITicketTier } from '../ticket-tier.interface';

export class TicketTierMock implements ITicketTier {
  public readonly id: string;
  public readonly name: string;
  public readonly price: number;
  public readonly totalQuantity: number;
  public readonly availableQuantity: number;
  public readonly concertId: string;
  public readonly createdAt: Date;

  constructor() {
    this.id = faker.string.uuid();
    this.name = faker.lorem.words(2);
    this.price = faker.number.float({ min: 10, max: 500 });
    this.totalQuantity = faker.number.int({ min: 50, max: 200 });
    this.availableQuantity =
      this.totalQuantity - faker.number.int({ min: 0, max: 50 });
    this.concertId = faker.string.uuid();
    this.createdAt = faker.date.past();
  }

  public static getList(length: number = 2): ITicketTier[] {
    return Array.from({ length }, () => new TicketTierMock());
  }
}
