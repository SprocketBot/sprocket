import {Field, ObjectType} from "@nestjs/graphql";
import {Parser} from "@sprocketbot/common";
import GraphQLJSON from "graphql-type-json";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {GameMode} from "../../game";
import {Invalidation} from "../invalidation/invalidation.model";
import {Match} from "../match/match.model";
import {PlayerStatLine} from "../player_stat_line";
import {TeamStatLine} from "../team_stat_line";

@Entity({schema: "sprocket"})
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

    @Column({type: "enum", enum: Parser})
    @Field(() => Parser)
    parser: Parser;

    @Column()
    @Field()
    parserVersion: number;

    @Column()
    @Field()
    outputPath: string;

    @Column({default: false})
    @Field(() => Boolean, {defaultValue: false})
    isDummy: boolean;

    @ManyToOne(() => Match)
    @Field(() => Match)
    match: Match;

    @ManyToOne(() => Invalidation, {nullable: true})
    @Field(() => Invalidation, {nullable: true})
    invalidation?: Invalidation;

    @OneToMany(() => PlayerStatLine, psl => psl.round)
    @Field(() => PlayerStatLine)
    playerStats: PlayerStatLine[];

    @OneToMany(() => TeamStatLine, tsl => tsl.round)
    @Field(() => TeamStatLine)
    teamStats: TeamStatLine[];

    @ManyToOne(() => GameMode)
    @Field(() => GameMode)
    gameMode: GameMode;
}
