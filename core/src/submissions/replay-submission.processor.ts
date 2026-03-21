import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MatchSubmissionEntity,
  ReplaySubmissionItemStatus,
  SubmissionStatus,
} from '../db/internal';
import { ReplaySubmissionService } from './replay-submission.service';
import { EventQueueService } from '../events/event-queue.service';
import { EventTarget, EventType } from '../db/events/event_queue.entity';

@Injectable()
export class ReplaySubmissionProcessor {
  private readonly logger = new Logger(ReplaySubmissionProcessor.name);

  constructor(
    @InjectRepository(MatchSubmissionEntity)
    private readonly submissionRepo: Repository<MatchSubmissionEntity>,
    private readonly replaySubmissionService: ReplaySubmissionService,
    private readonly eventQueue: EventQueueService,
  ) {}

  @Interval(5000)
  async processPendingSubmissions(): Promise<void> {
    const submissions = await this.submissionRepo.find({
      where: { status: SubmissionStatus.PROCESSING },
      relations: ['items'],
    });

    for (const submission of submissions) {
      const items = submission.items ?? [];
      if (!items.length) continue;

      const done = items.every((item) =>
        [ReplaySubmissionItemStatus.COMPLETE, ReplaySubmissionItemStatus.ERROR].includes(
          item.status,
        ),
      );
      if (!done) continue;

      await this.eventQueue.publish(
        EventTarget.NOTIFICATIONS,
        EventType.SUBMISSION_VALIDATING,
        { submissionId: submission.id },
      );
      await this.submissionRepo.update(
        { id: submission.id },
        { status: SubmissionStatus.VALIDATING },
      );

      const result = await this.replaySubmissionService.validateSubmission(
        submission.id,
      );
      if (!result.valid) {
        await this.replaySubmissionService.markSubmissionRejected(
          submission.id,
          result.errors,
        );
        this.logger.warn(
          `Submission ${submission.id} rejected: ${result.errors.map((e) => e.error).join(
            ', ',
          )}`,
        );
        continue;
      }

      await this.replaySubmissionService.markSubmissionRatifying(submission.id);
    }
  }
}
