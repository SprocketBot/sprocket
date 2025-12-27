import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('casbin_rule')
export class CasbinRule extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ptype: string;

  @Column({ nullable: true })
  v0: string;

  @Column({ nullable: true })
  v1: string;

  @Column({ nullable: true })
  v2: string;

  @Column({ nullable: true })
  v3: string;

  @Column({ nullable: true })
  v4: string;

  @Column({ nullable: true })
  v5: string;
}
