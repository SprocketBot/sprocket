import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { GameEntity } from '../game/game.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { TeamEntity } from '../team/team.entity';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity)
	franchise: Promise<FranchiseEntity>;
	@Column()
	franchiseId: string;

	@OneToOne(() => GameEntity)
	game: Promise<GameEntity>;
	@Column()
	gameId: string;

	@OneToMany(() => TeamEntity, (t) => t.club)
	team: Promise<TeamEntity>;
}
