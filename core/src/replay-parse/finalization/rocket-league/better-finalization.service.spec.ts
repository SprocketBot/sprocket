/* eslint-disable @typescript-eslint/unbound-method */
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { BallchasingResponse } from "@sprocketbot/common";
import { ProgressStatus } from "@sprocketbot/common";
import type { EntityManager } from "typeorm";

import type { Match } from "../../../database/scheduling/match/match.model";
import { PlayerService } from "../../../franchise";
import type { MatchReplaySubmission } from "../../types";
import { MATCH_SUBMISSION_FIXTURE_RATIFYING } from "./fixtures/MatchSubmission.fixture";
import { RocketLeagueFinalizationService } from "./rocket-league-finalization.service";

describe("BetterFinalizationService", () => {
    let service: RocketLeagueFinalizationService;
    let playerService: PlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RocketLeagueFinalizationService,
                {
                    provide: PlayerService,
                    useValue: {
                        getPlayer: jest.fn,
                    },
                }],
        }).compile();

        service = module.get<RocketLeagueFinalizationService>(RocketLeagueFinalizationService);
        playerService = module.get<PlayerService>(PlayerService);

    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("_getBallchasingPlayers", () => {
        it("Should be do one lookup for each player", async () => {
            jest.spyOn(playerService, "getPlayer");

            const allResults = MATCH_SUBMISSION_FIXTURE_RATIFYING.items.map(x => x.progress.result.data);

            await service._getBallchasingPlayers(allResults[0] as BallchasingResponse);

            expect(playerService.getPlayer).toBeCalledTimes(4);
        });
    });

    describe("saveMatch", () => {
        it("Should throw an error if the submission contains incomplete values", async () => {
            const mockedValue = { id: -1, items: [{ progress: { status: ProgressStatus.Pending, result: { data: {} } } }] } as unknown as MatchReplaySubmission;
            await expect(service.saveMatchDependents(
                mockedValue,
                -1,
                { id: 0 } as unknown as Match,
                false,
                {} as unknown as EntityManager,
            ).catch((e: Error) => e.message.toString())).resolves.toContain("Not all items have been completed.");
        });

        it("Should throw an error if the replays do not match the expected values.", async () => {
            const filename = "somefile.replay";
            const mockedValue = { items: [{ originalFilename: filename, progress: { status: ProgressStatus.Complete, result: { data: {} } } }] } as unknown as MatchReplaySubmission;

            await expect(service.saveMatchDependents(
                mockedValue,
                -1,
                undefined as unknown as Match,
                false,
                {} as unknown as EntityManager,
            ).catch((e: Error) => e.message.toString())).resolves.toContain(filename);
        });
    });
});
