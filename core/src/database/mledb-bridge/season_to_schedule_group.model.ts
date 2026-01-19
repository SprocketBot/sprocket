import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'mledb_bridge' })
export class SeasonToScheduleGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  seasonNumber: number;

  @Column({ type: 'int' })
  scheduleGroupId: number;
}
