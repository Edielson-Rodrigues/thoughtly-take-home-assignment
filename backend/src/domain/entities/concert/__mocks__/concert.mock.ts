import { faker } from '@faker-js/faker';

import { IConcert } from '../concert.interface';

export class ConcertMock implements IConcert {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly location: string;
  public readonly date: Date;
  public readonly createdAt: Date;
  public readonly updatedAt?: Date;

  constructor() {
    this.id = faker.string.uuid();
    this.name = faker.lorem.words(3);
    this.description = faker.lorem.sentence();
    this.location = faker.location.city();
    this.date = faker.date.future();
    this.createdAt = faker.date.past();
    this.updatedAt = faker.date.recent();
  }

  public static getList(length: number = 2): IConcert[] {
    return Array.from({ length }, () => new ConcertMock());
  }
}
