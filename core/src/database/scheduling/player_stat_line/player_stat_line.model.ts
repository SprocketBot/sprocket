import {Field, ObjectType} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import {
    Column, Entity, ManyToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Round} from "../round/round.model";
import {TeamStatLine} from "../team_stat_line/team_stat_line.model";
@Entity({ schema: "sprocket" })
@ObjectType()
export class PlayerStatLine extends BaseModel {
    @Column({
        type: "jsonb",
    })
    @Field(() => GraphQLJSON)
    stats: unknown;

    @ManyToOne(() => Round)
    @Field(() => Round)
    round: Round;

    @Column()
    @Field(() => Boolean)
    isHome: boolean;

    @ManyToOne(() => TeamStatLine)
    @Field(() => TeamStatLine)
    teamStats: TeamStatLine;

}
