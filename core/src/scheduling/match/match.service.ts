import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import type {ScheduledEvent, ScrimMeta} from "../../database";
import {
    Franchise,
    Invalidation, Match, ScheduleFixture,
} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";

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
    private readonly logger = new Logger(MatchService.name);

    constructor(
        @InjectRepository(Match) private matchRepo: Repository<Match>,
        @InjectRepository(Invalidation) private invalidationRepo: Repository<Invalidation>,
        private readonly popService: PopulateService,
    ) {}

    async createMatch(isDummy?: boolean, invalidationId?: number): Promise<Match> {
        let invalidation: Invalidation | undefined;
        if (invalidationId) invalidation = await this.invalidationRepo.findOneOrFail({where: {id: invalidationId} });

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

    async getMatchById(matchId: number): Promise<Match> {
        return this.matchRepo.findOneOrFail({where: {id: matchId}  });
    }

    async getMatchParentEntity(matchId: number): Promise<MatchParentResponse> {
        const populatedMatch = await this.matchRepo.findOneOrFail({
            where: {
                id: matchId,
            },
            relations: ["matchParent", "matchParent.fixture", "matchParent.scrimMeta", "matchParent.event"],
        });

        if (populatedMatch.matchParent.fixture) {
            this.logger.debug("Populating Fixture");
            populatedMatch.matchParent.fixture.homeFranchise = await this.popService.populateOneOrFail(ScheduleFixture, populatedMatch.matchParent.fixture, "homeFranchise");
            populatedMatch.matchParent.fixture.homeFranchise.profile = await this.popService.populateOneOrFail(Franchise, populatedMatch.matchParent.fixture.homeFranchise, "profile");
            populatedMatch.matchParent.fixture.homeFranchiseId = populatedMatch.matchParent.fixture.homeFranchise.id;

            populatedMatch.matchParent.fixture.awayFranchise = await this.popService.populateOneOrFail(ScheduleFixture, populatedMatch.matchParent.fixture, "awayFranchise");
            populatedMatch.matchParent.fixture.awayFranchise.profile = await this.popService.populateOneOrFail(Franchise, populatedMatch.matchParent.fixture.awayFranchise, "profile");
            populatedMatch.matchParent.fixture.awayFranchiseId = populatedMatch.matchParent.fixture.awayFranchise.id;
            return {
                type: "fixture",
                data: populatedMatch.matchParent.fixture,
            };
        }
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

    async getOrganizationIdByMatchId(matchId: number): Promise<number> {
        const match = await this.matchRepo.findOneOrFail({
            where: {
                id: matchId,
            },
            relations: {
                matchParent: {
                    fixture: {
                        scheduleGroup: {
                            type: {
                                organization: true,
                            },
                        },
                    },
                },
            },
        });

        if (!match.matchParent.fixture?.scheduleGroup.type.organization.id) throw new Error("Cannot find Organization");

        return match.matchParent.fixture.scheduleGroup.type.organization.id;
    }
}
