import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {
    AnalyticsEndpoint,
    AnalyticsResponse,
    CreateScrimOptions,
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
        eventProxyService = module.get<EventProxyService>(EventProxyService);
        analyticsService = module.get<AnalyticsService>(AnalyticsService);
        scrimGroupService = module.get<ScrimGroupService>(ScrimGroupService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("Should reject if already in a scrim", async () => {
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

    it("Should reject if round robin doesn't support groups", async () => {
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

    it("Should create a teams scrim with a group", async () => {
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
            settings: scrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
        };

        const scrimAfter: Scrim = {
            id: "hello world!",
            createdAt: startDate,
            updatedAt: startDate,
            status: ScrimStatus.PENDING,
            ...scrimIds(),
            players: [
                scrimPlayer(1, "HyperCoder", startDate, add(startDate, {seconds: 1000}), "tekssx"),
            ],
            games: undefined,
            settings: scrimSettings(3, 2, ScrimMode.ROUND_ROBIN, true, false, 1000),
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
