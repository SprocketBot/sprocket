import { ChildEntity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { MatchEntity, UserEntity, SkillGroupEntity, PlayerEntity } from '../internal';

export enum ScrimState {
    PENDING = 'PENDING',
    POPPED = 'POPPED',
    IN_PROGRESS = 'IN_PROGRESS',
    RATIFYING = 'RATIFYING',
    COMPLETE = 'COMPLETE',
    LOCKED = 'LOCKED',
    CANCELLED = 'CANCELLED',
}

@ChildEntity('scrim')
export class ScrimEntity extends MatchEntity {
    @Column()
    authorId: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'authorId' })
    author: UserEntity;

    @Column({ nullable: true })
    organizationId: string;

    @ManyToOne(() => SkillGroupEntity)
    @JoinColumn()
    skillGroup: SkillGroupEntity;

    @Column({ type: 'jsonb', default: {} })
    settings: Record<string, any>;

    @Column({ type: 'enum', enum: ScrimState, default: ScrimState.PENDING })
    state: ScrimState;

    @ManyToMany(() => PlayerEntity)
    @JoinTable()
    players: PlayerEntity[];

    @Column()
    maxPlayers: number;

    @Column({ nullable: true })
    pendingExpiresAt: Date;

    @Column({ nullable: true })
    poppedExpiresAt: Date;
}
