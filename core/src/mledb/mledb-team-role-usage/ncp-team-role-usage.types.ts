import { createUnionType, Field, InputType, Int } from '@nestjs/graphql';
import { OperationError } from 'src/franchise/player/player.types';
import { z } from 'zod';

@InputType()
export class NcpTeamRoleInput {
  @Field(() => Int)
  matchId: number;

  @Field()
  teamName: string;

  /** League as CSV abbreviation: FL, AL, CL, ML, PL */
  @Field()
  leagueAbbrev: string;

  /** Slot letters from the sheet, e.g. A, B, C (mapped to PLAYERA, PLAYERB, …) */
  @Field(() => [String])
  slotsUsed: string[];
}

export const ncpTeamRoleUsageInputSchema = z.object({
  matchId: z.number(),
  teamName: z.string(),
  leagueAbbrev: z.string(),
  slotsUsed: z.array(z.string()),
});

export type ncpTeamRoleUsageInput = z.infer<typeof ncpTeamRoleUsageInputSchema>;

export function schemaToInput(s: ncpTeamRoleUsageInput): NcpTeamRoleInput {
  const out: NcpTeamRoleInput = {
    matchId: s.matchId,
    teamName: s.teamName,
    leagueAbbrev: s.leagueAbbrev,
    slotsUsed: s.slotsUsed,
  };

  return out;
}

// Union Types for Mutation Results
export const NcpRoleUsageResult = createUnionType({
  name: 'NcpRoleUsageResult',
  types: () => [Number, OperationError],
  resolveType: value => {
    if (value instanceof OperationError) return OperationError;
    return Number;
  },
});
