import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {
    ScheduledEvent, ScheduleFixture, ScrimMeta,
} from "../../database";
import {Invalidation, Match} from "../../database";

export type MatchParentResponse = {
    type: "fixture";
    data: ScheduleFixture;
} | {
    type: "scrim";
    data: ScrimMeta;
} | {
    type: "event";
    data: ScheduledEvent;
};

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match) private matchRepo: Repository<Match>,
        @InjectRepository(Invalidation) private invalidationRepo: Repository<Invalidation>,
    ) {}

    async createMatch(isDummy?: boolean, invalidationId?: number): Promise<Match> {
        let invalidation: Invalidation | undefined;
        if (invalidationId) invalidation = await this.invalidationRepo.findOneOrFail(invalidationId);

        const match = this.matchRepo.create({
            isDummy: isDummy,
            invalidation: invalidation,
            rounds: [],
        });

        return this.matchRepo.save(match);
    }

    async getMatchBySubmissionId(submissionId: string): Promise<Match> {
        return this.matchRepo.findOneOrFail({
            where: {
                submissionId: submissionId,
            },
        });
    }

    async getMatchParentEntity(matchId: number): Promise<MatchParentResponse> {
        const populatedMatch = await this.matchRepo.findOneOrFail({
            where: {
                id: matchId,
            },
            relations: ["matchParent", "matchParent.fixture", "matchParent.scrimMeta", "matchParent.event"],
        });

        if (populatedMatch.matchParent.fixture) return {
            type: "fixture",
            data: populatedMatch.matchParent.fixture,
        };
        if (populatedMatch.matchParent.scrimMeta) return {
            type: "scrim",
            data: populatedMatch.matchParent.scrimMeta,
        };
        if (populatedMatch.matchParent.event) return {
            type: "event",
            data: populatedMatch.matchParent.event,
        };
        throw new Error("Data type not found");
    }
}
