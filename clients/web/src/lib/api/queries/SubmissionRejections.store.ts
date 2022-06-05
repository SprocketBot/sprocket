import {gql} from "@urql/core";
import {QueryStore} from "../core/QueryStore";

export interface SubmissionRejection {
    playerId: number;
    reason: string;
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
                playerId
                reason
            }
        }
    `;

    constructor(submissionId: string) {
        super();
        this._vars = {submissionId};
    }
}
