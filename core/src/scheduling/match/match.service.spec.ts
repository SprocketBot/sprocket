// Must be hoisted before any imports that transitively load elo-connector.module,
// which reads Redis secrets at module evaluation time.
jest.mock("../../elo/elo-connector", () => ({
    EloConnectorService: jest.fn(),
    EloEndpoint: {
        CalculateEloForMatch: "CalculateEloForMatch",
        CalculateEloForNcp: "CalculateEloForNcp",
    },
    GameMode: {DOUBLES: "DOUBLES", STANDARD: "STANDARD"},
    TeamColor: {BLUE: "blue", ORANGE: "orange"},
}));

import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {GameMode} from "$db/game/game_mode/game_mode.model";
import {Team} from "$db/franchise/team/team.model";
import {Invalidation} from "$db/scheduling/invalidation/invalidation.model";
import {Match} from "$db/scheduling/match/match.model";
import {MatchParent} from "$db/scheduling/match_parent/match_parent.model";
import {Round} from "$db/scheduling/round/round.model";
import {EloConnectorService} from "../../elo/elo-connector";
import {PopulateService} from "../../util/populate/populate.service";
import createMockRepository from "../../util/MockRepository";
import {MatchService} from "./match.service";

describe("MatchService", () => {
    let service: MatchService;
    let roundRepository: ReturnType<typeof createMockRepository>;
    let teamRepository: ReturnType<typeof createMockRepository>;
    let matchRepository: ReturnType<typeof createMockRepository>;
    let populateService: {populateOneOrFail: jest.Mock};
    let eloConnectorService: {createJob: jest.Mock};

    beforeEach(async () => {
        populateService = {populateOneOrFail: jest.fn()};
        eloConnectorService = {createJob: jest.fn()};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchService,
                {provide: getRepositoryToken(Round), useValue: createMockRepository()},
                {provide: getRepositoryToken(Team), useValue: createMockRepository()},
                {provide: getRepositoryToken(Match), useValue: createMockRepository()},
                {provide: getRepositoryToken(MatchParent), useValue: createMockRepository()},
                {provide: getRepositoryToken(Invalidation), useValue: createMockRepository()},
                {provide: getRepositoryToken(GameMode), useValue: createMockRepository()},
                {provide: DataSource, useValue: {}},
                {provide: PopulateService, useValue: populateService},
                {provide: EloConnectorService, useValue: eloConnectorService},
            ],
        }).compile();

        service = module.get<MatchService>(MatchService);
        roundRepository = module.get(getRepositoryToken(Round));
        teamRepository = module.get(getRepositoryToken(Team));
        matchRepository = module.get(getRepositoryToken(Match));
    });

    // Shared helper: sets up the mock chain needed to reach the post-fixture-lookup
    // section of markReplaysNcp. homeFranchiseId controls which team "owns" the home side.
    function setupFixturePath(homeFranchiseId: number): void {
        matchRepository.findOneOrFail.mockResolvedValue({
            matchParent: {fixture: {homeFranchiseId}},
        });
        populateService.populateOneOrFail
            .mockResolvedValueOnce({id: homeFranchiseId})  // homeFranchise
            .mockResolvedValueOnce({})                      // homeFranchise.profile
            .mockResolvedValueOnce({id: homeFranchiseId + 10})  // awayFranchise
            .mockResolvedValueOnce({});                     // awayFranchise.profile
    }

    describe("markReplaysNcp", () => {
        it("returns early with an error string when isNcp=true and no winning team is provided", async () => {
            teamRepository.findOne.mockResolvedValue(null);

            const result = await service.markReplaysNcp([1], true, undefined);

            expect(result).toBe("Winning team must be specified if NCPing replays");
            // Round repository must NOT be touched when the guard fires
            expect(roundRepository.findOneOrFail).not.toHaveBeenCalled();
        });

        it("excludes dummy replays from the elo recalculation job", async () => {
            teamRepository.findOne.mockResolvedValue({
                id: 49, franchise: {id: 10, profile: {title: "Test Franchise"}},
            });
            roundRepository.findOneOrFail
                .mockResolvedValueOnce({id: 1, isDummy: false, match: {id: 99, skillGroupId: 1}, teamStats: []})
                .mockResolvedValueOnce({id: 2, isDummy: true, match: {id: 99, skillGroupId: 1}, teamStats: []});
            setupFixturePath(10);
            teamRepository.findOneOrFail.mockResolvedValue({id: 49});

            await service.markReplaysNcp([1, 2], true, {id: 49} as Team);

            expect(eloConnectorService.createJob).toHaveBeenCalledWith(
                "CalculateEloForNcp",
                {roundIds: [1], isNcp: true},
            );
        });

        it("deletes dummy replays instead of saving them when un-NCPing", async () => {
            teamRepository.findOne.mockResolvedValue(null); // winningTeam not required when isNcp=false
            roundRepository.findOneOrFail.mockResolvedValue({
                id: 1, isDummy: true, match: {id: 99, skillGroupId: 1}, teamStats: [],
            });
            setupFixturePath(10);
            teamRepository.findOneOrFail.mockResolvedValue({id: 50});

            await service.markReplaysNcp([1], false);

            expect(roundRepository.delete).toHaveBeenCalledWith(1);
            expect(roundRepository.save).not.toHaveBeenCalled();
        });
    });
});
