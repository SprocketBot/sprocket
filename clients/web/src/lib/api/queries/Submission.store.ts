import {gql} from "@urql/core";
import {QueryStore} from "../core/QueryStore";

export type SubmissionResult = String[];

interface SubmissionVariables {
    submissionId: string;
}

export class SubmissionStore extends QueryStore<SubmissionResult, SubmissionVariables> {
    protected queryString = gql<SubmissionResult>`
    query($submissionId: String!) {
        getSubmissionTasks(submissionId: $submissionId)
    }
    `;

    constructor(submissionId: string) {
        super();
        this._vars = {submissionId};
    }
}
