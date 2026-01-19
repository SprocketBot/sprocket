import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'mledb_bridge' })
export class TeamToFranchise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  team: string;

  @Column({ type: 'int' })
  franchiseId: number;
}
