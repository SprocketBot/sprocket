import {Field, InputType, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import type {ScrimSettings} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";

registerEnumType(ScrimMode, {name: "ScrimMode"});

@ObjectType()
export class ScrimSettingsObject implements ScrimSettings {
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
