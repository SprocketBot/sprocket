import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import type {
    AnalyticsEndpoint, AnalyticsResponse, CreateScrimOptions, Scrim,
} from "@sprocketbot/common";
import {
    AnalyticsModule, AnalyticsService, MatchmakingError, ScrimMode, ScrimStatus,
} from "@sprocketbot/common";
import {add} from "date-fns";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {ScrimModule} from "./scrim.module";
import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let {v4} = jest.createMockFromModule<typeof import("uuid")>("uuid");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
v4 = jest.fn(() => "hello!") as typeof v4;

describe("ScrimService", () => {
    let service: ScrimService;
    let scrimCrudService: ScrimCrudService;
    let eventProxyService: EventProxyService;
    let analyticsService: AnalyticsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ScrimModule,
                AnalyticsModule,
            ],
            providers: [ScrimService],
        }).compile();

        service = module.get<ScrimService>(ScrimService);
        scrimCrudService = module.get<ScrimCrudService>(ScrimCrudService);
        eventProxyService = module.get<EventProxyService>(EventProxyService);
        analyticsService = module.get<AnalyticsService>(AnalyticsService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("Should reject if already in a scrim", async () => {
        const createScrimData: CreateScrimOptions = {
            authorId: 1,
            organizationId: 1,
            gameModeId: 1,
            skillGroupId: 1,
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.ROUND_ROBIN,
                competitive: true,
                observable: false,
                checkinTimeout: 1234567890,
            },
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
            authorId: 1,
            organizationId: 1,
            gameModeId: 1,
            skillGroupId: 1,
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.ROUND_ROBIN,
                competitive: true,
                observable: false,
                checkinTimeout: 1234567890,
            },
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

    it("Should reject if round robin doesn't support groups", async () => {
        const createScrimData: CreateScrimOptions = {
            authorId: 1,
            organizationId: 1,
            gameModeId: 1,
            skillGroupId: 1,
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.TEAMS,
                competitive: true,
                observable: false,
                checkinTimeout: 1234567890,
            },
            join: {
                playerId: 1,
                playerName: "HyperCoder",
                leaveAfter: 1000,
                createGroup: true,
            },
        };

        const scrim: Scrim = {
            id: "hello world!",
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ScrimStatus.PENDING,
            authorId: 1,
            organizationId: 1,
            gameModeId: 1,
            skillGroupId: 1,
            players: [
                {
                    id: 1,
                    name: "HyperCoder",
                    joinedAt: new Date(),
                    leaveAt: add(new Date(), {seconds: 1000}),
                },
            ],
            games: undefined,
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.ROUND_ROBIN,
                competitive: true,
                observable: false,
                checkinTimeout: 1234567890,
            },
        };
        
        jest.spyOn(scrimCrudService, "playerInAnyScrim").mockImplementation(async () => false);
        jest.spyOn(scrimCrudService, "createScrim").mockImplementation(async () => scrim);
        jest.spyOn(scrimCrudService, "updatePlayer").mockImplementation(async () => {});
        jest.spyOn(eventProxyService, "publish").mockImplementation(async () => true);
        jest.spyOn(analyticsService, "send").mockImplementation(async () => ({} as AnalyticsResponse<AnalyticsEndpoint.Analytics>));
        expect(await service.createScrim(createScrimData)).toBe(scrim);
    });
});
