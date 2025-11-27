import {
    Field, Float, InputType,
    Int,
} from "@nestjs/graphql";
import { z } from "zod";

import {
    League, ModePreference, Timezone,
} from "../../database/mledb";
export interface GameAndOrganization {
    gameId: number;
    organizationId: number;
}

@InputType()
export class CreatePlayerTuple {
    @Field(() => Int)
    gameSkillGroupId: number;

    @Field(() => Float)
    salary: number;
}

export const IntakeSchema = z.object({
    discordId: z.preprocess((val) => String(val), z.string()),
    name: z.string(),
    skillGroup: z.nativeEnum(League),
    salary: z.preprocess((val) => parseFloat(String(val)), z.number()),
    preferredPlatform: z.enum(["PC", "XB1", "PS4"]),
    timezone: z.nativeEnum(Timezone),
    preferredMode: z.nativeEnum(ModePreference),
}).passthrough()
    .transform((data) => {
        const {
            discordId, name, skillGroup, salary, preferredPlatform, timezone, preferredMode, ...rest
        } = data;
        const accounts = Object.values(rest).filter(a => typeof a === "string" && a !== "");
        return {
            discordId,
            name,
            skillGroup,
            salary,
            preferredPlatform,
            timezone,
            preferredMode,
            accounts: accounts as string[],
        };
    });

export const RankdownJwtPayloadSchema = z.object({
    playerId: z.number(),
    salary: z.number(),
    skillGroupId: z.number(),
});

export const EloRedistributionSchema = z.array(z.tuple([
    z.string(),
    z.string(),
    z.string(),
]).rest(z.string())
    .transform(([playerId, salary, newElo]) => ({
        playerId: parseInt(playerId),
        salary: parseFloat(salary),
        newElo: parseFloat(newElo),
    })));

export type RankdownJwtPayload = z.infer<typeof RankdownJwtPayloadSchema>;
