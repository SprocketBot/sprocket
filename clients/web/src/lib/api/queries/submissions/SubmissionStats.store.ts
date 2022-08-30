import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";

export interface SubmissionStatsData {
    games: Array<{
        teams: Array<{
            won: boolean;
            score: number;
            players: Array<{
                name: string;
                goals: number;
            }>;
        }>;
    }>;
}

interface SubmissionStatsVars {
    submissionId: string;
}

export class SubmissionStatsStore extends QueryStore<SubmissionStatsData, SubmissionStatsVars> {
    protected queryString = gql`
    query($submissionId: String!) {
        stats: getSubmissionStats(submissionId:$submissionId) {
            games{
                teams {
                    won
                    score
                    players {
                        name
                        goals
                    }
                }
            }
        }
    }
    `;

    constructor(submissionId: string) {
        super();
        this._vars = {submissionId};
    }
}
