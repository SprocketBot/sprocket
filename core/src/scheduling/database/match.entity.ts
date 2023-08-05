import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {GameSkillGroup} from "../../franchise/database/game-skill-group.entity";
import {GameMode} from "../../game/database/game-mode.entity";
import {BaseEntity} from "../../types/base-entity";
import {Invalidation} from "./invalidation.entity";
import {MatchParent} from "./match-parent.entity";
import {Round} from "./round.entity";
import { MatchSubmissionStatus } from "../match/match.resolver.old";

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
