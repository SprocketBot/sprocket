import {gql} from "@urql/core";
import {client} from "../client";

interface ExpireRestrictionResponse {
    id: string;
}

interface ExpireRestrictionVariables {
    id: number;
    expiration: Date;
    reason: String;
    forgiven?: boolean;
}

const mutationString = gql`
  mutation ($id: Int!, $expiration: DateTime!, $reason: String!, $forgiven: Boolean) {
    manuallyExpireMemberRestriction(
      id: $id
      manualExpiration: $expiration
      manualExpirationReason: $reason
      forgiven: $forgiven
    ) {
      memberId
      id
    }
  }
`;

export const expireRestrictionMutation = async (vars: ExpireRestrictionVariables): Promise<ExpireRestrictionResponse> => {
    const r = await client
        .mutation<ExpireRestrictionResponse, ExpireRestrictionVariables>(mutationString, vars)
        .toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
