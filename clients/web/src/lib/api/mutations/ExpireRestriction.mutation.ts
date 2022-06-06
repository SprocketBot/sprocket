import {gql} from "@urql/core";
import {client} from "../client";

interface ExpireRestrictionResponse {
    id: string;
}

interface ExpireRestrictionVariables {
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

export const expireRestrictionMutation = async (vars: ExpireRestrictionVariables): Promise<ExpireRestrictionResponse> => {
    const r = await client.mutation<ExpireRestrictionResponse, ExpireRestrictionVariables>(mutationString, vars).toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
