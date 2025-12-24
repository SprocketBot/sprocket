import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { BaseEntity, GameEntity } from '../internal';

export enum RatingSystem {
    ELO = 'elo',
    GLICKO = 'glicko',
    TRUESKILL = 'trueskill',
}

export interface RatingParameters {
    kFactor?: number;
    initialRating?: number;
    ratingDeviation?: number;
    volatility?: number;
    mu?: number;
    sigma?: number;
    beta?: number;
    tau?: number;
    customFormula?: string;
}

@Entity('game_rating_config', { schema: 'sprocket' })
export class GameRatingConfigEntity extends BaseEntity {
    @ManyToOne(() => GameEntity)
    @JoinColumn()
    @Index()
    game: GameEntity;

    @Column({ type: 'enum', enum: RatingSystem })
    system: RatingSystem;

    @Column({ type: 'jsonb' })
    parameters: RatingParameters;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column()
    effectiveFrom: Date;
}
