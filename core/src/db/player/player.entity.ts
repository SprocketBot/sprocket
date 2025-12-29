import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import type { SkillGroupEntity as SkillGroupEntityType } from '../skill_group/skill_group.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';
import { RosterSpotEntity } from '../roster_spot/roster_spot.entity';
import type { RosterSpotEntity as RosterSpotEntityType } from '../roster_spot/roster_spot.entity';
import { RosterOfferEntity } from '../roster_offer/roster_offer.entity';
import type { RosterOfferEntity as RosterOfferEntityType } from '../roster_offer/roster_offer.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';

@Entity('player', { schema: 'sprocket' })
@Unique(['game', 'user'])
export class PlayerEntity extends BaseEntity {
	@ManyToOne(() => UserEntity)
	user: UserEntityType;

	@ManyToOne(() => GameEntity)
	game: GameEntityType;

	@ManyToOne(() => SkillGroupEntity)
	skillGroup: SkillGroupEntityType;

	@Column()
	salary: string;

	@OneToMany(() => RosterSpotEntity, (rs) => rs.player)
	rosterSpots: RosterSpotEntityType[];

	@OneToMany(() => RosterOfferEntity, (ro) => ro.player)
	offers: RosterOfferEntityType[];
}
