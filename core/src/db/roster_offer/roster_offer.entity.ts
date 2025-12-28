import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TeamEntity } from '../team/team.entity';
import { PlayerEntity } from '../player/player.entity';
import { SeasonEntity } from '../season/season.entity';
import { UserEntity } from '../user/user.entity';

export enum OfferStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	DECLINED = 'declined',
	WITHDRAWN = 'withdrawn',
}

@Entity('roster_offer', { schema: 'sprocket' })
export class RosterOfferEntity extends BaseEntity {
	@ManyToOne(() => TeamEntity)
	team: TeamEntity;

	@ManyToOne(() => PlayerEntity)
	player: PlayerEntity;

	@ManyToOne(() => SeasonEntity, { nullable: true })
	season: SeasonEntity;

	@Column({ type: 'enum', enum: OfferStatus })
	status: OfferStatus;

	@ManyToOne(() => UserEntity)
	offeredBy: UserEntity;

	@Column()
	offeredAt: Date;

	@Column({ nullable: true })
	respondedAt: Date;

	@Column({ type: 'text', nullable: true })
	message: string;
}
