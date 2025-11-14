import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import { GameEntity } from '../game/game.entity';
import { MatchEntity } from '../match/match.entity';

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
    player: PlayerEntity;

    @ManyToOne(() => GameEntity)
    game: GameEntity;

    @Column()
    skillRating: number;

    @Column()
    queuedAt: Date;

    @Column({ type: 'enum', enum: QueueStatus })
    status: QueueStatus;

    @Column({ nullable: true })
    matchedAt: Date;

    @ManyToOne(() => MatchEntity, { nullable: true })
    match: MatchEntity;
}