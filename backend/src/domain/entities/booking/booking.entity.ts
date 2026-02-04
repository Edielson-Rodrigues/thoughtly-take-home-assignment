import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { TicketTier } from '../ticket-tier/ticket-tier.entity';

import { IBooking } from './booking.interface';

@Entity('bookings')
@Index('idx__bookings__user_email', ['user_email'])
@Index('idx__bookings__tier_id', ['tier_id'])
export class BookingEntity implements IBooking {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({
    name: 'user_email',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  userEmail: string;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalPrice: number;

  @ManyToOne(() => TicketTier)
  @JoinColumn({ name: 'tier_id' })
  tier: TicketTier;

  @Column({ name: 'tier_id', type: 'uuid', nullable: false })
  tierId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;
}
