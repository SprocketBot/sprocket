import {Field, InputType, Int} from "@nestjs/graphql";

@InputType()
export class NcpTeamRoleUsageRowInput {
    @Field(() => Int)
    seriesId: number;

    @Field()
    teamName: string;

    /** League as CSV abbreviation: FL, AL, CL, ML, PL */
    @Field()
    leagueAbbrev: string;

    /** Slot letters from the sheet, e.g. A, B, C (mapped to PLAYERA, PLAYERB, …) */
    @Field(() => [String])
    slotsUsed: string[];
}
