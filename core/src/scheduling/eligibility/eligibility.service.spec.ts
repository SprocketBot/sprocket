import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {addDays, subDays} from "date-fns";
import {zonedTimeToUtc} from "date-fns-tz";
import type {Repository} from "typeorm";

import {EligibilityData} from "$db/scheduling/eligibility_data/eligibility_data.model";

import {EligibilityService} from "./eligibility.service";

describe("EligibilityService", () => {
    let service: EligibilityService;
    let repository: Repository<EligibilityData>;

    const mockRepository = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EligibilityService,
                {
                    provide: getRepositoryToken(EligibilityData),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<EligibilityService>(EligibilityService);
        repository = module.get<Repository<EligibilityData>>(getRepositoryToken(EligibilityData));

        jest.useFakeTimers({
            doNotFake: ["performance"],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("getEligibilityPointsForPlayer", () => {
        it("should return current points if eligible (>= 30 points in last 30 days)", async () => {
            const now = new Date("2026-01-19T15:00:00Z"); // Monday 10:00 AM ET (15:00 UTC)
            jest.setSystemTime(now);

            const playerId = 1;
            const points = [
                {
                    id: 1, points: 20, createdAt: subDays(now, 5), player: {id: playerId},
                },
                {
                    id: 2, points: 15, createdAt: subDays(now, 10), player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);

            expect(result).toBe(35);
            expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    player: {id: playerId},
                }),
            }));
        });

        it("should return 30 if eligible earlier this week but currently < 30", async () => {
            // Match week starts Monday 12:00 PM ET.
            // Let's set "now" to Tuesday 12:00 PM ET.
            const matchWeekStartET = new Date("2026-01-19T12:00:00"); // Monday 12:00 PM ET
            const matchWeekStartUTC = zonedTimeToUtc(matchWeekStartET, "America/New_York");

            const now = addDays(matchWeekStartUTC, 1); // Tuesday 12:00 PM ET
            jest.setSystemTime(now);

            const playerId = 1;

            // Points that made them eligible on Monday at 1:00 PM ET
            const mondayPointTime = addDays(matchWeekStartUTC, 0.0416); // ~1:00 PM ET

            // We need points that were active at mondayPointTime but some expired by "now"
            // To have 30+ at mondayPointTime:
            // P1: 20 points, created 29 days before mondayPointTime (expires before "now")
            // P2: 15 points, created 5 days before mondayPointTime (still active)

            const p1Created = subDays(mondayPointTime, 29);
            const p2Created = subDays(mondayPointTime, 5);

            const allPoints = [
                {
                    id: 1, points: 20, createdAt: p1Created, player: {id: playerId},
                },
                {
                    id: 2, points: 15, createdAt: p2Created, player: {id: playerId},
                },
            ] as EligibilityData[];

            // First call to find (for current points)
            // thirtyDaysAgo = now - 30d.
            // p1Created is mondayPointTime - 29d. now is mondayPointTime + 1d.
            // so p1Created is now - 30d. It might be exactly on the edge or just outside depending on milliseconds.
            // Let's make it clearly outside for the first check.
            const p1CreatedOutside = subDays(now, 30.1);
            const pointsCurrently = [
                {
                    id: 2, points: 15, createdAt: p2Created, player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find
                .mockResolvedValueOnce(pointsCurrently) // Current points check
                .mockResolvedValueOnce([
                    {
                        id: 1, points: 20, createdAt: mondayPointTime, player: {id: playerId},
                    }, // Point that triggered eligibility since Monday
                    {
                        id: 2, points: 15, createdAt: p2Created, player: {id: playerId},
                    },
                ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));

            const result = await service.getEligibilityPointsForPlayer(playerId);

            expect(result).toBe(30);
        });

        it("should return current points if not eligible and never eligible since Monday", async () => {
            const matchWeekStartET = new Date("2026-01-19T12:00:00");
            const matchWeekStartUTC = zonedTimeToUtc(matchWeekStartET, "America/New_York");
            const now = addDays(matchWeekStartUTC, 1);
            jest.setSystemTime(now);

            const playerId = 1;
            const points = [
                {
                    id: 1, points: 10, createdAt: subDays(now, 5), player: {id: playerId},
                },
                {
                    id: 2, points: 10, createdAt: subDays(now, 10), player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);

            expect(result).toBe(20);
        });

        it("should return 0 if no points found", async () => {
            mockRepository.find.mockResolvedValue([]);
            const result = await service.getEligibilityPointsForPlayer(1);
            expect(result).toBe(0);
        });

        it("should handle boundary case for match week start (exactly at 12:00 PM ET)", async () => {
            const matchWeekStartET = new Date("2026-01-19T12:00:00");
            const matchWeekStartUTC = zonedTimeToUtc(matchWeekStartET, "America/New_York");
            jest.setSystemTime(matchWeekStartUTC);

            const playerId = 1;
            const points = [
                {
                    id: 1, points: 30, createdAt: matchWeekStartUTC, player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);
            expect(result).toBe(30);
        });

        it("should handle boundary case for match week start (just before 12:00 PM ET)", async () => {
            const matchWeekStartET = new Date("2026-01-19T11:59:59");
            const matchWeekStartUTC = zonedTimeToUtc(matchWeekStartET, "America/New_York");
            jest.setSystemTime(matchWeekStartUTC);

            // If it's before Monday 12:00 PM ET, the match week start should be the PREVIOUS Monday 12:00 PM ET.
            const playerId = 1;
            const points = [
                {
                    id: 1, points: 30, createdAt: subDays(matchWeekStartUTC, 6), player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);
            expect(result).toBe(30);
        });
    });

    describe("getEligibilityEndDate", () => {
        const playerId = 1;

        function expectActiveWindowQuery(): void {
            expect(mockRepository.find).toHaveBeenCalledTimes(1);
            const findArg = mockRepository.find.mock.calls[0][0] as {
                where: {player: {id: number;}; createdAt: unknown;};
            };
            expect(findArg.where.player).toEqual({id: playerId});
            expect(findArg.where.createdAt).toBeDefined();
        }

        it("should return future date when points drop below 30 if currently eligible", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const p1Created = subDays(now, 10); // Expires in 20 days
            const p2Created = subDays(now, 20); // Expires in 10 days

            const points = [
                {
                    id: 1, points: 20, createdAt: p1Created, player: {id: playerId},
                },
                {
                    id: 2, points: 15, createdAt: p2Created, player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityEndDate(playerId);

            // Drops below 30 when p2 expires (15 points)
            expect(result).toEqual(addDays(p2Created, 30));
            expectActiveWindowQuery();
        });

        it("returns the later expiration when an earlier one leaves exactly 30", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const expiresFirst = subDays(now, 20);
            const expiresSecond = subDays(now, 10);
            const points = [
                {
                    id: 1, points: 5, createdAt: expiresFirst, player: {id: playerId},
                },
                {
                    id: 2, points: 30, createdAt: expiresSecond, player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityEndDate(playerId);

            // 35 - 5 = 30, still eligible; becomes ineligible when the 30 expires
            expect(result).toEqual(addDays(expiresSecond, 30));
            expectActiveWindowQuery();
        });

        it("returns the expiration of an exact-30 active window", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const createdAt = subDays(now, 7);
            mockRepository.find.mockResolvedValue([
                {
                    id: 1, points: 30, createdAt: createdAt, player: {id: playerId},
                },
            ] as EligibilityData[]);

            const result = await service.getEligibilityEndDate(playerId);

            expect(result).toEqual(addDays(createdAt, 30));
            expectActiveWindowQuery();
        });

        it("returns null for empty history without a full-history query", async () => {
            mockRepository.find
                .mockResolvedValueOnce([])
                .mockImplementation(() => {
                    throw new Error("full-history query must not run");
                });

            const result = await service.getEligibilityEndDate(playerId);

            expect(result).toBeNull();
            expectActiveWindowQuery();
        });

        it("returns null for leftover recent points totaling 29 without a full-history query", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            mockRepository.find
                .mockResolvedValueOnce([
                    {
                        id: 1, points: 14, createdAt: subDays(now, 2), player: {id: playerId},
                    },
                    {
                        id: 2, points: 15, createdAt: subDays(now, 8), player: {id: playerId},
                    },
                ] as EligibilityData[])
                .mockImplementation(() => {
                    throw new Error("full-history query must not run");
                });

            const result = await service.getEligibilityEndDate(playerId);

            expect(result).toBeNull();
            expectActiveWindowQuery();
        });

        it("returns null for a currently ineligible player who was previously eligible", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const p2Created = subDays(now, 10); // Still active, 15 points
            mockRepository.find
                .mockResolvedValueOnce([
                    {
                        id: 2, points: 15, createdAt: p2Created, player: {id: playerId},
                    },
                ] as EligibilityData[])
                .mockImplementation(() => {
                    throw new Error("full-history query must not run");
                });

            const result = await service.getEligibilityEndDate(playerId);

            expect(result).toBeNull();
            expectActiveWindowQuery();
        });

        it("subtracts each of two rows that share an expiration timestamp once", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const sharedCreated = subDays(now, 20);
            const laterCreated = subDays(now, 5);
            const points = [
                {
                    id: 1, points: 5, createdAt: sharedCreated, player: {id: playerId},
                },
                {
                    id: 2, points: 5, createdAt: sharedCreated, player: {id: playerId},
                },
                {
                    id: 3, points: 25, createdAt: laterCreated, player: {id: playerId},
                },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityEndDate(playerId);

            // 35 - 5 = 30 (still eligible), then the second same-timestamp 5 drops to 25
            expect(result).toEqual(addDays(sharedCreated, 30));
            expectActiveWindowQuery();
        });

        it("calculates eligibility end using only active-window rows", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const rowCount = 80;
            const points = Array.from({length: rowCount}, (_, i) => ({
                id: i + 1,
                points: 1,
                createdAt: subDays(now, 1 + (i % 25)),
                player: {id: playerId},
            })) as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityEndDate(playerId);

            let remaining = rowCount;
            let expected: Date | null = null;
            const expirations = points
                .map(p => addDays(p.createdAt, 30))
                .sort((a, b) => a.getTime() - b.getTime());
            for (const date of expirations) {
                remaining -= 1;
                if (remaining < 30) {
                    expected = date;
                    break;
                }
            }

            // 80 ones: remain eligible until 51 expirations drop the remainder to 29.
            // date-fns named exports cannot be spied here; this asserts the walk is over
            // the active-window rows only (one find, result is the 51st active expiration).
            expect(result).toEqual(expected);
            expectActiveWindowQuery();
        });
    });
});
