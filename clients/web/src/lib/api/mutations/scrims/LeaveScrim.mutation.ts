import {gql} from "@urql/core";

import {client} from "../../client";
import {currentScrim} from "../../queries";

type LeaveScrimResponse = boolean;

interface LeaveScrimVars {
    scrimId: string;
}
const mutationString = gql`
mutation {
    leaveScrim
}`;

export const leaveScrimMutation = async (vars: LeaveScrimVars): Promise<LeaveScrimResponse> => {
    const r = await client.mutation<LeaveScrimResponse, LeaveScrimVars>(mutationString, vars).toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
