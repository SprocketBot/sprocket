import type {MatchSubmissionStatus} from "";

import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {GameSkillGroup} from "";
import {GameMode} from "";
import {Invalidation} from "";
import {MatchParent} from "";
import {Round} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Match extends BaseEntity {
    @Column({default: false})
    isDummy: boolean;

    @OneToOne(() => Invalidation, {nullable: true})
    @JoinColumn()
    invalidation?: Invalidation;

    // TODO: Nullable, so that we can save cross-group matches?
    @ManyToOne(() => GameSkillGroup)
    @JoinColumn()
    skillGroup: GameSkillGroup;

    @Column()
    skillGroupId: number;

    @OneToMany(() => Round, r => r.match)
    rounds: Round[];

    @OneToOne(() => MatchParent, mp => mp.match)
    @JoinColumn()
    matchParent: MatchParent;

    @Column({nullable: true, unique: true})
    submissionId?: string;

    submissionStatus: MatchSubmissionStatus;

    canSubmit: boolean;

    canRatify: boolean;

    /**
     * This has been made nullable in case future use-cases involve multiple game modes in a single match.
     * For Rocket League (and pre-mledb transition), we probably want to always have this; hence the non-nullable type
     */
    @ManyToOne(() => GameMode, {nullable: true})
    gameMode: GameMode;
}
