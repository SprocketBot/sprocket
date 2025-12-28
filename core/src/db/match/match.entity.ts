import { Column, Entity, JoinColumn, ManyToOne, OneToMany, TableInheritance, type DeepPartial } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { GameEntity } from '../game/game.entity';
import { GameModeEntity } from '../game_mode/game_mode.entity';
import { RoundEntity } from '../round/round.entity';

export enum MatchStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('match', { schema: 'sprocket' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class MatchEntity extends BaseEntity {
    @ManyToOne(() => GameEntity)
    @JoinColumn()
    game: GameEntity;

    @ManyToOne(() => GameModeEntity)
    @JoinColumn()
    gameMode: GameModeEntity;

    @OneToMany(() => RoundEntity, round => round.match)
    rounds: RoundEntity[];

    @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.PENDING })
    status: MatchStatus;

    @Column({ nullable: true })
    startTime: Date;

    @Column({ nullable: true })
    endTime: Date;

    constructor(params?: DeepPartial<MatchEntity>) {
        super();
        if (params) {
            Object.assign(this, params);
        }
    }
}
