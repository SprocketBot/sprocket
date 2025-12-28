import { BaseEntity, PlayerEntity, RoundEntity } from '../internal';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('player_stat', { schema: 'sprocket' })
export class PlayerStatEntity extends BaseEntity {
    @ManyToOne(() => PlayerEntity)
    player: PlayerEntity;

    @ManyToOne(() => RoundEntity, round => round.playerStats)
    round: any;

    @Column({ type: 'jsonb', default: {} })
    stats: Record<string, number>;
}
