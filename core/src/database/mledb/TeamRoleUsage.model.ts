import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from './enums/Role.enum';
import { MLE_Series } from './Series.model';

@Index('team_role_usage_pkey', ['id'], { unique: true })
@Entity('team_role_usage', { schema: 'mledb' })
export class MLE_TeamRoleUsage {
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

  @Column('character varying', { name: 'team_name', length: 255 })
  teamName: string;

  @Column('text', { name: 'league' })
  league: string;

  @Column('text', { name: 'role' })
  role: Role;

  @ManyToOne(() => MLE_Series, series => series.teamRoleUsages, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'series_id', referencedColumnName: 'id' }])
  series: MLE_Series;
}
