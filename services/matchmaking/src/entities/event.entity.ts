import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('events_matchmaking')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  event_type: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'boolean', default: false })
  handled: boolean;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
