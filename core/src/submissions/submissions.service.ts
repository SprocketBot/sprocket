import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchSubmissionEntity, SubmissionStatus } from '../db/internal';
import { EventQueueService } from '../events/event-queue.service';
import { EventTarget, EventType } from '../db/events/event_queue.entity';

@Injectable()
export class SubmissionsService {
    private readonly logger = new Logger(SubmissionsService.name);

    constructor(
        @InjectRepository(MatchSubmissionEntity)
        private readonly submissionRepository: Repository<MatchSubmissionEntity>,
        private readonly eventQueueService: EventQueueService,
    ) { }

    async createSubmission(
        matchId: string,
        userId: string,
        data: Record<string, any>,
    ): Promise<MatchSubmissionEntity> {
        const submission = this.submissionRepository.create({
            match: { id: matchId },
            submittedBy: { id: userId },
            status: SubmissionStatus.PENDING,
            submittedData: data,
            submittedAt: new Date(),
        });

        const savedSubmission = await this.submissionRepository.save(submission);

        await this.eventQueueService.publish(
            EventTarget.REPLAY_PARSE,
            EventType.SUBMISSION_CREATED,
            {
                submissionId: savedSubmission.id,
                matchId: matchId,
                userId: userId,
            },
        );

        return savedSubmission;
    }

    async getSubmission(submissionId: string): Promise<MatchSubmissionEntity | null> {
        return this.submissionRepository.findOne({
            where: { id: submissionId },
            relations: ['match', 'submittedBy', 'reviewedBy'],
        });
    }

    async updateStatus(
        submissionId: string,
        status: SubmissionStatus,
        reviewedByUserId?: string,
        rejectionReason?: string,
    ): Promise<MatchSubmissionEntity> {
        const submission = await this.getSubmission(submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }

        submission.status = status;
        if (reviewedByUserId) {
            submission.reviewedBy = { id: reviewedByUserId } as any;
            submission.reviewedAt = new Date();
        }
        if (rejectionReason) {
            submission.rejectionReason = rejectionReason;
        }

        return this.submissionRepository.save(submission);
    }
}