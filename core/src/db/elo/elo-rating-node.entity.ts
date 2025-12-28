import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    TableInheritance,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import { MatchEntity } from '../match/match.entity';
import { PlayerEntity } from '../player/player.entity';

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
    player: PlayerEntity;

    @ManyToOne(() => GameEntity)
    @JoinColumn()
    game: GameEntity;

    @Column({ type: 'float' })
    rating: number;

    @Column({ type: 'float', nullable: true })
    uncertainty: number;

    @ManyToOne(() => MatchEntity, { nullable: true })
    @JoinColumn()
    sourceMatch: MatchEntity;

    @Column({ type: 'boolean', default: false })
    isCompacted: boolean;

    @Column({ type: 'enum', enum: RatingNodeType })
    nodeType: RatingNodeType;
}
