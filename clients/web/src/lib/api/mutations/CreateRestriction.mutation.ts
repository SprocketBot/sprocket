import {gql} from "@urql/core";
import {client} from "../client";

interface CreateRestrictionResponse {
    id: string;
}

interface CreateRestrictionVariables {
    id: number;
    expiration: Date;
}

const mutationString = gql`
    mutation (
        $id: Int!
        $expiration: DateTime!
    ){
        manuallyExpireMemberRestriction(id: $id, manualExpiration: $expiration, manualExpirationReason:"From admin interface") {
            memberId
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
