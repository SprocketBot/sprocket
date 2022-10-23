import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import type {ReplaySubmission} from "@sprocketbot/common";

import {MLE_OrganizationTeam} from "$mledb";

import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {GqlReplaySubmission} from "../../replay-parse";
import {SubmissionService} from "../submission.service";

@Resolver()
export class SubmissionManagementResolver {
    constructor(private readonly submissionService: SubmissionService) {}

    @Query(() => [GqlReplaySubmission])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async getActiveSubmissions(): Promise<ReplaySubmission[]> {
        return this.submissionService.getAllSubmissions();
    }

    @Mutation(() => GqlReplaySubmission)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async adminResetSubmission(@Args("submissionId") submissionId: string): Promise<boolean> {
        return this.submissionService.adminResetSubmission(submissionId);
    }
}
