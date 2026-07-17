import type {ExecutionContext} from "@nestjs/common";

import {GqlJwtGuard} from "./gql-jwt-guard";

const makeContext = (req: unknown): ExecutionContext => ({
    getArgs: () => [null, null, {req}, null],
    getArgByIndex: (index: number) => [null, null, {req}, null][index],
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getType: jest.fn(),
    switchToHttp: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
}) as unknown as ExecutionContext;

describe("GqlJwtGuard", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalEnableTestMode = process.env.ENABLE_TEST_MODE;
    const authGuardPrototype = Object.getPrototypeOf(GqlJwtGuard.prototype);

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        if (typeof originalEnableTestMode === "undefined") {
            delete process.env.ENABLE_TEST_MODE;
        } else {
            process.env.ENABLE_TEST_MODE = originalEnableTestMode;
        }
        jest.restoreAllMocks();
    });

    it("only injects a non-admin test user in Jest test mode", () => {
        process.env.NODE_ENV = "test";
        process.env.ENABLE_TEST_MODE = "true";
        const req: {headers: Record<string, string>; user?: unknown;} = {
            headers: {"x-test-mode": "true"},
        };

        const result = new GqlJwtGuard().canActivate(makeContext(req));

        expect(result).toBe(true);
        expect(req.user).toEqual({
            userId: 1,
            username: "test-user",
            currentOrganizationId: 2,
            orgTeams: [],
        });
    });

    it("does not synthesize a user outside Jest test mode", () => {
        process.env.NODE_ENV = "production";
        process.env.ENABLE_TEST_MODE = "true";
        const superCanActivate = jest.spyOn(authGuardPrototype, "canActivate").mockReturnValue(false);
        const req: {headers: Record<string, string>; user?: unknown;} = {
            headers: {"x-test-mode": "true"},
        };

        const result = new GqlJwtGuard().canActivate(makeContext(req));

        expect(result).toBe(false);
        expect(req.user).toBeUndefined();
        expect(superCanActivate).toHaveBeenCalledTimes(1);
    });
});
