import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import { UserEntity } from '../user/user.entity';
import { RosterSpotEntity } from '../roster_spot/roster_spot.entity';
import { RosterOfferEntity } from '../roster_offer/roster_offer.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';

@Entity('player', { schema: 'sprocket' })
@Unique(['game', 'user'])
export class PlayerEntity extends BaseEntity {
	@ManyToOne(() => UserEntity)
	user: UserEntity;

	@ManyToOne(() => GameEntity)
	game: GameEntity;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntity;

	@Column()
	salary: string;

	@OneToMany(() => RosterSpotEntity, (rs) => rs.player)
	rosterSpots: RosterSpotEntity[];

	@OneToMany(() => RosterOfferEntity, (ro) => ro.player)
	offers: RosterOfferEntity[];
}
