import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import { GameModeEntity } from '../game_mode/game_mode.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import { GameEntity } from '../game/game.entity';

export enum ScrimState {
    PENDING = 'PENDING',
    POPPED = 'POPPED',
    IN_PROGRESS = 'IN_PROGRESS',
    RATIFYING = 'RATIFYING',
    COMPLETE = 'COMPLETE',
    LOCKED = 'LOCKED',
    CANCELLED = 'CANCELLED',
}

@Entity('scrim', { schema: 'sprocket' })
export class ScrimEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ScrimState })
    state: ScrimState;

    @Column()
    authorId: string;

    @ManyToOne(() => GameEntity)
    game: GameEntity;

    @ManyToOne(() => GameModeEntity)
    gameMode: GameModeEntity;

    @ManyToOne(() => SkillGroupEntity)
    skillGroup: SkillGroupEntity;

    @ManyToMany(() => PlayerEntity)
    @JoinTable()
    players: PlayerEntity[];

    @Column()
    maxPlayers: number;

    @Column('jsonb')
    settings: Record<string, any>;

    @Column()
    createdAt: Date;

    @Column({ nullable: true })
    startedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    pendingExpiresAt: Date;

    @Column({ nullable: true })
    poppedExpiresAt: Date;
}