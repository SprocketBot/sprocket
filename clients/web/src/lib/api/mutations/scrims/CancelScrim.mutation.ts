import {gql} from "@urql/core";

import {client} from "../../client";

interface CancelScrimResponse {
    id: string;
}

interface CancelScrimVariables {
    scrimId: string;
}

const mutationString = gql`
    mutation ($scrimId: String!) {
        cancelScrim(scrimId: $scrimId) {
            id
        }
    }
`;

export const cancelScrimMutation = async (
    vars: CancelScrimVariables,
): Promise<CancelScrimResponse> => {
    const r = await client
        .mutation<CancelScrimResponse, CancelScrimVariables>(
            mutationString,
            vars,
        )
        .toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
