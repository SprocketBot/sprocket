import type {ParseConfig} from "papaparse";
import {z} from "zod";

import {parseAndValidateCsv} from "../../util/csv-parse";

import type {NcpTeamRoleUsageRowInput} from "./ncp-team-role-usage.types";

/** Expected headers: `Series ID`, `Team`, `League`, `Mode`, `Slots used`, then additional slot columns (often blank headers in the sheet). */
export const ncpTeamRoleUsageCsvRowSchema = z
    .object({
        "Series ID": z.coerce.number(),
        "Team": z.string(),
        "League": z.string(),
        "Mode": z.string().optional(),
        "Slots used": z.union([z.string(), z.number()]).optional(),
    })
    .passthrough()
    .transform((row): NcpTeamRoleUsageRowInput => {
        const slotsUsed: string[] = [];
        const pushSlot = (v: unknown): void => {
            if (v === undefined || v === null || v === "") return;
            const s = String(v).trim();
            if (s.length > 0) slotsUsed.push(s);
        };
        pushSlot(row["Slots used"]);
        for (const [k, v] of Object.entries(row)) {
            if (
                k === "Series ID"
        || k === "Team"
        || k === "League"
        || k === "Mode"
        || k === "Slots used"
            ) {
                continue;
            }
            pushSlot(v);
        }
        return {
            seriesId: row["Series ID"],
            teamName: row["Team"].trim(),
            leagueAbbrev: row["League"].trim(),
            slotsUsed,
        };
    })
    .pipe(
        z.object({
            seriesId: z.number().finite(),
            teamName: z.string().min(1),
            leagueAbbrev: z.string().min(1),
            slotsUsed: z.array(z.string()).min(1, "At least one non-empty slot column is required"),
        }),
    );

const ncpTeamRoleUsageCsvParseConfig: ParseConfig = {
    transformHeader: (header: string | undefined, index: number) => {
        const h = typeof header === "string" ? header.trim() : "";
        return h.length > 0 ? h : `slot_${index}`;
    },
};

/**
 * Parses NCP team-role usage CSV using the same {@link parseAndValidateCsv} pipeline as other bulk imports.
 */
export function parseNcpTeamRoleUsageCsv(csvString: string) {
    return parseAndValidateCsv(csvString.trim(), ncpTeamRoleUsageCsvRowSchema, ncpTeamRoleUsageCsvParseConfig);
}
