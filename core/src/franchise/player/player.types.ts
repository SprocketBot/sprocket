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

export const IntakeSchema = z.array(z.tuple([
    z.string(),
    z.string(),
    z.nativeEnum(League),
    z.string(),
    z.enum(["PC", "XB1", "PS4"]),
    z.nativeEnum(Timezone),
    z.nativeEnum(ModePreference),
]).rest(z.string())
    .transform(([discordId, name, skillGroup, salary, preferredPlatform, timezone, preferredMode, ...accounts]) => ({
        discordId: discordId,
        name: name,
        skillGroup: skillGroup,
        salary: parseFloat(salary),
        preferredPlatform: preferredPlatform,
        timezone: timezone,
        preferredMode: preferredMode,
        accounts: accounts.filter(a => a !== ""),
    })));

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
