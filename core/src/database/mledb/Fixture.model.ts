import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MLE_Match } from './Match.model';
import { MLE_Series } from './Series.model';

@Index('fixture_home_name_away_name_match_id_unique', ['awayName', 'homeName', 'matchId'], {
  unique: true,
})
@Index('fixture_pkey', ['id'], { unique: true })
@Entity('fixture', { schema: 'mledb' })
export class MLE_Fixture {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', {
    name: 'created_by',
    length: 255,
    default: () => "'Unknown'",
  })
  createdBy: string;

  @Column('timestamp without time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @Column('character varying', {
    name: 'updated_by',
    length: 255,
    default: () => "'Unknown'",
  })
  updatedBy: string;

  @Column('timestamp without time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt: Date;

  @Column('character varying', { name: 'home_name', length: 255 })
  homeName: string;

  @Column('character varying', { name: 'away_name', length: 255 })
  awayName: string;

  @Column('integer', { name: 'match_id' })
  matchId: number;

  @Column('character varying', {
    name: 'channel_id',
    length: 255,
    default: () => "''",
  })
  channelId: string;

  @ManyToOne(() => MLE_Match, match => match.fixtures, { onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'match_id', referencedColumnName: 'id' }])
  match: MLE_Match;

  @OneToMany(() => MLE_Series, series => series.fixture)
  series: MLE_Series[];
}
