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
    z.nativeEnum(League),
    z.string(),
    z.enum(["PC", "XBOX", "PSN"]),
    z.nativeEnum(Timezone),
    z.nativeEnum(ModePreference),
    z.string(),
]).rest(z.string())
    .transform(([name, discordId, skillGroup, salary, preferredPlatform, timezone, preferredMode, primaryAccount, ...accounts]) => ({
        name: name,
        discordId: discordId,
        skillGroup: skillGroup,
        salary: parseFloat(salary),
        preferredPlatform: preferredPlatform,
        timezone: timezone,
        preferredMode: preferredMode,
        accounts: accounts.concat(primaryAccount).filter(a => a !== ""),
    })));
