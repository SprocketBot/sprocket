import {gql} from "@urql/core";

import {client} from "../../client";
import {currentScrim} from "../../queries";

type JoinScrimResponse = boolean;

interface JoinScrimVars {
    scrimId: string;
    leaveAfter: number;
    createGroup?: boolean;
    group?: string;
}
const mutationString = gql`
mutation (
    $scrimId: String!
    $leaveAfter: Int!
    $createGroup: Boolean
    $group: String
) {
    joinScrim(scrimId: $scrimId, group: $group, createGroup: $createGroup, leaveAfter: $leaveAfter)
}`;

export const joinScrimMutation = async (
    vars: JoinScrimVars,
): Promise<JoinScrimResponse> => {
    const r = await client
        .mutation<JoinScrimResponse, JoinScrimVars>(mutationString, vars)
        .toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
