import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameSkillGroup} from "../../franchise";
import {Invalidation} from "../invalidation/invalidation.model";
import {MatchParent} from "../match_parent";
import {Round} from "../round/round.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Match extends BaseModel {
    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isDummy: boolean;

    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isNcp: boolean;

    @OneToOne(() => Invalidation, {nullable: true})
    @JoinTable()
    @Field(() => Invalidation, {nullable: true})
    invalidation?: Invalidation;

    // TODO: Nullable, so that we can save cross-group matches?
    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @OneToMany(() => Round, r => r.match)
    @Field(() => [Round])
    rounds: Round[];

    @OneToOne(() => MatchParent, mp => mp.match)
    @JoinColumn()
    @Field(() => MatchParent)
    matchParent: MatchParent;

    @Column({nullable: true, unique: true})
    @Field(() => String)
    submissionId: string;

    @Field(() => Boolean)
    submitted: boolean;
}
