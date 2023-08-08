import { ObjectType, Field, Int} from "@nestjs/graphql";
import { Parser } from "@sprocketbot/common";
import { MatchObject } from "./match.object";
import { GameModeObject } from "../../../game/graphql/game-mode.object";

@ObjectType()
export class RoundObject {
    @Field(() => Int)
    id: number;

    @Field(() => Boolean)
    homeWon: boolean;

    @Field(() => String)
    roundStats: unknown;

    @Field(() => String)
    parser: Parser;

    @Field(() => Int)
    parserVersion: number;

    @Field(() => String)
    outputPath: string;

    @Field(() => Boolean, {defaultValue: false})
    isDummy: boolean;

    @Field(() => MatchObject)
    match: MatchObject;

    // @ManyToOne(() => Invalidation, {nullable: true})
    // invalidation?: Invalidation;

    // @OneToMany(() => PlayerStatLine, psl => psl.round)
    // playerStats: PlayerStatLine[];

    // @OneToMany(() => TeamStatLine, tsl => tsl.round)
    // teamStats: TeamStatLine[];

    @Field(() => GameModeObject)
    gameMode: GameModeObject;
}