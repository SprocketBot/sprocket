import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

export enum SeasonStatus {
	UPCOMING = 'upcoming',
	ACTIVE = 'active',
	COMPLETED = 'completed',
}

@Entity('season', { schema: 'sprocket' })
export class SeasonEntity extends BaseEntity {
	@Column()
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ type: 'int' })
	number: number;

	@Column()
	startDate: Date;

	@Column()
	endDate: Date;

	@Column({ type: 'enum', enum: SeasonStatus, default: SeasonStatus.UPCOMING })
	status: SeasonStatus;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'boolean', default: false })
	isOffseason: boolean;
}
