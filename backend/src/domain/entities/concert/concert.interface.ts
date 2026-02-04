import { TicketTierEntity } from '../ticket-tier/ticket-tier.entity';

export interface IConcert {
  id: string;
  name: string;
  description: string;
  location: string;
  date: Date;
  ticketTiers?: TicketTierEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export type ConcertRelations = Record<'ticketTiers', boolean>;
export type CreateConcert = Omit<IConcert, 'id' | 'createdAt' | 'updatedAt'>;
