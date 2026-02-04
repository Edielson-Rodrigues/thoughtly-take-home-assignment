import { faker } from '@faker-js/faker';

import { IIdempotency } from '../idempotency.interface';

export class IdempotencyMock implements IIdempotency {
  public readonly key: string;
  public readonly userEmail: string;
  public readonly path: string;
  public readonly requestPayload: Record<string, any>;
  public readonly responseBody: Record<string, any>;
  public readonly responseStatus: number;
  public readonly createdAt: Date;

  constructor() {
    this.key = faker.string.uuid();
    this.userEmail = faker.internet.email();
    this.path = faker.internet.url();
    this.requestPayload = { data: faker.lorem.sentence() };
    this.responseBody = { data: faker.lorem.sentence() };
    this.responseStatus = faker.number.int({ min: 200, max: 500 });
    this.createdAt = faker.date.past();
  }

  public static getList(length: number = 2): IIdempotency[] {
    return Array.from({ length }, () => new IdempotencyMock());
  }
}
