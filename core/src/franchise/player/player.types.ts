import {z} from "zod";

import {
    League, ModePreference, Timezone,
} from "../../database/mledb";

export interface GameAndOrganization {
    gameId: number;
    organizationId: number;
}

export const IntakeSchema = z.array(z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.nativeEnum(League),
    z.string(),
    z.enum(["PC", "XB1", "PS4"]),
    z.nativeEnum(Timezone),
    z.nativeEnum(ModePreference),
    z.string(),
]).rest(z.string())
    .transform(([mleid, discordId, name, skillGroup, salary, preferredPlatform, timezone, preferredMode, primaryAccount, ...accounts]) => ({
        mleid: parseInt(mleid),
        discordId: discordId,
        name: name,
        skillGroup: skillGroup,
        salary: parseFloat(salary),
        preferredPlatform: preferredPlatform,
        timezone: timezone,
        preferredMode: preferredMode,
        accounts: accounts.concat(primaryAccount).filter(a => a !== ""),
    })));
