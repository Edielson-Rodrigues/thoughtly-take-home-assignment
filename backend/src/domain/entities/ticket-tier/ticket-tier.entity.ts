import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { BookingEntity } from '../booking/booking.entity';
import { ConcertEntity } from '../concert/concert.entity';

import { ITicketTier } from './ticket-tier.interface';

@Entity('ticket_tiers')
@Index('idx__ticket_tiers__concert_id', ['concertId'])
export class TicketTier implements ITicketTier {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({ name: 'total_quantity', type: 'int', nullable: false })
  totalQuantity: number;

  @Column({ name: 'available_quantity', type: 'int', nullable: false })
  availableQuantity: number;

  @ManyToOne(() => ConcertEntity, (concert) => concert.ticketTiers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'concert_id' })
  concert?: ConcertEntity;

  @Column({ name: 'concert_id', type: 'uuid', nullable: false })
  concertId: string;

  @OneToMany(() => BookingEntity, (booking) => booking.tier)
  bookings?: BookingEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;
}
