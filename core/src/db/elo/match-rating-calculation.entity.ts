import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { BaseEntity, EloRatingNodeEntity, GameEntity, MatchEntity, PlayerEntity } from '../internal';

@Entity('match_rating_calculation', { schema: 'sprocket' })
export class MatchRatingCalculationEntity extends BaseEntity {
    @ManyToOne(() => MatchEntity)
    @JoinColumn()
    match: MatchEntity;

    @ManyToOne(() => PlayerEntity)
    @JoinColumn()
    player: PlayerEntity;

    @ManyToOne(() => GameEntity)
    @JoinColumn()
    game: GameEntity;

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
