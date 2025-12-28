import { BaseEntity } from '../base.entity';
import { RoundEntity } from '../round/round.entity';
import { TeamEntity } from '../team/team.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('team_stat', { schema: 'sprocket' })
export class TeamStatEntity extends BaseEntity {
    @ManyToOne(() => TeamEntity, { nullable: true })
    team?: TeamEntity;

    @ManyToOne(() => RoundEntity, round => round.teamStats)
    round: any;

    @Column({ type: 'jsonb', default: {} })
    stats: Record<string, number>;
}
