import {Test, TestingModule} from "@nestjs/testing";

import {UserAuthenticationAccountType} from "$db/identity/user_authentication_account/user_authentication_account_type.enum";
import type {User} from "$db/identity/user/user.model";

import {IdentityService} from "../../../identity.service";
import {UserService} from "../../../user";
import {DiscordStrategy} from "./discord.strategy";

jest.mock("@sprocketbot/common", () => ({
    config: {
        auth: {
            discord: {
                clientId: "test-client-id",
                secret: "test-client-secret",
                callbackURL: "http://localhost/callback",
            },
        },
    },
    AnalyticsService: {
        send: jest.fn().mockResolvedValue(undefined),
    },
    AnalyticsEndpoint: {
        Analytics: "analytics",
    },
}));

jest.mock("../../../../franchise", () => ({
    GameSkillGroupService: {
        getGameSkillGroup: jest.fn().mockResolvedValue({id: 1}),
    },
    PlayerService: {
        getPlayer: jest.fn().mockResolvedValue(null),
        createPlayer: jest.fn().mockResolvedValue({id: 1}),
    },
}));

jest.mock("../../../../game", () => ({
    PlatformService: {
        getPlatformByCode: jest.fn().mockRejectedValue(new Error("Not found")),
        createPlatform: jest.fn().mockResolvedValue({id: 1}),
    },
}));

jest.mock("../../../../mledb", () => ({
    MledbPlayerService: {
        getPlayerByDiscordId: jest.fn(),
    },
    MledbPlayerAccountService: {
        getPlayerAccounts: jest.fn().mockResolvedValue([]),
    },
}));

jest.mock("../../../../organization", () => ({
    MemberService: {
        getMember: jest.fn().mockResolvedValue(null),
        createMember: jest.fn().mockResolvedValue({id: 1, user: {id: 1}}),
    },
    MemberPlatformAccountService: {
        upsertMemberPlatformAccount: jest.fn().mockResolvedValue(undefined),
    },
}));

describe("DiscordStrategy", () => {
    let strategy: DiscordStrategy;
    let identityService: jest.Mocked<IdentityService>;
    let userService: jest.Mocked<UserService>;
    let mledbPlayerService: any;

    const mockProfile = {
        id: "discord-user-123",
        username: "testuser",
        email: "test@example.com",
    };

    const mockUser: Partial<User> = {
        id: 1,
        profile: {
            displayName: "Test User",
            email: "test@example.com",
            tokenVersion: 0,
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscordStrategy,
                {
                    provide: IdentityService,
                    useValue: {
                        getUserByAuthAccount: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        getUser: jest.fn(),
                        createUser: jest.fn(),
                        addAuthenticationAccounts: jest.fn(),
                    },
                },
            ],
        }).compile();

        strategy = module.get<DiscordStrategy>(DiscordStrategy);
        identityService = module.get(IdentityService);
        userService = module.get(UserService);
        mledbPlayerService = require("../../../../mledb").MledbPlayerService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("validate", () => {
        it("authenticates user found by Discord ID", async () => {
            identityService.getUserByAuthAccount.mockResolvedValue(mockUser as User);

            const result = await strategy.validate(
                "access-token",
                "refresh-token",
                mockProfile as any,
                jest.fn(),
            );

            expect(result).toEqual(mockUser);
            expect(identityService.getUserByAuthAccount).toHaveBeenCalledWith(
                UserAuthenticationAccountType.DISCORD,
                "discord-user-123",
            );
            expect(userService.getUser).not.toHaveBeenCalled();
        });

        it("throws error when Discord user has no email and is not found by Discord ID", async () => {
            identityService.getUserByAuthAccount.mockResolvedValue(undefined);
            mledbPlayerService.getPlayerByDiscordId.mockResolvedValue(null);

            const profileWithoutEmail = {id: "discord-user-123", username: "testuser", email: undefined};

            await expect(
                strategy.validate("access-token", "refresh-token", profileWithoutEmail as any, jest.fn()),
            ).rejects.toThrow("User account could not be found and there is no attached email to the Discord user");
        });

        it("throws error when user is not found by Discord ID and has no MLEDB player", async () => {
            identityService.getUserByAuthAccount.mockResolvedValue(undefined);
            mledbPlayerService.getPlayerByDiscordId.mockResolvedValue(null);

            // Note: Even though userService.getUser exists, we don't call it anymore
            // (the email fallback was removed for security reasons)

            await expect(
                strategy.validate("access-token", "refresh-token", mockProfile as any, jest.fn()),
            ).rejects.toThrow("User is not associated with MLE");

            // Verify email fallback is NOT called
            expect(userService.getUser).not.toHaveBeenCalled();
        });

        it("creates new user when found in MLEDB but not in Sprocket", async () => {
            identityService.getUserByAuthAccount.mockResolvedValue(undefined);
            mledbPlayerService.getPlayerByDiscordId.mockResolvedValue({
                id: 42,
                name: "MLE Player",
                league: "PREMIER",
                salary: 1000,
            });
            userService.createUser.mockResolvedValue({id: 2} as User);

            const result = await strategy.validate(
                "access-token",
                "refresh-token",
                mockProfile as any,
                jest.fn(),
            );

            expect(result).toEqual({id: 2});
            expect(userService.createUser).toHaveBeenCalled();
            expect(identityService.getUserByAuthAccount).toHaveBeenCalled();
        });

        it("does NOT authenticate as wrong user when email matches another user (security fix)", async () => {
            // This is the key security test - verifies email fallback is removed
            identityService.getUserByAuthAccount.mockResolvedValue(undefined);
            mledbPlayerService.getPlayerByDiscordId.mockResolvedValue(null);

            // Even if there's a user in Sprocket with the same email, we should NOT return them
            // This was the bug: users with unknown@sprocket.gg would get logged in as MLE DEV USER

            await expect(
                strategy.validate("access-token", "refresh-token", mockProfile as any, jest.fn()),
            ).rejects.toThrow("User is not associated with MLE");

            // The critical assertion: email fallback should NOT be called
            expect(userService.getUser).not.toHaveBeenCalled();
        });

        it("links Discord account when user exists by email but not by Discord ID", async () => {
            identityService.getUserByAuthAccount.mockResolvedValue(undefined);
            mledbPlayerService.getPlayerByDiscordId.mockResolvedValue({
                id: 42,
                name: "MLE Player",
                league: "PREMIER",
                salary: 1000,
            });
            userService.getMember.mockResolvedValue({id: 1, user: {id: 1}} as any);

            const result = await strategy.validate(
                "access-token",
                "refresh-token",
                mockProfile as any,
                jest.fn(),
            );

            // Should add the Discord account to the existing user
            expect(userService.addAuthenticationAccounts).toHaveBeenCalledWith(expect.any(Number), [
                expect.objectContaining({
                    accountType: UserAuthenticationAccountType.DISCORD,
                    accountId: "discord-user-123",
                }),
            ]);
        });
    });
});
