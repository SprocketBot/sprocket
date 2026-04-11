import { z } from 'zod';

const META_KEYS = new Set(
  [
    'MatchID',
    'matchId',
    'Team',
    'teamName',
    'League',
    'leagueAbbrev',
    'Mode',
    'mode',
  ].map(s => s.toLowerCase()),
);

/**
 * Slot letters exported from sheets: first column is often `Slotsused`, then blank
 * headers (PapaParse renames duplicates to `_1`, `_2`, …).
 */
export function isNcpSlotColumnKey(key: string): boolean {
  if (key === '') return true;
  if (/^_\d+$/.test(key)) return true;
  if (key.toLowerCase() === 'slotsused') return true;
  if (/^slot\d*$/i.test(key)) return true;
  return false;
}

function isMetaColumnKey(key: string): boolean {
  return META_KEYS.has(key.toLowerCase());
}

/** Collect slot cells left-to-right; skips null/empty (trailing CSV empties). */
export function collectNcpSlotValuesFromRow(row: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const key of Object.keys(row)) {
    if (isMetaColumnKey(key)) continue;
    if (!isNcpSlotColumnKey(key)) continue;
    const raw = row[key];
    if (raw === null || raw === undefined) continue;
    const s = String(raw).trim();
    if (s.length === 0) continue;
    out.push(s);
  }
  return out;
}

function preprocessNcpTeamRoleUsageSheetRow(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  const row = raw as Record<string, unknown>;
  const matchId = row.MatchID ?? row.matchId;
  const teamName = row.Team ?? row.teamName;
  const leagueAbbrev = row.League ?? row.leagueAbbrev;
  const slotsUsed = collectNcpSlotValuesFromRow(row);
  return { matchId, teamName, leagueAbbrev, slotsUsed };
}

/**
 * Rows from Google Sheets / Excel NCP exports (`MatchID`, `Team`, `League`, `Mode`,
 * then one column per slot letter; trailing empty cells are fine).
 */
export const ncpTeamRoleUsageCsvRowSchema = z.preprocess(
  preprocessNcpTeamRoleUsageSheetRow,
  z.object({
    matchId: z.coerce.number().int().positive(),
    teamName: z.string().trim().min(1),
    leagueAbbrev: z.string().trim().min(1),
    slotsUsed: z.array(z.string()).min(1),
  }),
);

export type NcpTeamRoleUsageCsvRow = z.infer<typeof ncpTeamRoleUsageCsvRowSchema>;
