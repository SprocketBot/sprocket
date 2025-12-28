import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TeamEntity } from '../team/team.entity';
import { PlayerEntity } from '../player/player.entity';
import { SeasonEntity } from '../season/season.entity';

export enum RosterStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
}

@Entity('roster_spot', { schema: 'sprocket' })
export class RosterSpotEntity extends BaseEntity {
	@ManyToOne(() => TeamEntity, (team) => team.rosterSpots)
	team: TeamEntity;

	@ManyToOne(() => PlayerEntity)
	player: PlayerEntity;

	@ManyToOne(() => SeasonEntity, { nullable: true })
	season: SeasonEntity;

	@Column({ type: 'enum', enum: RosterStatus })
	status: RosterStatus;

	@Column()
	joinedAt: Date;

	@Column({ nullable: true })
	leftAt: Date;

	@Column({ type: 'jsonb', nullable: true })
	metadata: Record<string, any>;
}
