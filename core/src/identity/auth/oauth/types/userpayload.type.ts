import type {MLE_OrganizationTeam} from "../../../../database/mledb";

export class UserPayload {
    userId: number;

    username: string;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];

    /**
     * Token version - used to invalidate sessions when incremented.
     */
    tokenVersion?: number;
}
