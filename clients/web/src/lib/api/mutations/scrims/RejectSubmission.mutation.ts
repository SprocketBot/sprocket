import {gql} from "@urql/core";

import {client} from "../../client";

type RejectSubmissionResponse = boolean;

interface RejectSubmissionVariables {
    submissionId: string;
    reason: string;
}

const mutationString = gql`
    mutation ($submissionId: String!, $reason: String!) {
        rejectSubmission(submissionId: $submissionId, reason: $reason)
    }
`;

export const RejectSubmissionMutation = async (
    vars: RejectSubmissionVariables,
): Promise<RejectSubmissionResponse> => {
    const r = await client
        .mutation<RejectSubmissionResponse, RejectSubmissionVariables>(
            mutationString,
            vars,
        )
        .toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
