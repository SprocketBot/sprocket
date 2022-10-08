import {gql} from "@urql/core";

import {client} from "../../client";
import {currentScrim} from "../../queries";

type JoinScrimResponse = boolean;

interface JoinScrimVars {
    scrimId: string;
    createGroup?: boolean;
    group?: string;
}
const mutationString = gql`
mutation (
    $scrimId: String!,
    $createGroup: Boolean
    $group: String
) {
    joinScrim(scrimId: $scrimId, group: $group, createGroup: $createGroup)
}`;

export const joinScrimMutation = async (vars: JoinScrimVars): Promise<JoinScrimResponse> => {
    const r = await client.mutation<JoinScrimResponse, JoinScrimVars>(mutationString, vars).toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
