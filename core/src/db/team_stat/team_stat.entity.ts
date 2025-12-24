import { BaseEntity, RoundEntity, TeamEntity } from '../internal';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('team_stat', { schema: 'sprocket' })
export class TeamStatEntity extends BaseEntity {
    @ManyToOne(() => TeamEntity, { nullable: true })
    team?: TeamEntity;

    @ManyToOne(() => RoundEntity, round => round.teamStats)
    round: RoundEntity;

    @Column({ type: 'jsonb', default: {} })
    stats: Record<string, number>;
}
