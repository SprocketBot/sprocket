import {Field, Int, ObjectType} from "@nestjs/graphql";
import type {ScrimPlayer as IScrimPlayer} from "@sprocketbot/common";

@ObjectType()
export class ScrimPlayer implements IScrimPlayer {
    @Field(() => Int)
    id: number;

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
