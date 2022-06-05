import {gql} from "@urql/core";
import {QueryStore} from "../core/QueryStore";

export interface SubmissionRejection {
    playerName: string;
    reason: string;
    rejectedAt: Date;
}

export interface SubmissionRejectionsValue {
    rejections: SubmissionRejection[];
}

interface SubmissionRejectionsVariables {
    submissionId: string;
}

export class SubmissionRejectionsStore extends QueryStore<SubmissionRejectionsValue, SubmissionRejectionsVariables> {
    protected queryString = gql`
        query($submissionId: String!) {
            rejections: getSubmissionRejections(submissionId: $submissionId) {
                playerName
                reason
                rejectedAt
            }
        }
    `;

    constructor(submissionId: string) {
        super();
        this._vars = {submissionId};
    }
}
