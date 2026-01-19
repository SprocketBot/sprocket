import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'mledb_bridge' })
export class FixtureToFixture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  mleFixtureId: number;

  @Column({ type: 'int' })
  sprocketFixtureId: number;
}
