import type {MLE_OrganizationTeam} from "$mledb";

export class AuthPayload {
    sub: string;

    username: string;

    userId: number;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];
}
