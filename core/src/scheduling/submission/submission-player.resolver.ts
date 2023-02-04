import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {GraphQLError} from "graphql";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {SubmissionObject} from "../graphql/submission/submission.object";
import {SubmissionService} from "./submission.service";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubmissionPlayerResolver {
    constructor(private readonly submissonService: SubmissionService) {}

    @Query(() => SubmissionObject, {nullable: true})
    async getSubmission(@Args("submissionId") submissionId: string): Promise<SubmissionObject> {
        return this.submissonService.getSubmissionById(submissionId);
    }

    @Mutation(() => [String])
    async parseReplays(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId", {nullable: true}) submissionId: string,
        @Args("files", {type: () => [GraphQLUpload]}) files: Array<Promise<FileUpload>>,
    ): Promise<string[]> {
        if (!(await this.submissonService.userCanSubmit(user.userId, submissionId)))
            throw new GraphQLError("User cannot submit replays for this submission");

        const streams = await Promise.all(
            files.map(async f =>
                f.then(_f => ({
                    stream: _f.createReadStream(),
                    filename: _f.filename,
                })),
            ),
        );

        return this.submissonService.parseReplays(streams, submissionId, user.userId);
    }

    @Mutation(() => Boolean, {nullable: true})
    async ratifySubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        if (!(await this.submissonService.userCanRatify(user.userId, submissionId)))
            throw new GraphQLError("User cannot ratify this submission");

        return this.submissonService.ratifySubmission(submissionId, user.userId);
    }

    @Mutation(() => Boolean, {nullable: true})
    async rejectSubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
        @Args("reason") reason: string,
    ): Promise<boolean> {
        if (!(await this.submissonService.userCanRatify(user.userId, submissionId)))
            throw new GraphQLError("User cannot ratify this submission");

        return this.submissonService.rejectSubmission(submissionId, user.userId, reason);
    }
}
