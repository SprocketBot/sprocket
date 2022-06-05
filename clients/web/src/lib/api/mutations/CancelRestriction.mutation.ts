import {gql} from "@urql/core";
import {client} from "../client";

interface CancelRestrictionResponse {
    id: string;
}

interface CancelRestrictionVariables {
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

export const expireRestrictionMutation = async (vars: CancelRestrictionVariables): Promise<CancelRestrictionResponse> => {
    const r = await client.mutation<CancelRestrictionResponse, CancelRestrictionVariables>(mutationString, vars).toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
