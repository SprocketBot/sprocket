import {Field, Int, ObjectType} from "@nestjs/graphql";
import type {ScrimPlayer} from "@sprocketbot/common";

import {UserObject} from "../../../identity/graphql/user.object";

@ObjectType()
export class ScrimPlayerObject implements ScrimPlayer {
    @Field(() => Int)
    userId: number;

    @Field(() => UserObject)
    user?: UserObject;

    @Field(() => String)
    name: string;

    @Field(() => Date)
    joinedAt: Date;

    @Field(() => Date)
    leaveAt: Date;

    @Field(() => String, {nullable: true})
    group?: string;

    @Field(() => Boolean, {nullable: true})
    checkedIn?: boolean;

    @Field(() => Boolean)
    canSaveDemos: boolean;
}
