import {
    Field, InputType, Int, ObjectType,
} from "@nestjs/graphql";
import type {ScrimSettings as IScrimSettings} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";

@ObjectType()
export class ScrimSettings implements IScrimSettings {
    @Field(() => Int)
    teamCount: number;

    @Field(() => Int)
    teamSize: number;

    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;

    @Field(() => Int)
    skillGroupId: number;

    @Field(() => Int)
    checkinTimeout: number;
}

@InputType()
export class ScrimSettingsInput {
    @Field(() => Int)
    gameModeId: number;

    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;
}
