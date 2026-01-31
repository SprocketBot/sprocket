import {Field, ObjectType} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {PlayerStatLine} from "$db/scheduling/player_stat_line/player_stat_line.model";
import {Round} from "$db/scheduling/round/round.model";

import {BaseModel} from "../../base-model";
import {Team} from "../../franchise/team";

@Entity({schema: "sprocket"})
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
