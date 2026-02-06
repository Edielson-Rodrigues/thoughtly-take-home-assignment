import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { TicketTierEntity } from '../ticket-tier/ticket-tier.entity';

import { IConcert } from './concert.interface';

@Entity('concerts')
export class ConcertEntity implements IConcert {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: false })
  description: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: false })
  location: string;

  @Column({ name: 'date', type: 'timestamptz', nullable: false })
  date: Date;

  @OneToMany(() => TicketTierEntity, (tier) => tier.concert)
  ticketTiers?: TicketTierEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt?: Date;
}
