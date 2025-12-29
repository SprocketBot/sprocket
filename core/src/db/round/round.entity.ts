import { BaseEntity } from '../base.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';
import { PlayerStatEntity } from '../player_stat/player_stat.entity';
import type { PlayerStatEntity as PlayerStatEntityType } from '../player_stat/player_stat.entity';
import { TeamStatEntity } from '../team_stat/team_stat.entity';
import type { TeamStatEntity as TeamStatEntityType } from '../team_stat/team_stat.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('round', { schema: 'sprocket' })
export class RoundEntity extends BaseEntity {
    @ManyToOne(() => MatchEntity, match => match.rounds)
    match: any;

    @Column()
    roundNumber: number;

    @Column({ default: false })
    isMapCheck: boolean;

    @Column({ type: 'jsonb', default: {} })
    metadata: Record<string, any>;

    @OneToMany(() => PlayerStatEntity, ps => ps.round)
    playerStats: PlayerStatEntityType[];

    @OneToMany(() => TeamStatEntity, ts => ts.round)
    teamStats: TeamStatEntityType[];
}
