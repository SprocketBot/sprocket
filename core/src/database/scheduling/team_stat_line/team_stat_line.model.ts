import {Field, ObjectType} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Team} from "../../franchise/team";
import {PlayerStatLine} from "../player_stat_line";
import {Round} from "../round";
@Entity({ schema: "sprocket" })
@ObjectType()
export class TeamStatLine extends BaseModel {
    @Column({
        type: "jsonb",
    })
    @Field(() => GraphQLJSON)
    stats: unknown;

    @Column()
    @Field(() => String)
    teamName: string;

    @ManyToOne(() => Team, {nullable: true})
    @Field(() => Team, {nullable: true})
    team?: Team;

    @ManyToOne(() => Round)
    @Field(() => Round)
    round: Round;

    @OneToMany(() => PlayerStatLine, psl => psl.teamStats)
    @Field(() => [PlayerStatLine])
    playerStats: PlayerStatLine[];
}
