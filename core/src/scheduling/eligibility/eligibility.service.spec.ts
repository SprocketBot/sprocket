import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EligibilityData } from "$db/scheduling/eligibility_data/eligibility_data.model";
import { EligibilityService } from "./eligibility.service";
import { subDays, addDays } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

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
                { id: 1, points: 20, createdAt: subDays(now, 5), player: { id: playerId } },
                { id: 2, points: 15, createdAt: subDays(now, 10), player: { id: playerId } },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);

            expect(result).toBe(35);
            expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    player: { id: playerId },
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
                { id: 1, points: 20, createdAt: p1Created, player: { id: playerId } },
                { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
            ] as EligibilityData[];

            // First call to find (for current points)
            // thirtyDaysAgo = now - 30d. 
            // p1Created is mondayPointTime - 29d. now is mondayPointTime + 1d.
            // so p1Created is now - 30d. It might be exactly on the edge or just outside depending on milliseconds.
            // Let's make it clearly outside for the first check.
            const p1CreatedOutside = subDays(now, 30.1);
            const pointsCurrently = [
                { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
            ] as EligibilityData[];

            mockRepository.find
                .mockResolvedValueOnce(pointsCurrently) // Current points check
                .mockResolvedValueOnce([
                    { id: 1, points: 20, createdAt: mondayPointTime, player: { id: playerId } }, // Point that triggered eligibility since Monday
                    { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
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
                { id: 1, points: 10, createdAt: subDays(now, 5), player: { id: playerId } },
                { id: 2, points: 10, createdAt: subDays(now, 10), player: { id: playerId } },
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
                { id: 1, points: 30, createdAt: matchWeekStartUTC, player: { id: playerId } },
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
                { id: 1, points: 30, createdAt: subDays(matchWeekStartUTC, 6), player: { id: playerId } },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityPointsForPlayer(playerId);
            expect(result).toBe(30);
        });
    });

    describe("getEligibilityEndDate", () => {
        it("should return future date when points drop below 30 if currently eligible", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const playerId = 1;
            const p1Created = subDays(now, 10); // Expires in 20 days
            const p2Created = subDays(now, 20); // Expires in 10 days

            const points = [
                { id: 1, points: 20, createdAt: p1Created, player: { id: playerId } },
                { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
            ] as EligibilityData[];

            mockRepository.find.mockResolvedValue(points);

            const result = await service.getEligibilityEndDate(playerId);

            // Drops below 30 when p2 expires (15 points)
            // p2 expires at p2Created + 30 days
            expect(result).toEqual(addDays(p2Created, 30));
        });

        it("should return date when eligibility was lost if previously eligible", async () => {
            const now = new Date("2026-01-19T15:00:00Z");
            jest.setSystemTime(now);

            const playerId = 1;
            // Was eligible 5 days ago, but a point expired 2 days ago.
            const p1Created = subDays(now, 32); // Expired 2 days ago
            const p2Created = subDays(now, 10); // Still active

            const pointsCurrently = [
                { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
            ] as EligibilityData[];

            const allPoints = [
                { id: 1, points: 20, createdAt: p1Created, player: { id: playerId } },
                { id: 2, points: 15, createdAt: p2Created, player: { id: playerId } },
            ] as EligibilityData[];

            mockRepository.find
                .mockResolvedValueOnce(pointsCurrently)
                .mockResolvedValueOnce(allPoints);

            const result = await service.getEligibilityEndDate(playerId);

            expect(result).toEqual(addDays(p1Created, 30));
        });

        it("should return null if never eligible", async () => {
            mockRepository.find.mockResolvedValue([]);
            const result = await service.getEligibilityEndDate(1);
            expect(result).toBeNull();
        });
    });
});
