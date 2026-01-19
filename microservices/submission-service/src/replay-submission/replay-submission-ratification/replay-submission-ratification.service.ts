import { Injectable, Logger } from '@nestjs/common';
import {
  EventsService,
  EventTopic,
  MatchmakingEndpoint,
  MatchmakingService,
  ReplaySubmissionStatus,
  ResponseStatus,
} from '@sprocketbot/common';
import type { EnhancedReplaySubmission } from '@sprocketbot/common';

import { getSubmissionKey, submissionIsScrim } from '../../utils';
import { ReplaySubmissionCrudService } from '../replay-submission-crud/replay-submission-crud.service';
import { CrossFranchiseValidationService } from '../cross-franchise-validation.service';

@Injectable()
export class ReplaySubmissionRatificationService {
  private readonly logger = new Logger(ReplaySubmissionRatificationService.name);

  constructor(
    private readonly eventService: EventsService,
    private readonly crudService: ReplaySubmissionCrudService,
    private readonly matchmakingService: MatchmakingService,
    private readonly validationService: CrossFranchiseValidationService,
  ) {}

  async resetSubmission(submissionId: string, override: boolean, playerId: string): Promise<void> {
    if (!override) {
      if (submissionIsScrim(submissionId)) {
        const scrimResponse = await this.matchmakingService.send(
          MatchmakingEndpoint.GetScrimBySubmissionId,
          submissionId,
        );
        if (scrimResponse.status === ResponseStatus.ERROR || !scrimResponse.data) {
          if (scrimResponse.status === ResponseStatus.ERROR) this.logger.error(scrimResponse.error);
          throw new Error('Error fetching scrim');
        }
        const scrim = scrimResponse.data;
        if (!scrim.players.some(p => p.id.toString() === playerId))
          throw new Error('You cannot reset this scrim');
      }
    }

    // Delete the submission
    await this.crudService.removeSubmission(submissionId);
    // Let everybody know that we've deleted the submission
    await this.eventService.publish(EventTopic.SubmissionReset, {
      submissionId: submissionId,
      redisKey: getSubmissionKey(submissionId),
    });
  }

  async ratifyScrim(playerId: number, submissionId: string): Promise<Boolean> {
    const submission = await this.crudService.getSubmission(submissionId);
    if (!submission) throw new Error('Submission not found');
    if (submission.status !== ReplaySubmissionStatus.RATIFYING)
      throw new Error('Submission is not ready for ratifications');

    // If it's an enhanced submission, perform cross-franchise validation
    if (this.isEnhanced(submission)) {
      const validationError = await this.validationService.validateRatification(
        submission as unknown as EnhancedReplaySubmission,
        playerId,
      );
      if (validationError) {
        throw new Error(validationError.message);
      }
    }

    await this.crudService.addRatifier(submissionId, playerId);
    submission.ratifiers.push(playerId);

    if (submission.ratifiers.length >= submission.requiredRatifications) {
      await this.crudService.updateStatus(submissionId, ReplaySubmissionStatus.RATIFIED);

      await this.eventService.publish(EventTopic.SubmissionRatified, {
        submissionId: submissionId,
        redisKey: getSubmissionKey(submissionId),
      });
      return true;
    }
    await this.eventService.publish(EventTopic.SubmissionRatificationAdded, {
      currentRatifications: submission.ratifiers.length + 1,
      requiredRatifications: submission.requiredRatifications,
      submissionId: submissionId,
      redisKey: getSubmissionKey(submissionId),
    });
    return false;
  }

  private isEnhanced(submission: any): submission is any {
    return (
      'franchiseValidation' in submission &&
      Array.isArray(submission.ratifiers) &&
      submission.ratifiers.length > 0 &&
      typeof submission.ratifiers[0] === 'object' &&
      'franchiseId' in submission.ratifiers[0]
    );
  }

  async rejectSubmission(
    playerId: number,
    submissionId: string,
    reasons: string[],
  ): Promise<Boolean> {
    await Promise.all(
      reasons.map(async r => this.crudService.addRejection(submissionId, playerId, r)),
    );

    await this.crudService.removeItems(submissionId);
    await this.crudService.updateStatus(submissionId, ReplaySubmissionStatus.REJECTED);
    await this.eventService.publish(EventTopic.SubmissionRejectionAdded, {
      submissionId: submissionId,
      redisKey: getSubmissionKey(submissionId),
    });

    // TODO: support for different thresholds
    await this.eventService.publish(EventTopic.SubmissionRejected, {
      submissionId: submissionId,
      redisKey: getSubmissionKey(submissionId),
    });
    return false;
  }
}
