import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimLobby as IScrimLobby} from "@sprocketbot/common";

@ObjectType()
export class ScrimLobby implements IScrimLobby {
    @Field()
    name: string;

    @Field()
    password: string;
}
