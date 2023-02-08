import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Resolver} from "@nestjs/graphql";
import {ReplaySubmissionType} from "@sprocketbot/common";
import {GraphQLError} from "graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {AuthorizationService} from "../../authorization/authorization.service";
import {MatchRepository} from "../database/match.repository";
import {ScrimService} from "../scrim/scrim.service";
import {SubmissionService} from "./submission.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubmissionAdminResolver {
    constructor(
        private readonly submissonService: SubmissionService,
        private readonly scrimService: ScrimService,
        private readonly matchRepository: MatchRepository,
        private readonly authorizationService: AuthorizationService,
    ) {}

    @Mutation(() => Boolean)
    async resetSubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        const submission = await this.submissonService.getSubmissionById(submissionId);

        let organizationId: number;
        if (submission.type === ReplaySubmissionType.MATCH) {
            const match = await this.matchRepository.findById(submission.matchId, {
                relations: {
                    skillGroup: true,
                },
            });
            organizationId = match.skillGroup.organizationId;
        } else {
            const scrim = await this.scrimService.getScrimById(submission.scrimId);
            if (!scrim) throw new Error("Scrim not found");
            organizationId = scrim.organizationId;
        }

        if (!(await this.authorizationService.can(user.userId, organizationId, "ResetSubmission")))
            throw new GraphQLError("Unauthorized");

        return this.submissonService.resetSubmission(submissionId, user.userId, true);
    }
}
