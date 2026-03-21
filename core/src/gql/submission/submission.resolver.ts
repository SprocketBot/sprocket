import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { FileUpload } from 'graphql-upload';
import { GraphQLUpload } from 'graphql-upload';
import { ReplaySubmissionService } from '../../submissions/replay-submission.service';
import { MatchSubmissionObject } from './match_submission.object';
import { ReplaySubmissionType } from '../../db/internal';
import { CurrentUser } from '../../auth/current-user/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { SubmissionValidationResultObject } from './submission-validation.object';

@Resolver(() => MatchSubmissionObject)
export class SubmissionResolver {
  constructor(private readonly replaySubmissionService: ReplaySubmissionService) {}

  @Query(() => MatchSubmissionObject)
  @UseGuards(GqlAuthGuard)
  async getSubmission(
    @Args('submissionId') submissionId: string,
  ): Promise<MatchSubmissionObject> {
    return this.replaySubmissionService.getSubmission(submissionId);
  }

  @Mutation(() => MatchSubmissionObject)
  @UseGuards(GqlAuthGuard)
  async parseReplays(
    @CurrentUser() user: any,
    @Args('files', { type: () => [GraphQLUpload] })
    files: Array<Promise<FileUpload>>,
    @Args('submissionType', { type: () => ReplaySubmissionType })
    submissionType: ReplaySubmissionType,
    @Args('matchId', { nullable: true }) matchId?: string,
    @Args('scrimId', { nullable: true }) scrimId?: string,
  ): Promise<MatchSubmissionObject> {
    const uploadFiles = await Promise.all(
      files.map(async (filePromise) => {
        const file = await filePromise;
        const buffer = await streamToBuffer(file.createReadStream());
        return { filename: file.filename, buffer };
      }),
    );

    return this.replaySubmissionService.createSubmissionFromUploads(
      uploadFiles,
      user.id,
      submissionType,
      matchId,
      scrimId,
    );
  }

  @Mutation(() => SubmissionValidationResultObject)
  @UseGuards(GqlAuthGuard)
  async validateSubmission(
    @Args('submissionId') submissionId: string,
  ): Promise<SubmissionValidationResultObject> {
    return this.replaySubmissionService.validateSubmission(submissionId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async ratifySubmission(
    @CurrentUser() user: any,
    @Args('submissionId') submissionId: string,
  ): Promise<boolean> {
    await this.replaySubmissionService.ratifySubmission(submissionId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async rejectSubmission(
    @CurrentUser() user: any,
    @Args('submissionId') submissionId: string,
    @Args('reason') reason: string,
  ): Promise<boolean> {
    await this.replaySubmissionService.rejectSubmission(
      submissionId,
      user.id,
      reason,
    );
    return true;
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
