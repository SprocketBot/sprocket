import {gql} from "@urql/core";

import {client} from "$lib/api/client";

interface AnonLoginResponse {
    token: string;
}
interface AnonLoginVars {
    username: string;
}
const mutationString = gql<AnonLoginResponse, AnonLoginVars>`
mutation($username: String!) {
  token: anonymousLogin(username: $username)
}`;


export const anonLoginMutation = async (vars: AnonLoginVars): Promise<AnonLoginResponse> => {
    const r = await client.mutation<AnonLoginResponse, AnonLoginVars>(mutationString, vars).toPromise();
    if (r.data) return r.data;
    throw r.error as Error;
};
