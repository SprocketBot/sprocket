import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RoleDefinition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'player', 'captain', 'general_manager', etc.

  @Column()
  displayName: string; // 'Team Captain', 'General Manager', etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  hierarchy: number; // For role inheritance (higher = more permissions)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isRestricted: boolean; // Requires approval to assign

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // UI hints, icons, etc.
}
