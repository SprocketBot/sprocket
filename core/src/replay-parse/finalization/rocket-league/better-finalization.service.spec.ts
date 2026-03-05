/* eslint-disable @typescript-eslint/unbound-method */
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {getDataSourceToken} from "@nestjs/typeorm";
import type {BallchasingResponse} from "@sprocketbot/common";
import {CarballConverterService, ProgressStatus} from "@sprocketbot/common";
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
import {GameMode} from "../../../database/game/game_mode/game_mode.model";
import type {BallchasingPlayer} from "@sprocketbot/common";

describe("BetterFinalizationService", () => {
    let service: RocketLeagueFinalizationService;
    let playerService: PlayerService;
    let sprocketRatingService: SprocketRatingService;
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
                
                    SprocketRatingService,
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
                {
                    provide: CarballConverterService,
                    useValue:{
                        createRound: jest.fn()
                    }
                }
            ],
        }).compile();

        service = module.get<RocketLeagueFinalizationService>(RocketLeagueFinalizationService);
        playerService = module.get<PlayerService>(PlayerService);
        sprocketRatingService = module.get(SprocketRatingService);
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


    describe("_getSprocketRating", () => {
        it("Should return correct sprocket rating using rawPlayer.stats.core values directly", () => {
            const mockPlayer = {
                stats: {
                    core: {
                        goals: 9.0 / 5.0,
                        assists: 8.0 / 5.0,
                        shots: 28.0 / 5.0,
                        saves: 5.0 / 5.0,
                        goals_against: 7.0 / 5.0,
                        shots_against: 24.0 / 5.0,
                    },
                },
            } as unknown as BallchasingPlayer;

            const mockGameMode = {
                teamSize: 2,
            } as unknown as GameMode;

            const result = service._getSprocketRating(mockPlayer, mockGameMode);

            expect(Math.round(result.opi * 10.0) / 10.0).toStrictEqual(85.1);
            expect(Math.round(result.dpi * 10.0) / 10.0).toStrictEqual(77.1);
            expect(Math.round(result.gpi * 10.0) / 10.0).toStrictEqual(81.1);
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
