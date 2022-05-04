import {Field, ObjectType} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Invalidation} from "../invalidation/invalidation.model";
import {Match} from "../match/match.model";
@Entity({ schema: "sprocket" })
@ObjectType()
export class Round extends BaseModel {
    @Column()
    @Field(() => Boolean)
    homeWon: boolean;

    @Column({
        type: "jsonb",
    })
    @Field(() => GraphQLJSON)
    roundStats: unknown;

    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isDummy: boolean;

    @ManyToOne(() => Match)
    @Field(() => Match)
    match: Match;

    @ManyToOne(() => Invalidation, {nullable: true})
    @Field(() => Invalidation, {nullable: true})
    invalidation?: Invalidation;
}
