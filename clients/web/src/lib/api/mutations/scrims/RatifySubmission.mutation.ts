import {gql} from "@urql/core";

import {client} from "../../client";

type RatifySubmissionResponse = boolean;

interface RatifySubmissionVariables {
    submissionId: string;
}

const mutationString = gql`
    mutation (
        $submissionId: String!
    ) {
        ratifySubmission(submissionId: $submissionId)
    }
`;

export const RatifySubmissionMutation = async (vars: RatifySubmissionVariables): Promise<RatifySubmissionResponse> => {
    const r = await client.mutation<RatifySubmissionResponse, RatifySubmissionVariables>(mutationString, vars).toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
