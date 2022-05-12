import type {MLE_OrganizationTeam} from "../../../../database/mledb/enums/OrganizationTeam.enum";

export class AuthPayload {
    sub: string;

    username: string;

    userId: number;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];
}
