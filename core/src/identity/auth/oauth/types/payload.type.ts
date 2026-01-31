import type {MLE_OrganizationTeam} from "../../../../database/mledb";

export class AuthPayload {
    sub: string;

    username: string;

    userId: number;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];
}
