import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('footers_pkey', ['id'], { unique: true })
@Entity('footers', { schema: 'mledb' })
export class MLE_Footers {
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

  @Column('character varying', { name: 'text', length: 255 })
  text: string;
}
