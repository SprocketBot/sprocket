import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";

export interface Match {
    id: number;
    rounds: Array<{
        id: number;
    }>;
}

export interface MatchResult {
    getMatchBySubmissionId: Match;
}

export interface MatchVars {
    submissionId: string;
}

export class MatchStore extends QueryStore<MatchResult, MatchVars> {
    protected queryString = gql<MatchResult, MatchVars>`
        query($submissionId: String!) {
            getMatchBySubmissionId(submissionId: $submissionId) {
                id
                rounds {
                    id
                }
            }
        }
    `;

    constructor(submissionId: string) {
        super();
        this.vars = {submissionId};
    }
}
