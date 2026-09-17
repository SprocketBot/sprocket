import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {
    addDays, isAfter, isBefore, set, startOfWeek, subDays,
} from "date-fns";
import {utcToZonedTime, zonedTimeToUtc} from "date-fns-tz";
import {MoreThanOrEqual, Repository} from "typeorm";

import {EligibilityData} from "$db/scheduling/eligibility_data/eligibility_data.model";

@Injectable()
export class EligibilityService {
    private readonly timezone = "America/New_York";

    constructor(@InjectRepository(EligibilityData)
    private readonly eligibilityDataRepository: Repository<EligibilityData>) {}

    async getEligibilityPointsForPlayer(playerId: number): Promise<number> {
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        const points = await this.eligibilityDataRepository.find({
            where: {
                player: {id: playerId},
                createdAt: MoreThanOrEqual(thirtyDaysAgo),
            },
        });

        const totalPoints = points.reduce((acc, curr) => acc + curr.points, 0);

        if (totalPoints >= 30) {
            return totalPoints;
        }

        const zonedNow = utcToZonedTime(now, this.timezone);
        let matchWeekStart = startOfWeek(zonedNow, {weekStartsOn: 1});
        matchWeekStart = set(matchWeekStart, {
            hours: 12,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });

        if (isBefore(zonedNow, matchWeekStart)) {
            matchWeekStart = subDays(matchWeekStart, 7);
        }

        const utcMatchWeekStart = zonedTimeToUtc(matchWeekStart, this.timezone);

        // Check if they had 30 points at any point on or after match week start
        // We need to check the rolling 30-day window for each point entry since match week start
        // Actually, the requirement says "A player is eligible if they have 30 or more points at any point on or after the beginning of a match week."
        // This means we need to check if at any timestamp T >= matchWeekStart, the sum of points in [T-30d, T] was >= 30.

        const allRelevantPoints = await this.eligibilityDataRepository.find({
            where: {
                player: {id: playerId},
                createdAt: MoreThanOrEqual(subDays(utcMatchWeekStart, 30)),
            },
            order: {createdAt: "ASC"},
        });

        // To find if they ever hit 30 points since matchWeekStart:
        // The total points can only change when a point entry is created or expires.
        // We check the total at each createdAt >= matchWeekStart.
        for (const pointEntry of allRelevantPoints) {
            if (isBefore(pointEntry.createdAt, utcMatchWeekStart)) {
                continue;
            }

            const timestamp = pointEntry.createdAt;
            const windowStart = subDays(timestamp, 30);
            const pointsInWindow = allRelevantPoints
                .filter(p => !isBefore(p.createdAt, windowStart) && !isAfter(p.createdAt, timestamp))
                .reduce((acc, curr) => acc + curr.points, 0);

            if (pointsInWindow >= 30) {
                return Math.max(totalPoints, 30); // They are eligible, return at least 30 or their current points
            }
        }

        return totalPoints;
    }

    async getEligibilityEndDate(playerId: number): Promise<Date | null> {
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        const points = await this.eligibilityDataRepository.find({
            where: {
                player: {id: playerId},
                createdAt: MoreThanOrEqual(thirtyDaysAgo),
            },
            order: {createdAt: "ASC"},
        });

        let currentPoints = points.reduce((acc, curr) => acc + curr.points, 0);
        if (currentPoints < 30) {
            return null;
        }

        // Currently eligible: first expiration that drops the active-window sum below 30,
        // assuming no new points. Each row's expiration is computed once.
        const expirations = points
            .map(p => ({
                date: addDays(p.createdAt, 30),
                points: p.points,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        for (const expiration of expirations) {
            currentPoints -= expiration.points;
            if (currentPoints < 30) {
                return expiration.date;
            }
        }

        return null;
    }
}
