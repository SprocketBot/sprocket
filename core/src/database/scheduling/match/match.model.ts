import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Invalidation} from "../invalidation/invalidation.model";
import {MatchParent} from "../match_parent";
import {Round} from "../round/round.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Match extends BaseModel {
    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isDummy: boolean;

    @OneToOne(() => Invalidation, {nullable: true})
    @JoinTable()
    @Field(() => Invalidation, {nullable: true})
    invalidation?: Invalidation;

    @OneToMany(() => Round, r => r.match)
    @Field(() => [Round])
    rounds: Round[];

    @JoinColumn()
    @OneToOne(() => MatchParent)
    @Field(() => MatchParent)
    matchParent: MatchParent;
}
