import {gql} from "@urql/core";

import {client} from "../../client";
import {currentScrim} from "../../queries";

type ResetSubmissionResponse = boolean;

interface ResetSubmissionVars {
    submissionId: string;
}
const mutationString = gql`
    mutation ($submissionId: String!) {
        resetSubmission(submissionId: $submissionId)
    }
`;

export const resetSubmissionMutation = async (
    vars: ResetSubmissionVars,
): Promise<ResetSubmissionResponse> => {
    const r = await client
        .mutation<ResetSubmissionResponse, ResetSubmissionVars>(
            mutationString,
            vars,
        )
        .toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
