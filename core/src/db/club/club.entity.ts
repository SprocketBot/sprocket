import { BaseEntity } from '../base.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { GameEntity } from '../game/game.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { TeamEntity } from '../team/team.entity';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity)
	franchise: FranchiseEntity;

	@OneToOne(() => GameEntity)
	@JoinColumn()
	game: GameEntity;

	@OneToMany(() => TeamEntity, (t) => t.club)
	teams: TeamEntity[];
}
