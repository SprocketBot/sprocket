import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import type { FranchiseEntity as FranchiseEntityType } from '../franchise/franchise.entity';
import { TeamEntity } from '../team/team.entity';
import type { TeamEntity as TeamEntityType } from '../team/team.entity';
import { ClubRoleEntity } from '../club_role/club_role.entity';
import type { ClubRoleEntity as ClubRoleEntityType } from '../club_role/club_role.entity';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity, (f) => f.clubs)
	franchise: FranchiseEntityType;

	@ManyToOne(() => GameEntity)
	game: GameEntityType;

	@Column()
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@OneToMany(() => TeamEntity, (t) => t.club, { onDelete: 'RESTRICT' })
	teams: TeamEntityType[];

	@OneToMany(() => ClubRoleEntity, (r) => r.club)
	roles: ClubRoleEntityType[];
}
