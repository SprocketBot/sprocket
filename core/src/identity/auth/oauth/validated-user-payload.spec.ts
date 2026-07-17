import {UnauthorizedException} from "@nestjs/common";

import {MLE_OrganizationTeam} from "../../../database/mledb";
import {validateUserPayload} from "./validated-user-payload";

describe("validateUserPayload", () => {
    it("accepts a real Sprocket user payload", () => {
        expect(validateUserPayload({
            sub: "discord-123",
            username: "Actual User",
            userId: 42,
            currentOrganizationId: 2,
            orgTeams: [MLE_OrganizationTeam.LEAGUE_OPERATIONS],
        }, "test")).toEqual({
            username: "Actual User",
            userId: 42,
            currentOrganizationId: 2,
            orgTeams: [MLE_OrganizationTeam.LEAGUE_OPERATIONS],
        });
    });

    it("rejects sentinel user ids", () => {
        expect(() => validateUserPayload({
            sub: "dev",
            username: "MLE DEV USER",
            userId: -1,
            currentOrganizationId: 2,
            orgTeams: [MLE_OrganizationTeam.MLEDB_ADMIN],
        }, "test")).toThrow(UnauthorizedException);
    });

    it("rejects string org-team fallbacks", () => {
        expect(() => validateUserPayload({
            sub: "test-user",
            username: "test-user",
            userId: 1,
            currentOrganizationId: 2,
            orgTeams: ["MLEDB_ADMIN"] as unknown as MLE_OrganizationTeam[],
        }, "test")).toThrow(UnauthorizedException);
    });

    it("defaults missing org teams to no elevated access", () => {
        expect(validateUserPayload({
            sub: "discord-123",
            username: "Actual User",
            userId: 42,
            currentOrganizationId: 2,
        }, "test").orgTeams).toEqual([]);
    });
});
