import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ClubEntity } from '../club/club.entity';
import type { ClubEntity as ClubEntityType } from '../club/club.entity';
import { FranchiseRoleEntity } from '../franchise_role/franchise_role.entity';
import type { FranchiseRoleEntity as FranchiseRoleEntityType } from '../franchise_role/franchise_role.entity';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ nullable: true })
	logoUrl: string;

	@Column({ nullable: true })
	primaryColor: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@OneToMany(() => ClubEntity, (c) => c.franchise, { onDelete: 'RESTRICT' })
	clubs: ClubEntityType[];

	@OneToMany(() => FranchiseRoleEntity, (r) => r.franchise)
	roles: FranchiseRoleEntityType[];
}
