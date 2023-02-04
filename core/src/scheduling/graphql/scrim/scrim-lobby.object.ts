import {Field, ObjectType} from "@nestjs/graphql";
import type {ScrimLobby} from "@sprocketbot/common";

@ObjectType()
export class ScrimLobbyObject implements ScrimLobby {
    @Field()
    name: string;

    @Field()
    password: string;
}
