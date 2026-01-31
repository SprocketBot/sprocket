/* eslint-disable @typescript-eslint/unbound-method */
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {getDataSourceToken} from "@nestjs/typeorm";
import type {BallchasingResponse} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";
import type {EntityManager} from "typeorm";
import {DataSource} from "typeorm";

import type {Match} from "../../../database/scheduling/match/match.model";
import {GameSkillGroupService} from "../../../franchise/game-skill-group/game-skill-group.service";
import {PlayerService} from "../../../franchise/player/player.service";
import {TeamService} from "../../../franchise/team/team.service";
import {MledbPlayerService} from "../../../mledb/mledb-player/mledb-player.service";
import {MledbFinalizationService} from "../../../mledb/mledb-scrim/mledb-finalization.service";
import {EligibilityService} from "../../../scheduling/eligibility/eligibility.service";
import {MatchService} from "../../../scheduling/match/match.service";
import {SprocketRatingService} from "../../../sprocket-rating/sprocket-rating.service";
import type {MatchReplaySubmission} from "../../types";
import {BallchasingConverterService} from "../ballchasing-converter/ballchasing-converter.service";
import {MATCH_SUBMISSION_FIXTURE_RATIFYING} from "./fixtures/MatchSubmission.fixture";
import {RocketLeagueFinalizationService} from "./rocket-league-finalization.service";

describe("BetterFinalizationService", () => {
    let service: RocketLeagueFinalizationService;
    let playerService: PlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RocketLeagueFinalizationService,
                {
                    provide: PlayerService,
                    useValue: {
                        getPlayer: jest.fn(),
                    },
                },
                {
                    provide: MatchService,
                    useValue: {
                        getMatchById: jest.fn(),
                        getFranchisesForMatch: jest.fn(),
                    },
                },
                {
                    provide: SprocketRatingService,
                    useValue: {
                        calcSprocketRating: jest.fn(),
                    },
                },
                {
                    provide: MledbPlayerService,
                    useValue: {
                        getMlePlayerBySprocketUser: jest.fn(),
                    },
                },
                {
                    provide: TeamService,
                    useValue: {
                        getTeam: jest.fn(),
                    },
                },
                {
                    provide: BallchasingConverterService,
                    useValue: {
                        createRound: jest.fn(),
                    },
                },
                {
                    provide: MledbFinalizationService,
                    useValue: {
                        saveScrim: jest.fn(),
                        saveMatch: jest.fn(),
                    },
                },
                {
                    provide: EligibilityService,
                    useValue: {
                        getEligibilityPointsForPlayer: jest.fn(),
                    },
                },
                {
                    provide: GameSkillGroupService,
                    useValue: {
                        getGameSkillGroupById: jest.fn(),
                    },
                },
                {
                    provide: getDataSourceToken(),
                    useValue: {
                        createQueryRunner: jest.fn(),
                    },
                },
            ],
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
            const mockedValue = {
                id: -1,
                items: [ {progress: {status: ProgressStatus.Pending, result: {data: {} } } } ],
            } as unknown as MatchReplaySubmission;
            await expect(service
                .saveMatchDependents(
                    mockedValue,
                    {id: 0} as unknown as Match,
                    false,
                    {} as unknown as EntityManager,
                )
                .catch((e: Error) => e.message.toString())).resolves.toContain("Not all items have been completed.");
        });

        it("Should throw an error if the replays do not match the expected values.", async () => {
            const filename = "somefile.replay";
            const mockedValue = {
                items: [
                    {
                        originalFilename: filename,
                        progress: {status: ProgressStatus.Complete, result: {data: {} } },
                    },
                ],
            } as unknown as MatchReplaySubmission;

            await expect(service
                .saveMatchDependents(
                    mockedValue,
                    undefined as unknown as Match,
                    false,
                    {} as unknown as EntityManager,
                )
                .catch((e: Error) => e.message.toString())).resolves.toContain(filename);
        });
    });
});
