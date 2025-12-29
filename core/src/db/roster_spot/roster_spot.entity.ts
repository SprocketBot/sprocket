import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TeamEntity } from '../team/team.entity';
import type { TeamEntity as TeamEntityType } from '../team/team.entity';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';
import { SeasonEntity } from '../season/season.entity';
import type { SeasonEntity as SeasonEntityType } from '../season/season.entity';

export enum RosterStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
}

@Entity('roster_spot', { schema: 'sprocket' })
export class RosterSpotEntity extends BaseEntity {
	@ManyToOne(() => TeamEntity, (team) => team.rosterSpots)
	team: TeamEntityType;

	@ManyToOne(() => PlayerEntity)
	player: PlayerEntityType;

	@ManyToOne(() => SeasonEntity, { nullable: true })
	season: SeasonEntityType;

	@Column({ type: 'enum', enum: RosterStatus })
	status: RosterStatus;

	@Column()
	joinedAt: Date;

	@Column({ nullable: true })
	leftAt: Date;

	@Column({ type: 'jsonb', nullable: true })
	metadata: Record<string, any>;
}
