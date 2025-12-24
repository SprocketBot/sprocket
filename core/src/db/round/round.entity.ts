import { BaseEntity, MatchEntity, PlayerStatEntity, TeamStatEntity } from '../internal';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('round', { schema: 'sprocket' })
export class RoundEntity extends BaseEntity {
    @ManyToOne(() => MatchEntity, match => match.rounds)
    match: MatchEntity;

    @Column()
    roundNumber: number;

    @Column({ default: false })
    isMapCheck: boolean;

    @Column({ type: 'jsonb', default: {} })
    metadata: Record<string, any>;

    @OneToMany(() => PlayerStatEntity, ps => ps.round)
    playerStats: PlayerStatEntity[];

    @OneToMany(() => TeamStatEntity, ts => ts.round)
    teamStats: TeamStatEntity[];
}
