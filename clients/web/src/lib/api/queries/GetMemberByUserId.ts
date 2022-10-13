import {gql} from "@urql/core";

import {client} from "../client";

interface GetMemberByUserIdResponse {
    id: number;
}

interface GetMemberByUserIdVariables {
    id: number;
    orgId: number;
}

const queryString = gql`
    query ($orgId: Int!, $id: Int!) {
        getMemberByUserId(organizationId: $orgId, userId: $id) {
            id
        }
    }
`;

export const getMemberByUserIdQuery = async (
    vars: GetMemberByUserIdVariables,
): Promise<GetMemberByUserIdResponse> => {
    const r = await client
        .query<
            {getMemberByUserId: GetMemberByUserIdResponse},
            GetMemberByUserIdVariables
        >(queryString, vars)
        .toPromise();
    if (r.data) {
        return r.data.getMemberByUserId;
    }
    throw r.error as Error;
};
