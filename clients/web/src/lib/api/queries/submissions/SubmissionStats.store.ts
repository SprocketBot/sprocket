import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";

export interface SubmissionStatsData {
    games: Array<{
        teams: Array<{
            result?: "WIN" | "LOSS" | "DRAW" | "UNKNOWN";
            score?: number;
            stats?: Record<string, number>;
            players: Array<{
                name: string;
                stats?: Record<string, number>;
            }>;
        }>;
    }>;
}

interface SubmissionStatsVars {
    submissionId: string;
}

export class SubmissionStatsStore extends QueryStore<SubmissionStatsData, SubmissionStatsVars> {
    protected queryString = gql`
    query ($submissionId: String!) {
      stats: getSubmissionStats(submissionId: $submissionId) {
        games {
          teams {
            result
            score
            stats
            players {
              name
              stats
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
