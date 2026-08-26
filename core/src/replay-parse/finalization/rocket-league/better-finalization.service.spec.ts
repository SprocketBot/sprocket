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
import {ReplaySubmissionType} from "../../types";

const SUMMARY_ONLY_CARBALL_REPLAY = {
    game_metadata: {
        id: "summary-only-replay",
        name: "Summary Only Replay",
        map: "dfh_stadium",
        time: "1710000000",
        length: 300,
        team_size: 2,
        playlist: 6,
        match_guid: "summary-match-guid",
        score: {
            team_0_score: 2,
            team_1_score: 1,
        },
        goals: [
            {player_id: {id: "blue-1", platform: "steam"} },
            {player_id: {id: "orange-1", platform: "epic"} },
            {player_id: {id: "blue-1", platform: "steam"} },
        ],
    },
    players: [
        {id: {id: "blue-1", platform: "steam"}, name: "Blue One", is_orange: 0},
        {id: {id: "blue-2", platform: "steam"}, name: "Blue Two", is_orange: 0},
        {id: {id: "orange-1", platform: "epic"}, name: "Orange One", is_orange: 1},
        {id: {id: "orange-2", platform: "epic"}, name: "Orange Two", is_orange: 1},
    ],
    teams: [
        {
            is_orange: false,
            score: 2,
            player_ids: [
                {id: "blue-1", platform: "steam"},
                {id: "blue-2", platform: "steam"},
            ],
        },
        {
            is_orange: true,
            score: 1,
            player_ids: [
                {id: "orange-1", platform: "epic"},
                {id: "orange-2", platform: "epic"},
            ],
        },
    ],
};

describe("BetterFinalizationService", () => {
    let service: RocketLeagueFinalizationService;
    let playerService: PlayerService;
    let sprocketRatingService: SprocketRatingService;
    let ballchasingConverter: BallchasingConverterService;
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
                    useValue: new CarballConverterService(),
                },
            ],
        }).compile();

        service = module.get<RocketLeagueFinalizationService>(RocketLeagueFinalizationService);
        playerService = module.get<PlayerService>(PlayerService);
        sprocketRatingService = module.get(SprocketRatingService);
        ballchasingConverter = module.get(BallchasingConverterService);
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

        it("Should finalize degraded summary-only carball payloads without frame stats", async () => {
            const playerLookups = [
                {id: 1, member: {userId: 11} },
                {id: 2, member: {userId: 12} },
                {id: 3, member: {userId: 13} },
                {id: 4, member: {userId: 14} },
            ];
            jest.spyOn(playerService, "getPlayer")
                .mockResolvedValueOnce(playerLookups[0] as any)
                .mockResolvedValueOnce(playerLookups[1] as any)
                .mockResolvedValueOnce(playerLookups[2] as any)
                .mockResolvedValueOnce(playerLookups[3] as any);
            jest.spyOn(ballchasingConverter, "createRound").mockReturnValue({round: "stats"} as any);

            const submission = {
                id: "submission-1",
                type: ReplaySubmissionType.SCRIM,
                items: [
                    {
                        originalFilename: "summary-only.replay",
                        outputPath: "dev/v4/summary-only.json",
                        progress: {
                            status: ProgressStatus.Complete,
                            result: {
                                parser: "carball",
                                parserVersion: 4,
                                analysisMode: "summary-only",
                                outputPath: "dev/v4/summary-only.json",
                                data: SUMMARY_ONLY_CARBALL_REPLAY,
                            },
                        },
                    },
                ],
            } as unknown as MatchReplaySubmission;
            const em = {
                create: jest.fn(() => ({})),
                insert: jest.fn().mockResolvedValue(undefined),
            } as unknown as EntityManager;
            const match = {
                id: 42,
                gameMode: {teamSize: 2},
                rounds: [],
            } as unknown as Match;

            const players = await service.saveMatchDependents(submission, match, false, em);

            expect(players).toHaveLength(4);
            expect(ballchasingConverter.createRound).toHaveBeenCalledTimes(1);
            expect((em.insert as jest.Mock).mock.calls).toHaveLength(4);
        });
    });
});
