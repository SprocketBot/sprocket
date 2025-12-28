import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { TeamEntity } from '../team/team.entity';
import { ClubRoleEntity } from '../club_role/club_role.entity';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity, (f) => f.clubs)
	franchise: FranchiseEntity;

	@ManyToOne(() => GameEntity)
	game: GameEntity;

	@Column()
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@OneToMany(() => TeamEntity, (t) => t.club)
	teams: TeamEntity[];

	@OneToMany(() => ClubRoleEntity, (r) => r.club)
	roles: ClubRoleEntity[];
}
