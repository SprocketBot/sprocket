import type {MLE_OrganizationTeam} from "../../../../database/mledb/enums/OrganizationTeam.enum";

export class UserPayload {
    userId: number;

    username: string;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];
}
