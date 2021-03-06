import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {ScheduleFixtureService} from "../schedule-fixture/schedule-fixture.service";
import {MatchService} from "./match.service";

@Controller("match")
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private readonly fixtureService: ScheduleFixtureService,
    ) {
    }

    @MessagePattern(CoreEndpoint.GetMatchBySubmissionId)
    async getMatchBySubmissionId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMatchBySubmissionId>> {
        const data = CoreSchemas.GetMatchBySubmissionId.input.parse(payload);
        const match = await this.matchService.getMatchBySubmissionId(data.submissionId);
        const matchParent = await this.matchService.getMatchParentEntity(match.id);

        if (matchParent.type !== "fixture") return {id: match.id};
        return {
            id: match.id,
            homeFranchise: {
                id: matchParent.data.homeFranchiseId,
                name: matchParent.data.homeFranchise.profile.title,
            },
            awayFranchise: {
                id: matchParent.data.awayFranchiseId,
                name: matchParent.data.awayFranchise.profile.title,
            },
        };
    }
}
