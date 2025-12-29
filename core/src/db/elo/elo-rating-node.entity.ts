import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    TableInheritance,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';

export enum RatingNodeType {
    INITIAL = 'initial',
    MATCH_OUTPUT = 'match_output',
    COMPACTED = 'compacted',
}

@Entity('elo_rating_node', { schema: 'sprocket' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class EloRatingNodeEntity extends BaseEntity {
    @ManyToOne(() => PlayerEntity)
    @JoinColumn()
    player: PlayerEntityType;

    @ManyToOne(() => GameEntity)
    @JoinColumn()
    game: GameEntityType;

    @Column({ type: 'float' })
    rating: number;

    @Column({ type: 'float', nullable: true })
    uncertainty: number;

    @ManyToOne(() => MatchEntity, { nullable: true })
    @JoinColumn()
    sourceMatch: MatchEntityType;

    @Column({ type: 'boolean', default: false })
    isCompacted: boolean;

    @Column({ type: 'enum', enum: RatingNodeType })
    nodeType: RatingNodeType;
}
