import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import {
  MatchEntity,
  MatchSubmissionEntity,
  ReplaySubmissionItemEntity,
  ReplaySubmissionItemStatus,
  ReplaySubmissionRejectionEntity,
  ReplaySubmissionRatifierEntity,
  ReplaySubmissionType,
  SubmissionStatus,
  UserEntity,
  ScrimEntity,
} from '../db/internal';
import { EventQueueService } from '../events/event-queue.service';
import { EventTarget, EventType } from '../db/events/event_queue.entity';
import { MinioService } from '../storage/minio.service';
import {
  SubmissionValidationError,
  SubmissionValidationResult,
} from './replay-submission.types';
import { RocketLeagueSubmissionValidationService } from './rocket-league/rocket-league-submission-validation.service';

export const REPLAY_EXT = '.replay';
export const SYSTEM_REJECTION_PLAYER_ID = 'system';

type UploadFile = {
  filename: string;
  buffer: Buffer;
};

@Injectable()
export class ReplaySubmissionService {
  private readonly logger = new Logger(ReplaySubmissionService.name);

  constructor(
    @InjectRepository(MatchSubmissionEntity)
    private readonly submissionRepo: Repository<MatchSubmissionEntity>,
    @InjectRepository(ReplaySubmissionItemEntity)
    private readonly itemRepo: Repository<ReplaySubmissionItemEntity>,
    @InjectRepository(ReplaySubmissionRejectionEntity)
    private readonly rejectionRepo: Repository<ReplaySubmissionRejectionEntity>,
    @InjectRepository(ReplaySubmissionRatifierEntity)
    private readonly ratifierRepo: Repository<ReplaySubmissionRatifierEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    private readonly eventQueue: EventQueueService,
    private readonly minio: MinioService,
    private readonly rlValidation: RocketLeagueSubmissionValidationService,
  ) {}

  async createSubmissionFromUploads(
    files: UploadFile[],
    submittedById: string,
    submissionType: ReplaySubmissionType,
    matchId?: string,
    scrimId?: string,
  ): Promise<MatchSubmissionEntity> {
    const submission = this.submissionRepo.create({
      match: matchId ? ({ id: matchId } as MatchEntity) : undefined,
      scrim: scrimId ? ({ id: scrimId } as ScrimEntity) : undefined,
      submittedBy: { id: submittedById } as UserEntity,
      status: SubmissionStatus.PROCESSING,
      submissionType,
      submittedData: {
        matchId,
        scrimId,
      },
      submittedAt: new Date(),
    });

    const saved = await this.submissionRepo.save(submission);

    const items: ReplaySubmissionItemEntity[] = [];
    for (const file of files) {
      const objectHash = createHash('sha256')
        .update(file.buffer)
        .digest('hex');
      const replayObjectPath = `replays/${objectHash}${REPLAY_EXT}`;

      await this.minio.putObject(
        replayObjectPath,
        file.buffer,
        'application/octet-stream',
      );

      const item = this.itemRepo.create({
        submission: saved,
        taskId: uuidv4(),
        originalFilename: file.filename,
        inputPath: replayObjectPath,
        status: ReplaySubmissionItemStatus.PENDING,
        progressValue: 0,
        progressMessage: 'Queued for parsing',
      });
      const savedItem = await this.itemRepo.save(item);
      items.push(savedItem);

      await this.eventQueue.publish(
        EventTarget.REPLAY_PARSE,
        EventType.REPLAY_PARSE_REQUEST,
        {
          submissionId: saved.id,
          itemId: savedItem.id,
          replayObjectPath,
        },
      );
    }

    await this.eventQueue.publish(
      EventTarget.REPLAY_PARSE,
      EventType.SUBMISSION_STARTED,
      {
        submissionId: saved.id,
        itemCount: items.length,
      },
    );

    return this.getSubmission(saved.id);
  }

  async getSubmission(submissionId: string): Promise<MatchSubmissionEntity> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['items', 'rejections', 'ratifiers', 'match', 'scrim'],
    });
    if (!submission) {
      throw new Error('Submission not found');
    }
    return submission;
  }

  async validateSubmission(
    submissionId: string,
  ): Promise<SubmissionValidationResult> {
    const submission = await this.getSubmission(submissionId);
    return this.rlValidation.validateSubmission(submission);
  }

  async markSubmissionRejected(
    submissionId: string,
    errors: SubmissionValidationError[],
  ): Promise<void> {
    await this.submissionRepo.update(
      { id: submissionId },
      { status: SubmissionStatus.REJECTED },
    );

    const rejections = errors.map((e) =>
      this.rejectionRepo.create({
        submission: { id: submissionId } as MatchSubmissionEntity,
        playerId: SYSTEM_REJECTION_PLAYER_ID,
        reason: e.error,
        stale: false,
      }),
    );
    await this.rejectionRepo.save(rejections);

    await this.eventQueue.publish(
      EventTarget.NOTIFICATIONS,
      EventType.SUBMISSION_REJECTED,
      { submissionId },
    );
  }

  async markSubmissionRatifying(submissionId: string): Promise<void> {
    await this.submissionRepo.update(
      { id: submissionId },
      { status: SubmissionStatus.RATIFYING },
    );
    await this.eventQueue.publish(
      EventTarget.NOTIFICATIONS,
      EventType.SUBMISSION_RATIFYING,
      { submissionId },
    );
  }

  async ratifySubmission(submissionId: string, userId: string): Promise<void> {
    const submission = await this.getSubmission(submissionId);
    if (submission.status !== SubmissionStatus.RATIFYING) {
      throw new Error('Submission is not ready for ratification');
    }

    const existing = submission.ratifiers?.find(
      (r) => r.userId === userId || r.user?.id === userId,
    );
    if (existing) {
      throw new Error('User has already ratified this submission');
    }

    await this.ratifierRepo.save(
      this.ratifierRepo.create({
        submission: { id: submissionId } as MatchSubmissionEntity,
        userId,
        ratifiedAt: new Date(),
      }),
    );

    const ratifiers = await this.ratifierRepo.find({
      where: { submission: { id: submissionId } as MatchSubmissionEntity },
    });

    const required = submission.submissionType === ReplaySubmissionType.MATCH ? 2 : 1;
    if (ratifiers.length >= required) {
      await this.submissionRepo.update(
        { id: submissionId },
        { status: SubmissionStatus.RATIFIED },
      );
      if (submission.submissionType === ReplaySubmissionType.MATCH) {
        await this.eventQueue.publish(
          EventTarget.ELO_SERVICE,
          EventType.MATCH_RATIFIED,
          { submissionId, matchId: submission.match?.id },
        );
      }
    }
  }

  async rejectSubmission(
    submissionId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.rejectionRepo.save(
      this.rejectionRepo.create({
        submission: { id: submissionId } as MatchSubmissionEntity,
        playerId: userId,
        reason,
        stale: false,
      }),
    );
    await this.submissionRepo.update(
      { id: submissionId },
      { status: SubmissionStatus.REJECTED, rejectionReason: reason },
    );
  }

  // ExtractPlayers moved into RocketLeagueSubmissionValidationService
}
