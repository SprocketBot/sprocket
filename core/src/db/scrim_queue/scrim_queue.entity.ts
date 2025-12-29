import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';
import { GameEntity } from '../game/game.entity';
import type { GameEntity as GameEntityType } from '../game/game.entity';
import { MatchEntity } from '../match/match.entity';
import type { MatchEntity as MatchEntityType } from '../match/match.entity';

export enum QueueStatus {
    QUEUED = 'QUEUED',
    MATCHED = 'MATCHED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

@Entity('scrim_queue', { schema: 'sprocket' })
export class ScrimQueueEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PlayerEntity)
    player: PlayerEntityType;

    @ManyToOne(() => GameEntity)
    game: GameEntityType;

    @Column()
    skillRating: number;

    @Column()
    queuedAt: Date;

    @Column({ type: 'enum', enum: QueueStatus })
    status: QueueStatus;

    @Column({ nullable: true })
    matchedAt: Date;

    @ManyToOne(() => MatchEntity, { nullable: true })
    match: MatchEntityType;
}