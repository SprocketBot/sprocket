import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class JwtTokenSet {
    @Field()
    access: string;

    @Field()
    refresh: string;
}

export * from "./strategies/discord/discord.types";
export * from "./strategies/epic/epic.types";
export * from "./strategies/google/google.types";
export * from "./strategies/jwt/jwt.types";
export * from "./strategies/steam/steam.types";
