import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {
    AnalyticsEndpoint,
    AnalyticsResponse,
    CreateScrimOptions,
    JoinScrimOptions,
    Scrim,
} from "@sprocketbot/common";
import {
    AnalyticsModule,
    AnalyticsService,
    MatchmakingError,
    ScrimMode,
    ScrimStatus,
} from "@sprocketbot/common";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {ScrimModule} from "./scrim.module";
import {ScrimService} from "./scrim.service";
import {
    players, scrimIds, scrimSettings,
} from "./scrim.service.helpers.spec";
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

    let playerInAnyScrim: jest.SpyInstance;
    let createScrim: jest.SpyInstance;
    let updatePlayer: jest.SpyInstance;
    let getScrim: jest.SpyInstance;
    let addPlayerToScrim: jest.SpyInstance;
    let removePlayerFromScrim: jest.SpyInstance;

    let popScrim: jest.SpyInstance;
    let deleteScrim: jest.SpyInstance;

    let resolveGroupKey: jest.SpyInstance;

    const someDate = new Date();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ScrimModule,
                AnalyticsModule,
            ],
            providers: [
                ScrimService,
            ],
        }).compile();

        service = module.get<ScrimService>(ScrimService);
        scrimCrudService = module.get<ScrimCrudService>(ScrimCrudService);
        scrimLogicService = module.get<ScrimLogicService>(ScrimLogicService);
        eventProxyService = module.get<EventProxyService>(EventProxyService);
        analyticsService = module.get<AnalyticsService>(AnalyticsService);
        scrimGroupService = module.get<ScrimGroupService>(ScrimGroupService);
        
        jest.spyOn(eventProxyService, "publish").mockImplementationOnce(async () => true);
        jest.spyOn(analyticsService, "send").mockImplementationOnce(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
        jest.spyOn(service, "publishScrimUpdate").mockImplementationOnce(async () => ({} as Scrim));

        playerInAnyScrim = jest.spyOn(scrimCrudService, "playerInAnyScrim");
        createScrim = jest.spyOn(scrimCrudService, "createScrim");
        updatePlayer = jest.spyOn(scrimCrudService, "updatePlayer");
        getScrim = jest.spyOn(scrimCrudService, "getScrim");
        addPlayerToScrim = jest.spyOn(scrimCrudService, "addPlayerToScrim");
        removePlayerFromScrim = jest.spyOn(scrimCrudService, "removePlayerFromScrim");

        popScrim = jest.spyOn(scrimLogicService, "popScrim");
        deleteScrim = jest.spyOn(scrimLogicService, "deleteScrim");

        resolveGroupKey = jest.spyOn(scrimGroupService, "resolveGroupKey");
    });

    describe("Creating a Scrim", () => {
        it("Should throw with PlayerAlreadyInScrim when a player tries to join a scrim while in another scrim", async () => {
            const createScrimData: CreateScrimOptions = {
                ...scrimIds(),
                settings: scrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    playerId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                },
            };
    
            playerInAnyScrim.mockImplementationOnce(async () => true);

            const actual = async (): Promise<Scrim> => service.createScrim(createScrimData);
            const expected = MatchmakingError.PlayerAlreadyInScrim;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with ScimGroupNotSupported when a player tries to create a round robin scrim with groups", async () => {
            const createScrimData: CreateScrimOptions = {
                ...scrimIds(),
                settings: scrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    playerId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                    createGroup: true,
                },
            };
    
            playerInAnyScrim.mockImplementationOnce(async () => false);

            const actual = async (): Promise<Scrim> => service.createScrim(createScrimData);
            const expected = MatchmakingError.ScrimGroupNotSupportedInMode;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should create a Round Robin scrim successfully", async () => {
            const createScrimData: CreateScrimOptions = {
                ...scrimIds(),
                settings: scrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
                join: {
                    playerId: 1,
                    playerName: "HyperCoder",
                    leaveAfter: 1000,
                },
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
            
            playerInAnyScrim.mockImplementationOnce(async () => false);
            createScrim.mockImplementationOnce(async () => scrim);
            updatePlayer.mockImplementationOnce(async () => {});

            const actual = await service.createScrim(createScrimData);
            const expected: Scrim = scrim;

            expect(actual).toEqual(expected);
        });
    
        it("Should create a Teams scrim with a group successfully", async () => {
            const createScrimData: CreateScrimOptions = {
                ...scrimIds(),
                settings: scrimSettings(3, 2, ScrimMode.TEAMS, true, false, 1000),
                join: {
                    playerId: 1,
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
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
            
            playerInAnyScrim.mockImplementationOnce(async () => false);
            createScrim.mockImplementationOnce(async () => scrim);
            resolveGroupKey.mockImplementationOnce(() => "tekssxisbad");
            updatePlayer.mockImplementationOnce(async () => {});

            const actual = await service.createScrim(createScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    players.hyper(someDate, "tekssxisbad"),
                ],
            };

            expect(actual).toEqual(expected);
        });
    });

    describe("Joining a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tries to join a scrim that doesn't exist", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!!!!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
    
            getScrim.mockImplementationOnce(async () => null);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.ScrimNotFound;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with ScrimAlreadyInProgress when a player tries to join a scrim when it is already in progress", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.IN_PROGRESS,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(1, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.ScrimAlreadyInProgress;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with PlayerAlreadyInScrim when a player tries to join a scrim when they are already in a scrim", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => true);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.PlayerAlreadyInScrim;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with GroupNotFound when a player tries to join a group with an invalid group", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisawful",
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate, "tekssxisbad"),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => false);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.GroupNotFound;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with GroupFull when a player tries to join a group when the group has the number of players on a team", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisbad",
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate, "tekssxisbad"),
                    players.shuckle(someDate, "tekssxisbad"),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => false);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.GroupFull;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Should throw with MaxGroupsCreated when a player tries to create a group when there are already the number teams being the number of groups", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                createGroup: true,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate, "tekssxisbad"),
                    players.shuckle(someDate, "tekssxisawful"),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => false);

            const actual = async (): Promise<Scrim> => service.joinScrim(joinScrimData);
            const expected = MatchmakingError.MaxGroupsCreated;

            await expect(actual).rejects.toThrow(expected);
        });
    
        it("Player should join the scrim successfully", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => false);
            addPlayerToScrim.mockImplementationOnce(async () => {});

            const actual = await service.joinScrim(joinScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                    players.tekssx(expect.any(Date) as Date),
                ],
            };

            expect(actual).toEqual(expected);
        });
    
        it("The scrim should pop when the last player joins and it is full", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 4,
                playerName: "Nigel Thornbrake",
                leaveAfter: 1000,
            };
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                    players.tekssx(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            getScrim.mockImplementationOnce(async () => scrim);
            playerInAnyScrim.mockImplementationOnce(async () => false);
            addPlayerToScrim.mockImplementationOnce(async () => {});
            popScrim.mockImplementationOnce(async () => {});

            const actual = await service.joinScrim(joinScrimData);
            const expected: Scrim = {
                ...scrim,
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                    players.tekssx(someDate),
                    players.nigel(expect.any(Date) as Date),
                ],
            };

            expect(actual).toEqual(expected);
            expect(popScrim).toHaveBeenCalledWith(expected);
        });
    });

    describe("Leaving a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tires to leave a scrim that doesn't exist", async () => {
            getScrim.mockImplementationOnce(async () => null);

            await expect(async () => service.leaveScrim("hi Nigel", 2)).rejects.toThrow(MatchmakingError.ScrimNotFound);
        });

        it("Should throw with ScrimAlreadyInProgress when a player tires to leave a scrim that is no longer pending", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.POPPED,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            getScrim.mockImplementationOnce(async () => scrim);

            const actual = async (): Promise<Scrim> => service.leaveScrim("hello world!", players.shuckle(someDate).id);
            const expected = MatchmakingError.ScrimAlreadyInProgress;
            
            await expect(actual).rejects.toThrow(expected);
        });

        it("Should throw with PlayerNotInScrim when a player tires to leave a scrim they are not in", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            getScrim.mockImplementationOnce(async () => scrim);

            const actual = async (): Promise<Scrim> => service.leaveScrim("hello world!", players.tekssx(someDate).id);
            const expected = MatchmakingError.PlayerNotInScrim;

            await expect(actual).rejects.toThrow(expected);
        });

        it("Scrim should be deleted if the player leaving is the only player in the scrim", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            getScrim.mockImplementationOnce(async () => scrim);
            deleteScrim.mockImplementationOnce(async () => {});

            const actual = await service.leaveScrim("hello world!", players.hyper(someDate).id);
            const expected: Scrim = {
                ...scrim,
                players: [],
            };

            expect(actual).toEqual(expected);
            expect(deleteScrim).toHaveBeenCalledWith(expected);
        });

        it("Player should be removed from the scrim", async () => {
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: someDate,
                updatedAt: someDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    players.hyper(someDate),
                    players.shuckle(someDate),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };

            getScrim.mockImplementationOnce(async () => scrim);
            removePlayerFromScrim.mockImplementationOnce(async () => {});

            const actual = await service.leaveScrim("hello world!", players.shuckle(someDate).id);
            const expected: Scrim = {
                ...scrim,
                players: [
                    players.hyper(someDate),
                ],
            };

            expect(actual).toStrictEqual(expected);
            expect(removePlayerFromScrim).toHaveBeenCalledWith(scrim.id, players.shuckle(someDate).id);
        });
    });

    describe("Checking Into a Scrim", () => {
        it("Should throw with ScrimNotFound when a player tries to check into a scrim that doesn't exist", async () => {

        });

        it("Should throw with ScrimStatusNotPopped when a player tries to check into a scrim that isn't popped", async () => {

        });

        it("Should throw with PlayerNotInScrim when a player tries to check into a scrim they are not in", async () => {

        });

        it("Should throw with PlayerAlreadyCheckedIn when a player tries to check into a scrim they already checked into", async () => {

        });

        it("Player should be checked into the scrim", async () => {

        });
    });

    describe("Cancelling a Scrim", () => {
        it("Should throw with ScrimNotFound when someone attempts to cancel a scrim that doesn't exist", async () => {

        });

        it("Scrim should be cancelled", async () => {

        });
    });

    describe("Completing a Scrim", () => {
        it("Should throw with ScrimNotFound when someone tries to complete a scrim that doesn't exist", async () => {

        });

        it("Should throw with ScrimSubmissionNotFound when someone tries to complete a scrim that has no submission", async () => {

        });

        it("Should throw with PlayerNotInScrim when a player tries to complete a scrim that they are not in", async () => {

        });

        it("Scrim should be completed", async () => {

        });
    });

    describe("Locking and Unlocking a Scrim", () => {
        it("Should throw with ScrimNotFound when someone tries to (un)lock a scrim that doesn't exist", async () => {

        });

        it("Scrim should be (un)locked", async () => {

        });
    });

    describe("Developers", () => {
        it("Zach should be happy", () => {
            expect(true).toEqual(true);
        });
    });
});
