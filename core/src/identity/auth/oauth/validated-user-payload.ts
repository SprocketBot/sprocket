import {UnauthorizedException} from "@nestjs/common";

import {MLE_OrganizationTeam} from "../../../database/mledb";
import type {AuthPayload, UserPayload} from "./types";

const validOrganizationTeams = new Set(Object.values(MLE_OrganizationTeam).filter((value): value is number => typeof value === "number"));

const isPositiveSafeInteger = (value: unknown): value is number => (
    typeof value === "number"
    && Number.isSafeInteger(value)
    && value > 0
);

export function validateUserPayload(payload: Partial<AuthPayload>, source: string): UserPayload {
    if (!isPositiveSafeInteger(payload.userId)) {
        throw new UnauthorizedException(`${source} payload has an invalid userId`);
    }

    if (typeof payload.username !== "string" || payload.username.trim().length === 0) {
        throw new UnauthorizedException(`${source} payload has an invalid username`);
    }

    if (
        typeof payload.currentOrganizationId !== "undefined"
        && !isPositiveSafeInteger(payload.currentOrganizationId)
    ) {
        throw new UnauthorizedException(`${source} payload has an invalid organization`);
    }

    const orgTeams = payload.orgTeams ?? [];
    if (
        !Array.isArray(orgTeams)
        || orgTeams.some(orgTeam => !Number.isInteger(orgTeam) || !validOrganizationTeams.has(orgTeam))
    ) {
        throw new UnauthorizedException(`${source} payload has invalid org teams`);
    }

    return {
        userId: payload.userId,
        username: payload.username,
        currentOrganizationId: payload.currentOrganizationId,
        orgTeams,
    };
}
