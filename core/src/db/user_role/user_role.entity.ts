import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RoleDefinition } from '../role_definition/role_definition.entity';

export enum RoleAssignmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Entity()
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  roleId: string;

  @ManyToOne(() => RoleDefinition)
  @JoinColumn({ name: 'roleId' })
  role: RoleDefinition;

  @Column({ nullable: true })
  scope: string; // e.g., 'franchise:123', 'team:456' for scoped roles

  @Column()
  assignedAt: Date;

  @Column({ nullable: true })
  assignedById: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'assignedById' })
  assignedBy: UserEntity;

  @Column({ nullable: true })
  expiresAt: Date; // Optional: for temporary role assignments

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean; // For Franchise Manager, General Manager, League Ops, Admin

  @Column({
    type: 'enum',
    enum: RoleAssignmentStatus,
    default: RoleAssignmentStatus.ACTIVE,
  })
  status: RoleAssignmentStatus;
}
