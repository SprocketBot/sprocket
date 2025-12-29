import { BaseEntity } from '../base.entity';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';
import { RoundEntity } from '../round/round.entity';
import type { RoundEntity as RoundEntityType } from '../round/round.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('player_stat', { schema: 'sprocket' })
export class PlayerStatEntity extends BaseEntity {
    @ManyToOne(() => PlayerEntity)
    player: PlayerEntityType;

    @ManyToOne(() => RoundEntity, round => round.playerStats)
    round: any;

    @Column({ type: 'jsonb', default: {} })
    stats: Record<string, number>;
}
