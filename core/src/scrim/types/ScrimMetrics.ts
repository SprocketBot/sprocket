import {
    Field, Int, ObjectType,
} from "@nestjs/graphql";
import type {ScrimMetrics as IScrimMetrics} from "@sprocketbot/common";

@ObjectType()
export class ScrimMetrics implements IScrimMetrics {
    @Field(() => Int)
    pendingScrims: number;

    @Field(() => Int)
    playersQueued: number;

    @Field(() => Int)
    playersScrimming: number;

    @Field(() => Int)
    totalPlayers: number;

    @Field(() => Int)
    totalScrims: number;

    @Field(() => Int)
    completedScrims?: number;

    @Field(() => Int)
    previousCompletedScrims?: number;

}
