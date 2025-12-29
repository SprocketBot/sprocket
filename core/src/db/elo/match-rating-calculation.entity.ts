import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { EloRatingNodeEntity } from './elo-rating-node.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';

@Entity('match_rating_calculation', { schema: 'sprocket' })
export class MatchRatingCalculationEntity extends BaseEntity {
    @ManyToOne(() => MatchEntity)
    @JoinColumn()
    match: MatchEntityType;

    @ManyToOne(() => PlayerEntity)
    @JoinColumn()
    player: PlayerEntityType;

    @ManyToOne(() => GameEntity)
    @JoinColumn()
    game: GameEntityType;

    @ManyToOne(() => EloRatingNodeEntity)
    @JoinColumn()
    inputRating: EloRatingNodeEntity;

    @ManyToOne(() => EloRatingNodeEntity, { nullable: true })
    @JoinColumn()
    outputRating: EloRatingNodeEntity;

    @Column({ type: 'float' })
    ratingChange: number;

    @Column({ type: 'boolean', default: false })
    isInvalidated: boolean;

    @Column({ nullable: true })
    invalidatedAt: Date;

    @Column({ type: 'jsonb', nullable: true })
    calculationMetadata: Record<string, any>;
}
