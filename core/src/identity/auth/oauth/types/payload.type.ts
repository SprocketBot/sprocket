import type {MLE_OrganizationTeam} from "../../../../database/mledb";

export class AuthPayload {
    sub: string;

    username: string;

    userId: number;

    currentOrganizationId?: number;

    orgTeams?: MLE_OrganizationTeam[];

    /**
     * Token version - used to invalidate sessions when incremented.
     * Included in JWT to allow quick validation without DB lookup on every request.
     */
    tokenVersion?: number;
}
