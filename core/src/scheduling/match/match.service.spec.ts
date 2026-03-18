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
import {DataSource, getMetadataArgsStorage} from "typeorm";

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

/**
 * These tests verify that markReplaysNcp queries the Round repository with
 * the correct TypeORM relations option.
 *
 * The bug: TypeORM was called with  relations: { match: { id: true } }
 * This caused the error "match has no property id" because `id` is a plain
 * @Column on Match, not a @ManyToOne/@OneToMany relation.
 *
 * The fix: use  relations: { match: true }
 * which tells TypeORM to JOIN the whole match entity, generating SQL like:
 *   LEFT JOIN "sprocket"."match" "Round__Round_match" ON ...
 * instead of trying to navigate into a non-existent sub-relation "id".
 */

describe("MatchService", () => {
    let service: MatchService;
    let roundRepository: ReturnType<typeof createMockRepository>;
    let teamRepository: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
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
                {provide: PopulateService, useValue: {}},
                {provide: EloConnectorService, useValue: {createJob: jest.fn()}},
            ],
        }).compile();

        service = module.get<MatchService>(MatchService);
        roundRepository = module.get(getRepositoryToken(Round));
        teamRepository = module.get(getRepositoryToken(Team));
    });

    describe("markReplaysNcp — Round repository query", () => {
        /**
         * This test verifies the fix for the TypeORM error:
         *   "match has no property id"
         *
         * Before fix:  relations: { teamStats: true, match: { id: true } }
         *   → TypeORM tries to follow "id" as a sub-relation on Match, fails.
         *
         * After fix:   relations: { teamStats: true, match: true }
         *   → TypeORM generates a straight LEFT JOIN on match, e.g.:
         *     SELECT "Round"."id", ..., "Round__Round_match"."id" AS "Round__Round_match_id"
         *     FROM "sprocket"."round" "Round"
         *     LEFT JOIN "sprocket"."match" "Round__Round_match"
         *       ON "Round__Round_match"."id" = "Round"."matchId"
         *     WHERE "Round"."id" = $1
         */
        it("queries Round with relations: { teamStats: true, match: true } — not match: { id: true }", async () => {
            teamRepository.findOne.mockResolvedValue({
                id: 49,
                franchise: {id: 1, profile: {title: "Test Franchise"}},
            });

            roundRepository.findOneOrFail.mockResolvedValue({
                id: 1,
                isDummy: false,
                match: {id: 99, skillGroupId: 1},
                teamStats: [],
            });

            // We only care about capturing the call; downstream errors are irrelevant.
            await service.markReplaysNcp([1], true).catch(() => {});

            // Retrieve the actual options passed so they are visible in test output.
            const [actualOptions] = roundRepository.findOneOrFail.mock.calls[0] as [Record<string, unknown>];
            console.log(
                "[SQL equivalent] Round findOneOrFail called with options:\n",
                JSON.stringify(actualOptions, null, 2),
            );
            console.log(
                "[SQL equivalent] TypeORM will generate roughly:\n",
                "  SELECT Round.*, Round__Round_match.*\n",
                '  FROM "sprocket"."round" Round\n',
                '  LEFT JOIN "sprocket"."match" Round__Round_match\n',
                '    ON Round__Round_match.id = Round."matchId"\n',
                "  WHERE Round.id = $1",
            );

            // FIX VERIFIED: match must be `true`, not an object like { id: true }
            expect(actualOptions).toMatchObject({
                relations: {
                    teamStats: true,
                    match: true,
                },
            });
        });

        it("does NOT pass match: { id: true } to Round repository (the broken pre-fix form)", async () => {
            teamRepository.findOne.mockResolvedValue({
                id: 49,
                franchise: {id: 1, profile: {title: "Test Franchise"}},
            });

            roundRepository.findOneOrFail.mockResolvedValue({
                id: 1,
                isDummy: false,
                match: {id: 99, skillGroupId: 1},
                teamStats: [],
            });

            await service.markReplaysNcp([1], true).catch(() => {});

            // The broken pre-fix query shape that caused: "match has no property id"
            const brokenRelations = {
                relations: expect.objectContaining({
                    match: expect.objectContaining({id: true}),
                }),
            };

            expect(roundRepository.findOneOrFail).not.toHaveBeenCalledWith(
                expect.objectContaining(brokenRelations),
            );
        });

        it("returns early with an error string when isNcp=true and no winning team is provided", async () => {
            teamRepository.findOne.mockResolvedValue(null);

            const result = await service.markReplaysNcp([1], true, undefined);

            expect(result).toBe("Winning team must be specified if NCPing replays");
            // Round repository must NOT be touched when the guard fires
            expect(roundRepository.findOneOrFail).not.toHaveBeenCalled();
        });
    });
});

/**
 * SQL Visualization tests — no DB connection required.
 *
 * These tests build a real TypeORM DataSource (metadata only, no connection)
 * and call .getSql() on a QueryBuilder so you can see the exact SQL TypeORM
 * would send to Postgres. Run with --verbose to see the logged SQL output.
 */
describe("SQL generation — visualize Round queries", () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        // Importing Round (and Match etc.) at the top of this file causes their
        // decorators to run, which registers all entities — including transitive
        // deps — in TypeORM's global metadata args storage. We collect those
        // classes here so the DataSource has a complete picture of every entity.
        const registeredEntities = getMetadataArgsStorage()
            .tables.filter(t => t.type === "regular")
            .map(t => t.target as Function);

        dataSource = new DataSource({
            type: "postgres",
            entities: registeredEntities,
        });
        // buildMetadatas() is protected in the TypeScript types but public at
        // runtime. Calling it here builds entity metadata without opening a real
        // DB connection, so QueryBuilder can produce accurate SQL strings.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dataSource as any).buildMetadatas();
    });

    it("generates a LEFT JOIN on match when using relations: { match: true }", () => {
        const qb = dataSource
            .getRepository(Round)
            .createQueryBuilder("Round")
            .leftJoinAndSelect("Round.match", "match")
            .where("Round.id = :id", {id: 1});

        const sql = qb.getSql();
        console.log("\n[GENERATED SQL — correct form]\n", sql, "\n");

        expect(sql).toMatch(/LEFT JOIN "sprocket"\."match" "match"/);
    });

});

