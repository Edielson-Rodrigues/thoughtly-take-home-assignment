import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('idempotencies')
export class Idempotency {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  key: string;

  @Column()
  user_email: string;

  @Column()
  path: string;

  @Column('jsonb', { nullable: true })
  request_payload: object;

  @Column('jsonb', { nullable: true })
  response_body: object;

  @Column('int')
  response_status: number;

  @CreateDateColumn()
  created_at: Date;
}
