import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Resolver} from "@nestjs/graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {Actions} from "../../authorization/decorators";
import {SubmissionService} from "./submission.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubmissionAdminResolver {
    constructor(private readonly submissonService: SubmissionService) {}

    @Mutation(() => Boolean)
    @Actions("ResetOrganizationSubmissions")
    async resetSubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        return this.submissonService.resetSubmission(submissionId, user.userId, true);
    }
}
