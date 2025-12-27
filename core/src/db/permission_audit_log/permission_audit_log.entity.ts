import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export enum AuditAction {
  GRANT_ROLE = 'grant_role',
  REVOKE_ROLE = 'revoke_role',
  ADD_POLICY = 'add_policy',
  REMOVE_POLICY = 'remove_policy',
  APPROVE_ROLE = 'approve_role',
  REJECT_ROLE = 'reject_role',
}

@Entity()
export class PermissionAuditLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  actorId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'actorId' })
  actor: UserEntity; // Who made the change

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction; // GRANT_ROLE, REVOKE_ROLE, ADD_POLICY, REMOVE_POLICY

  @Column({ type: 'jsonb' })
  details: Record<string, any>; // What changed

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  reason: string; // Optional justification
}
