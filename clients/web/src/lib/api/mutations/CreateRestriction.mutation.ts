import {gql} from "@urql/core";

import {client} from "../client";

interface CreateRestrictionResponse {
    id: string;
}

interface CreateRestrictionVariables {
    memberId: number;
    reason: string;
    expiration: Date;
}

const mutationString = gql`
    mutation (
        $memberId: Int!
        $reason: String!
        $expiration: DateTime!
    ){
        createMemberRestriction(memberId: $memberId, type:QUEUE_BAN, reason:$reason, expiration: $expiration) {
            id
        }
    }
`;

export const createRestrictionMutation = async (vars: CreateRestrictionVariables): Promise<CreateRestrictionResponse> => {
    const r = await client.mutation<CreateRestrictionResponse, CreateRestrictionVariables>(mutationString, vars).toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
