import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {
    AnalyticsEndpoint,
    AnalyticsResponse,
    CreateScrimOptions,
    JoinScrimOptions,
    Scrim,
    ScrimPlayer,
    ScrimSettings,
} from "@sprocketbot/common";
import {
    AnalyticsModule,
    AnalyticsService,
    MatchmakingError,
    ScrimMode,
    ScrimStatus,
} from "@sprocketbot/common";
import {add} from "date-fns";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {ScrimModule} from "./scrim.module";
import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";

function scrimSettings(
    teamSize: number,
    teamCount: number,
    mode: ScrimMode,
    competitive: boolean,
    observable: boolean,
    checkinTimeout: number,
): ScrimSettings {
    return {
        teamSize, teamCount, mode, competitive, observable, checkinTimeout,
    };
}

function scrimPlayer(
    id: number,
    name: string,
    joinedAt: Date,
    leaveAt: Date,
    group?: string,
): ScrimPlayer {
    return {
        id, name, joinedAt, leaveAt, group,
    };
}

function scrimIds(
    authorId: number = 1,
    organizationId: number = 1,
    gameModeId: number = 1,
    skillGroupId: number = 1,
): {
        authorId: number;
        organizationId: number;
        gameModeId: number;
        skillGroupId: number;
    } {
    return {
        authorId, organizationId, gameModeId, skillGroupId,
    };
}

describe("ScrimService", () => {
    let service: ScrimService;
    let scrimCrudService: ScrimCrudService;
    let scrimLogicService: ScrimLogicService;
    let eventProxyService: EventProxyService;
    let analyticsService: AnalyticsService;
    let scrimGroupService: ScrimGroupService;

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
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
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
    
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => true);
            await expect(async () => service.createScrim(createScrimData)).rejects.toThrow(MatchmakingError.PlayerAlreadyInScrim);
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
    
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            await expect(async () => service.createScrim(createScrimData)).rejects.toThrow(MatchmakingError.ScrimGroupNotSupportedInMode);
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
    
            const startDate = new Date();
    
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
    
            const scrimAfter: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
            
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            jest.spyOn(scrimCrudService, "createScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "updatePlayer").mockImplementation(async () => {});
            jest.spyOn(eventProxyService, "publish").mockImplementation(async () => true);
            jest.spyOn(analyticsService, "send").mockImplementation(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
            expect(await service.createScrim(createScrimData)).toEqual(scrimAfter);
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
    
            const startDate = new Date();
    
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
    
            const scrimAfter: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000}), "tekssxisbad"),
                ],
                games: undefined,
                settings: createScrimData.settings,
            };
            
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            jest.spyOn(scrimCrudService, "createScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimGroupService, "resolveGroupKey").mockImplementation(() => "tekssxisbad");
            jest.spyOn(scrimCrudService, "updatePlayer").mockImplementation(async () => {});
            jest.spyOn(eventProxyService, "publish").mockImplementation(async () => true);
            jest.spyOn(analyticsService, "send").mockImplementation(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
            expect(await service.createScrim(createScrimData)).toEqual(scrimAfter);
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
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => null);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.ScrimNotFound);
        });
    
        it("Should throw with ScrimAlreadyInProgress when a player tries to join a scrim when it is already in progress", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.IN_PROGRESS,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(1, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.ScrimAlreadyInProgress);
        });
    
        it("Should throw with PlayerAlreadyInScrim when a player tries to join a scrim when they are already in a scrim", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => true);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.PlayerAlreadyInScrim);
        });
    
        it("Should throw with GroupNotFound when a player tries to join a group with an invalid group", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisawful",
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000}), "tekssxisbad"),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.GroupNotFound);
        });
    
        it("Should throw with GroupFull when a player tries to join a group when the group has the number of players on a team", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                joinGroup: "tekssxisbad",
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000}), "tekssxisbad"),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000}), "tekssxisbad"),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.GroupFull);
        });
    
        it("Should throw with MaxGroupsCreated when a player tries to create a group when there are already the number teams being the number of groups", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
                createGroup: true,
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000}), "tekssxisbad"),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000}), "tekssxisawful"),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            await expect(async () => service.joinScrim(joinScrimData)).rejects.toThrow(MatchmakingError.MaxGroupsCreated);
        });
    
        it("Player should join the scrim successfully", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 2,
                playerName: "tekssx",
                leaveAfter: 1000,
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            const scrimAfter: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(2, "tekssx", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            jest.spyOn(scrimCrudService, "addPlayerToScrim").mockImplementation(async () => {});
            jest.spyOn(analyticsService, "send").mockImplementation(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
            jest.spyOn(service, "publishScrimUpdate").mockImplementation(async () => scrimAfter);
            expect(await service.joinScrim(joinScrimData)).toEqual(true);
        });
    
        it("The scrim should pop when the last player joins and it is full", async () => {
            const joinScrimData: JoinScrimOptions = {
                scrimId: "hello world!",
                playerId: 4,
                playerName: "Nigel Thornbrake",
                leaveAfter: 1000,
            };
            const startDate = new Date();
            const scrim: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(2, "tekssx", startDate, add(startDate, {seconds: 1000})),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            const scrimAfter: Scrim = {
                id: "hello world!",
                createdAt: startDate,
                updatedAt: startDate,
                status: ScrimStatus.PENDING,
                ...scrimIds(),
                players: [
                    scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(3, "shuckle", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(2, "tekssx", startDate, add(startDate, {seconds: 1000})),
                    scrimPlayer(4, "Nigel Thornbrake", expect.any(Date) as Date, expect.any(Date) as Date),
                ],
                games: undefined,
                settings: scrimSettings(2, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
            };
    
            const popScrim = jest.spyOn(scrimLogicService, "popScrim");
            jest.spyOn(scrimCrudService, "getScrim").mockImplementation(async () => scrim);
            jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
            jest.spyOn(scrimCrudService, "addPlayerToScrim").mockImplementation(async () => {});
            jest.spyOn(analyticsService, "send").mockImplementation(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
            popScrim.mockImplementation(async () => {});
            jest.spyOn(service, "publishScrimUpdate").mockImplementation(async () => scrimAfter);
            expect(await service.joinScrim(joinScrimData)).toEqual(true);
            expect(popScrim).toHaveBeenCalledWith(scrimAfter);
        });
    });
});
