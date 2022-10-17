import {Field, InputType, Int, ObjectType} from "@nestjs/graphql";
import type {ScrimSettings as IScrimSettings} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";

@ObjectType()
export class ScrimSettings implements IScrimSettings {
    @Field(() => Int)
    teamSize: number;

    @Field(() => Int)
    teamCount: number;

    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;

    @Field(() => Boolean)
    observable: boolean;

    @Field(() => Int)
    checkinTimeout: number;
}

@InputType()
export class ScrimSettingsInput {
    @Field(() => ScrimMode)
    mode: ScrimMode;

    @Field(() => Boolean)
    competitive: boolean;

    @Field(() => Boolean)
    observable: boolean;
}
