import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TeamEntity } from '../team/team.entity';
import type { TeamEntity as TeamEntityType } from '../team/team.entity';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';
import { SeasonEntity } from '../season/season.entity';
import type { SeasonEntity as SeasonEntityType } from '../season/season.entity';
import { UserEntity } from '../user/user.entity';
import type { UserEntity as UserEntityType } from '../user/user.entity';

export enum OfferStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	DECLINED = 'declined',
	WITHDRAWN = 'withdrawn',
}

@Entity('roster_offer', { schema: 'sprocket' })
export class RosterOfferEntity extends BaseEntity {
	@ManyToOne(() => TeamEntity)
	team: TeamEntityType;

	@ManyToOne(() => PlayerEntity)
	player: PlayerEntityType;

	@ManyToOne(() => SeasonEntity, { nullable: true })
	season: SeasonEntityType;

	@Column({ type: 'enum', enum: OfferStatus })
	status: OfferStatus;

	@ManyToOne(() => UserEntity)
	offeredBy: UserEntityType;

	@Column()
	offeredAt: Date;

	@Column({ nullable: true })
	respondedAt: Date;

	@Column({ type: 'text', nullable: true })
	message: string;
}
