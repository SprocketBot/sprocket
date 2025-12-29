import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import type { FranchiseEntity as FranchiseEntityType } from '../franchise/franchise.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export enum FranchiseRoleType {
	MANAGER = 'manager',
	ASSISTANT_MANAGER = 'assistant_manager',
}

@Entity('franchise_role', { schema: 'sprocket' })
export class FranchiseRoleEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity, (franchise) => franchise.roles)
	franchise: FranchiseEntityType;

	@ManyToOne(() => UserEntity)
	user: UserEntityType;

	@Column({ type: 'enum', enum: FranchiseRoleType })
	roleType: FranchiseRoleType;

	@Column()
	assignedAt: Date;

	@ManyToOne(() => UserEntity)
	assignedBy: UserEntityType;

	@Column({ type: 'boolean', default: false })
	requiresApproval: boolean;
}
