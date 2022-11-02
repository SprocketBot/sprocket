import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {
    AnalyticsEndpoint,
    AnalyticsResponse,
    CreateScrimOptions,
    JoinScrimOptions,
    Scrim,
} from "@sprocketbot/common";
import {AnalyticsModule, AnalyticsService, MatchmakingError, ScrimMode, ScrimStatus} from "@sprocketbot/common";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {ScrimModule} from "./scrim.module";
import {ScrimService} from "./scrim.service";
import {getMockScrimIds, getMockScrimSettings, mockPlayerFactories} from "./scrim.service.spec.helpers";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";

describe("ScrimService", () => {
    let service: ScrimService;
    let scrimCrudService: ScrimCrudService;
    let scrimLogicService: ScrimLogicService;
    let eventProxyService: EventProxyService;
    let analyticsService: AnalyticsService;
    let scrimGroupService: ScrimGroupService;

    let publishScrimUpdate: jest.SpyInstance;

    let crudPlayerInAnyScrim: jest.SpyInstance;
    let crudCreateScrim: jest.SpyInstance;
    let crudUpdatePlayer: jest.SpyInstance;
    let crudGetScrim: jest.SpyInstance;
    let crudAddPlayerToScrim: jest.SpyInstance;
    let crudRemovePlayerFromScrim: jest.SpyInstance;
    let crudRemoveScrim: jest.SpyInstance;
    let crudUpdateScrimStatus: jest.SpyInstance;
    let crudUpdateScrimUnlockedStatus: jest.SpyInstance;

    let logicPopScrim: jest.SpyInstance;
    let logicDeleteScrim: jest.SpyInstance;
    let logicStartScrim: jest.SpyInstance;

    let groupsResolveGroupKey: jest.SpyInstance;

    const someDate = new Date();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ScrimModule, AnalyticsModule],
            providers: [ScrimService],
        }).compile();

        service = module.get<ScrimService>(ScrimService);
        scrimCrudService = module.get<ScrimCrudService>(ScrimCrudService);
        scrimLogicService = module.get<ScrimLogicService>(ScrimLogicService);
        eventProxyService = module.get<EventProxyService>(EventProxyService);
        analyticsService = module.get<AnalyticsService>(AnalyticsService);
        scrimGroupService = module.get<ScrimGroupService>(ScrimGroupService);

        jest.spyOn(eventProxyService, "publish").mockResolvedValueOnce(true);
        jest.spyOn(analyticsService, "send").mockResolvedValueOnce(
            {} as AnalyticsResponse<AnalyticsEndpoint.Analytics>,
        );

        publishScrimUpdate = jest.spyOn(service, "publishScrimUpdate");
        publishScrimUpdate.mockResolvedValueOnce({} as Scrim);

        crudPlayerInAnyScrim = jest.spyOn(scrimCrudService, "playerInAnyScrim");
        crudCreateScrim = jest.spyOn(scrimCrudService, "createScrim");
        crudUpdatePlayer = jest.spyOn(scrimCrudService, "updatePlayer");
        crudGetScrim = jest.spyOn(scrimCrudService, "getScrim");
        crudAddPlayerToScrim = jest.spyOn(scrimCrudService, "addPlayerToScrim");
        crudRemovePlayerFromScrim = jest.spyOn(scrimCrudService, "removePlayerFromScrim");
        crudRemoveScrim = jest.spyOn(scrimCrudService, "removeScrim");
        crudUpdateScrimStatus = jest.spyOn(scrimCrudService, "updateScrimStatus");
        crudUpdateScrimUnlockedStatus = jest.spyOn(scrimCrudService, "updateScrimUnlockedStatus");

        logicPopScrim = jest.spyOn(scrimLogicService, "popScrim");
        logicDeleteScrim = jest.spyOn(scrimLogicService, "deleteScrim");
        logicStartScrim = jest.spyOn(scrimLogicService, "startScrim");

        groupsResolveGroupKey = jest.spyOn(scrimGroupService, "resolveGroupKey");
    });

    describe("Creating a Scrim", () => {
        it("Should throw with PlayerAlreadyInScrim when a player tries to join a scrim while in another scrim", async () => {
            const createScrimData: CreateScrimOptions = {
                ...getMockScrimIds(),
                settings: getMockScrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    userId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                },
            };

            crudPlayerInAnyScrim.mockResolvedValueOnce(true);

            const func = async (): Promise<Scrim> => service.createScrim(createScrimData);
            const expectedError = MatchmakingError.PlayerAlreadyInScrim;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with ScimGroupNotSupported when a player tries to create a round robin scrim with groups", async () => {
            const createScrimData: CreateScrimOptions = {
                ...getMockScrimIds(),
                settings: getMockScrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    userId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                    createGroup: true,
                },
            };

            crudPlayerInAnyScrim.mockResolvedValueOnce(false);

            const func = async (): Promise<Scrim> => service.createScrim(createScrimData);
            const expectedError = MatchmakingError.ScrimGroupNotSupportedInMode;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should create a Round Robin scrim successfully", async () => {
            const createScrimData: CreateScrimOptions = {
                ...getMockScrimIds(),
                settings: getMockScrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    userId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                },
            };
            const expected: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate)],
                games: undefined,
                settings: createScrimData.settings,
            };

            crudPlayerInAnyScrim.mockResolvedValueOnce(false);
            crudCreateScrim.mockResolvedValueOnce(expected);

            const actual = await service.createScrim(createScrimData);

            expect(actual).toEqual(expected);
            expect(crudCreateScrim).toHaveBeenCalledWith({
                authorUserId: expected.authorUserId,
                organizationId: expected.organizationId,
                gameModeId: expected.gameModeId,
                skillGroupId: expected.skillGroupId,
                settings: expected.settings,
                player: {
                    userId: createScrimData.join?.userId,
                    name: createScrimData.join?.playerName,
                    joinedAt: expect.any(Date) as Date,
                    leaveAt: expect.any(Date) as Date,
                },
            });
        });

        it("Should create a Teams scrim with a group successfully", async () => {
            const createScrimData: CreateScrimOptions = {
                ...getMockScrimIds(),
                settings: getMockScrimSettings(3, 2, ScrimMode.TEAMS, true, false, 1000),
                join: {
                    userId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                    createGroup: true,
                },
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate)],
                games: undefined,
                settings: createScrimData.settings,
            };

            crudPlayerInAnyScrim.mockResolvedValueOnce(false);
            crudCreateScrim.mockResolvedValueOnce(scrim);
            groupsResolveGroupKey.mockImplementationOnce(() => "tekssxisbad");
            crudUpdatePlayer.mockResolvedValueOnce({});

            const actual = await service.createScrim(createScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [mockPlayerFactories.hyper(someDate, "tekssxisbad")],
            };

            expect(actual).toEqual(expected);
            expect(crudCreateScrim).toHaveBeenCalledWith({
                authorUserId: expected.authorUserId,
                organizationId: expected.organizationId,
                gameModeId: expected.gameModeId,
                skillGroupId: expected.skillGroupId,
                settings: expected.settings,
                player: {
                    userId: createScrimData.join?.userId,
                    name: createScrimData.join?.playerName,
                    joinedAt: expect.any(Date) as Date,
                    leaveAt: expect.any(Date) as Date,
                    group: "tekssxisbad",
                },
            });
            expect(crudUpdatePlayer).toHaveBeenCalledWith(scrim.id, {
                userId: createScrimData.join?.userId,
                name: createScrimData.join?.playerName,
                joinedAt: expect.any(Date) as Date,
                leaveAt: expect.any(Date) as Date,
                group: "tekssxisbad",
            });
        });
    });

    describe("Joining a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tries to join a scrim that doesn't exist", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!!!!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };

            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with ScrimAlreadyInProgress when a player tries to join a scrim when it is already in progress", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.IN_PROGRESS,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(1, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.ScrimAlreadyInProgress;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with PlayerAlreadyInScrim when a player tries to join a scrim when they are already in a scrim", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(true);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.PlayerAlreadyInScrim;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with GroupNotFound when a player tries to join a group with an invalid group", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisawful",
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate, "tekssxisbad"), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.GroupNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with GroupFull when a player tries to join a group when the group has the number of players on a team", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisbad",
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [
                    mockPlayerFactories.hyper(someDate, "tekssxisbad"),
                    mockPlayerFactories.shuckle(someDate, "tekssxisbad"),
                ],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.GroupFull;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with MaxGroupsCreated when a player tries to create a group when there are already the number teams being the number of groups", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                createGroup: true,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [
                    mockPlayerFactories.hyper(someDate, "tekssxisbad"),
                    mockPlayerFactories.shuckle(someDate, "tekssxisawful"),
                ],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);

            const func = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expectedError = MatchmakingError.MaxGroupsCreated;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Player should join the scrim successfully", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);
            crudAddPlayerToScrim.mockResolvedValueOnce({});

            const actual = await service.joinScrim(joinScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    mockPlayerFactories.hyper(someDate),
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.tekssx(expect.any(Date) as Date),
                ],
            };

            expect(actual).toEqual(expected);
            expect(crudAddPlayerToScrim).toHaveBeenCalledWith(scrim.id, {
                userId: joinScrimData.userId,
                name: joinScrimData.playerName,
                joinedAt: expect.any(Date) as Date,
                leaveAt: expect.any(Date) as Date,
            });
        });

        it("Player should join the scrim and group successfully", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisbad",
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate, "tekssxisbad"), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);
            crudAddPlayerToScrim.mockResolvedValueOnce({});

            const actual = await service.joinScrim(joinScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    mockPlayerFactories.hyper(someDate, "tekssxisbad"),
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.tekssx(expect.any(Date) as Date, "tekssxisbad"),
                ],
            };

            expect(actual).toEqual(expected);
            expect(crudAddPlayerToScrim).toHaveBeenCalledWith(scrim.id, {
                userId: joinScrimData.userId,
                name: joinScrimData.playerName,
                joinedAt: expect.any(Date) as Date,
                leaveAt: expect.any(Date) as Date,
                group: "tekssxisbad",
            });
        });

        it("The scrim should pop when the last player joins and it is full", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                userId: 4,
                playerName: "Nigel Thornbrake",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [
                    mockPlayerFactories.hyper(someDate),
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.tekssx(someDate),
                ],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudPlayerInAnyScrim.mockResolvedValueOnce(false);
            crudAddPlayerToScrim.mockResolvedValueOnce({});
            logicPopScrim.mockResolvedValueOnce({});

            const actual = await service.joinScrim(joinScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    mockPlayerFactories.hyper(someDate),
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.tekssx(someDate),
                    mockPlayerFactories.nigel(expect.any(Date) as Date),
                ],
            };

            expect(actual).toEqual(expected);
            expect(logicPopScrim).toHaveBeenCalledWith(expected);
        });
    });

    describe("Leaving a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tires to leave a scrim that doesn't exist", async () => {
            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.leaveScrim("hi Nigel", 1);
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with ScrimAlreadyInProgress when a player tires to leave a scrim that is no longer pending", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.POPPED,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> =>
                service.leaveScrim("hello world!", mockPlayerFactories.shuckle(someDate).userId);
            const expectedError = MatchmakingError.ScrimAlreadyInProgress;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with PlayerNotInScrim when a player tires to leave a scrim they are not in", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> =>
                service.leaveScrim("hello world!", mockPlayerFactories.tekssx(someDate).userId);
            const expectedError = MatchmakingError.PlayerNotInScrim;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Scrim should be deleted if the player leaving is the only player in the scrim", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            logicDeleteScrim.mockResolvedValueOnce({});

            const actual = await service.leaveScrim("hello world!", mockPlayerFactories.hyper(someDate).userId);
            const expected: Scrim = {
                ...scrim,
                players: [],
            };

            expect(actual).toEqual(expected);
            expect(logicDeleteScrim).toHaveBeenCalledWith(expected);
            expect(crudRemovePlayerFromScrim).toHaveBeenCalledTimes(0);
        });

        it("Player should be removed from the scrim", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...getMockScrimIds(),
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.shuckle(someDate)],
                games: undefined,
                settings: getMockScrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudRemovePlayerFromScrim.mockResolvedValueOnce({});

            const actual = await service.leaveScrim("hello world!", mockPlayerFactories.shuckle(someDate).userId);
            const expected: Scrim = {
                ...scrim,
                players: [mockPlayerFactories.hyper(someDate)],
            };

            expect(actual).toStrictEqual(expected);
            expect(logicDeleteScrim).toHaveBeenCalledTimes(0);
            expect(crudRemovePlayerFromScrim).toHaveBeenCalledWith(
                scrim.id,
                mockPlayerFactories.shuckle(someDate).userId,
            );
        });
    });

    describe("Checking Into a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tries to check into a scrim that doesn't exist", async () => {
            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.checkIn("hi zach", 1);
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with ScrimStatusNotPopped when a player tries to check into a scrim that isn't popped", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
                status: ScrimStatus.PENDING,
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> => service.checkIn(scrim.id, 1);
            const expectedError = MatchmakingError.ScrimStatusNotPopped;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with PlayerNotInScrim when a player tries to check into a scrim they are not in", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
                status: ScrimStatus.POPPED,
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.tekssx(someDate)],
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> =>
                service.checkIn(scrim.id, mockPlayerFactories.shuckle(someDate).userId);
            const expectedError = MatchmakingError.PlayerNotInScrim;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with PlayerAlreadyCheckedIn when a player tries to check into a scrim they already checked into", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
                status: ScrimStatus.POPPED,
                players: [
                    mockPlayerFactories.hyper(someDate),
                    {
                        ...mockPlayerFactories.tekssx(someDate),
                        checkedIn: true,
                    },
                ],
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> =>
                service.checkIn(scrim.id, mockPlayerFactories.tekssx(someDate).userId);
            const expectedError = MatchmakingError.PlayerAlreadyCheckedIn;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Player should be checked into the scrim", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
                status: ScrimStatus.POPPED,
                players: [
                    mockPlayerFactories.hyper(someDate),
                    {
                        ...mockPlayerFactories.tekssx(someDate),
                        checkedIn: true,
                    },
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.nigel(someDate),
                ],
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudUpdatePlayer.mockResolvedValueOnce({});

            const expected = {
                ...scrim,
                players: [
                    {
                        ...mockPlayerFactories.hyper(someDate),
                        checkedIn: true,
                    },
                    {
                        ...mockPlayerFactories.tekssx(someDate),
                        checkedIn: true,
                    },
                    mockPlayerFactories.shuckle(someDate),
                    mockPlayerFactories.nigel(someDate),
                ],
            };

            publishScrimUpdate.mockReset();
            publishScrimUpdate.mockResolvedValueOnce(expected);

            const func = await service.checkIn(scrim.id, mockPlayerFactories.hyper(someDate).userId);

            expect(func).toEqual(expected);
            expect(crudUpdatePlayer).toHaveBeenCalledWith(scrim.id, {
                ...mockPlayerFactories.hyper(someDate),
                checkedIn: true,
            });
            expect(logicStartScrim).toHaveBeenCalledTimes(0);
        });

        it("Scrim should be started when the last player checks in", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
                status: ScrimStatus.POPPED,
                players: [
                    mockPlayerFactories.hyper(someDate),
                    {
                        ...mockPlayerFactories.tekssx(someDate),
                        checkedIn: true,
                    },
                ],
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudUpdatePlayer.mockResolvedValueOnce({});
            logicStartScrim.mockResolvedValueOnce({});

            const expected = {
                ...scrim,
                players: [
                    {
                        ...mockPlayerFactories.hyper(someDate),
                        checkedIn: true,
                    },
                    {
                        ...mockPlayerFactories.tekssx(someDate),
                        checkedIn: true,
                    },
                ],
            };

            publishScrimUpdate.mockReset();
            publishScrimUpdate.mockResolvedValueOnce(expected);

            const actual = await service.checkIn(scrim.id, mockPlayerFactories.hyper(someDate).userId);

            expect(actual).toEqual(expected);
            expect(crudUpdatePlayer).toHaveBeenCalledWith(scrim.id, {
                ...mockPlayerFactories.hyper(someDate),
                checkedIn: true,
            });
            expect(logicStartScrim).toHaveBeenCalledWith(expected);
        });
    });

    describe("Cancelling a Scrim", () => {
        it("Should throw with ScrimNotFound when someone attempts to cancel a scrim that doesn't exist", async () => {
            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.cancelScrim("hi shuckle");
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Scrim should be cancelled", async () => {
            const scrim: Scrim = {
                id: "scrim-hihellohowdy",
            } as Scrim;

            const expected = {
                ...scrim,
                status: ScrimStatus.CANCELLED,
            };

            crudGetScrim.mockResolvedValueOnce(expected);
            crudRemoveScrim.mockResolvedValueOnce({});

            const actual = await service.cancelScrim(expected.id);

            expect(actual).toEqual(expected);
            expect(crudRemoveScrim).toHaveBeenCalledWith(scrim.id);
        });
    });

    describe("Completing a Scrim", () => {
        it("Should throw with ScrimNotFound when someone tries to complete a scrim that doesn't exist", async () => {
            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.completeScrim("hi shuckle");
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with ScrimSubmissionNotFound when someone tries to complete a scrim that has no submission", async () => {
            const scrim: Scrim = {
                id: "hi shuckle",
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> => service.completeScrim(scrim.id);
            const expectedError = MatchmakingError.ScrimSubmissionNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Should throw with PlayerNotInScrim when a player tries to complete a scrim that they are not in", async () => {
            const scrim: Scrim = {
                id: "hi shuckle",
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.tekssx(someDate)],
                submissionId: "howdy, shuckle!",
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);

            const func = async (): Promise<Scrim> =>
                service.completeScrim(scrim.id, mockPlayerFactories.shuckle(someDate).userId);
            const expectedError = MatchmakingError.PlayerNotInScrim;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Scrim should be completed", async () => {
            const scrim: Scrim = {
                id: "hi shuckle",
                players: [mockPlayerFactories.hyper(someDate), mockPlayerFactories.tekssx(someDate)],
                submissionId: "howdy, shuckle!",
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudRemoveScrim.mockResolvedValueOnce({});

            const actual = await service.completeScrim(scrim.id, mockPlayerFactories.hyper(someDate).userId);
            const expected = {
                ...scrim,
                status: ScrimStatus.COMPLETE,
            };

            expect(actual).toEqual(expected);
            expect(crudRemoveScrim).toHaveBeenCalledWith(scrim.id);
        });
    });

    describe("Locking and Unlocking a Scrim", () => {
        it("Should throw with ScrimNotFound when someone tries to (un)lock a scrim that doesn't exist", async () => {
            crudGetScrim.mockResolvedValueOnce(null);

            const func = async (): Promise<Scrim> => service.setScrimLocked("bonjour!", false);
            const expectedError = MatchmakingError.ScrimNotFound;

            await expect(func).rejects.toThrow(expectedError);
        });

        it("Scrim should be unlocked", async () => {
            const scrim: Scrim = {
                id: "hi shuckle",
                status: ScrimStatus.LOCKED,
                unlockedStatus: ScrimStatus.IN_PROGRESS,
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudUpdateScrimStatus.mockResolvedValueOnce({});

            const actual = await service.setScrimLocked(scrim.id, false);
            const expected = {
                ...scrim,
                status: ScrimStatus.IN_PROGRESS,
            };

            expect(actual).toEqual(expected);
            expect(crudUpdateScrimStatus).toHaveBeenCalledWith(scrim.id, ScrimStatus.IN_PROGRESS);
        });

        it("Scrim should be locked", async () => {
            const scrim: Scrim = {
                id: "hi shuckle",
                status: ScrimStatus.IN_PROGRESS,
            } as Scrim;

            crudGetScrim.mockResolvedValueOnce(scrim);
            crudUpdateScrimUnlockedStatus.mockResolvedValueOnce({});
            crudUpdateScrimStatus.mockResolvedValueOnce({});

            const actual = await service.setScrimLocked(scrim.id, true);
            const expected = {
                ...scrim,
                status: ScrimStatus.LOCKED,
            };

            expect(actual).toEqual(expected);
            expect(crudUpdateScrimStatus).toHaveBeenCalledWith(scrim.id, ScrimStatus.LOCKED);
            expect(crudUpdateScrimUnlockedStatus).toHaveBeenCalledWith(scrim.id, ScrimStatus.IN_PROGRESS);
        });
    });
});
