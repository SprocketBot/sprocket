import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { UserEntity } from '../user/user.entity';

export enum FranchiseRoleType {
	MANAGER = 'manager',
	ASSISTANT_MANAGER = 'assistant_manager',
}

@Entity('franchise_role', { schema: 'sprocket' })
export class FranchiseRoleEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity, (franchise) => franchise.roles)
	franchise: FranchiseEntity;

	@ManyToOne(() => UserEntity)
	user: UserEntity;

	@Column({ type: 'enum', enum: FranchiseRoleType })
	roleType: FranchiseRoleType;

	@Column()
	assignedAt: Date;

	@ManyToOne(() => UserEntity)
	assignedBy: UserEntity;

	@Column({ type: 'boolean', default: false })
	requiresApproval: boolean;
}
