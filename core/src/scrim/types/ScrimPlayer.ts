import {
    Field, InputType, Int, ObjectType,
} from "@nestjs/graphql";
import type {ScrimPlayer as IScrimPlayer} from "@sprocketbot/common";

@ObjectType()
export class ScrimPlayer implements IScrimPlayer {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    name: string;

    @Field(() => Boolean, {nullable: true})
    checkedIn?: boolean | undefined;

    @Field(() => String, {nullable: true})
    group?: string | undefined;
}

@InputType()
export class ScrimPlayerInput implements IScrimPlayer {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    name: string;

    group: undefined;
}
