import {gql} from "@urql/core";

import {client} from "$lib/api/client";

interface SwitchOrganizationResponse {
    switchOrganization: {
        access: string;
        refresh: string;
    }
}
interface SwitchOrganizationVars {
    organizationId: number;
}
const mutationString = gql<SwitchOrganizationResponse, SwitchOrganizationVars>`
    mutation ($organizationId: Int!) {
        switchOrganization(organizationId: $organizationId) {
            access
            refresh
        }
    }
`;

export const switchOrganizationMutation = async (
    vars: SwitchOrganizationVars,
): Promise<SwitchOrganizationResponse> => {
    const r = await client
        .mutation<SwitchOrganizationResponse, SwitchOrganizationVars>(mutationString, vars)
        .toPromise();
    if (r.data) return r.data;
    throw r.error as Error;
};
