// export interface ReplaySubmissionStats {
//     games: Array<{
//         teams: Array<{
//             // TODO in the future, we will want this to be a member
//             players: string[];
//             won: boolean;
//         }>;
//     }>;
// }

import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class ReplaySubmissionTeam {
    @Field(() => [String])
    players: string[];

    @Field(() => Boolean)
    won: boolean;
}

@ObjectType()
export class ReplaySubmissionGame {
    @Field(() => [ReplaySubmissionTeam])
    teams: ReplaySubmissionTeam[];
}

@ObjectType()
export class ReplaySubmissionStats {
    @Field(() => [ReplaySubmissionGame])
    games: ReplaySubmissionGame[];
}
