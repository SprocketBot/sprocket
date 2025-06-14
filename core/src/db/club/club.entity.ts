import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity, GameEntity, FranchiseEntity, TeamEntity } from '../internal';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@ManyToOne(() => FranchiseEntity)
	franchise: FranchiseEntity;

	@ManyToOne(() => GameEntity)
	game: GameEntity;

	@OneToMany(() => TeamEntity, (t) => t.club)
	teams: TeamEntity[];
}
