import {Injectable, Logger} from "@nestjs/common";
import {
    EventsService,
    EventTopic,
    MatchmakingEndpoint,
    MatchmakingService,
    ResponseStatus,
    SubmissionStatus,
} from "@sprocketbot/common";

import {getSubmissionKey, submissionIsScrim} from "../../utils";
import {ReplaySubmissionCrudService} from "../replay-submission-crud/replay-submission-crud.service";

@Injectable()
export class ReplaySubmissionRatificationService {
    private readonly logger = new Logger(ReplaySubmissionRatificationService.name);

    constructor(
        private readonly eventService: EventsService,
        private readonly crudService: ReplaySubmissionCrudService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async resetSubmission(submissionId: string, override: boolean, userId: number): Promise<void> {
        if (!override) {
            if (submissionIsScrim(submissionId)) {
                const scrimResponse = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, {
                    submissionId,
                });
                if (scrimResponse.status === ResponseStatus.ERROR || !scrimResponse.data) {
                    if (scrimResponse.status === ResponseStatus.ERROR) this.logger.error(scrimResponse.error);
                    throw new Error("Error fetching scrim");
                }
                const scrim = scrimResponse.data;
                if (!scrim.players.some(p => p.userId === userId)) throw new Error("You cannot reset this scrim");
            }
        }

        await this.crudService.setRejectionStreak(submissionId, 0);
        await this.crudService.startNewRound(submissionId);
        await this.eventService.publish(EventTopic.SubmissionReset, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });
    }

    async ratifyScrim(userId: number, submissionId: string): Promise<boolean> {
        const submission = await this.crudService.getSubmissionById(submissionId);

        if (submission.status !== SubmissionStatus.Ratifying)
            throw new Error("Submission is not ready for ratifications");

        const ratification = await this.crudService.addRatification(submissionId, userId);
        submission.ratifications.push(ratification);

        if (submission.ratifications.length >= submission.requiredRatifications) {
            await this.crudService.updateStatus(submissionId, SubmissionStatus.Ratified);

            await this.eventService.publish(EventTopic.SubmissionRatified, {
                submissionId: submissionId,
                redisKey: getSubmissionKey(submissionId),
            });
            return true;
        }

        await this.eventService.publish(EventTopic.SubmissionRatificationAdded, {
            currentRatifications: submission.ratifications.length + 1,
            requiredRatifications: submission.requiredRatifications,
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });

        return false;
    }

    async rejectSubmission(userId: number, submissionId: string, reasons: string[]): Promise<boolean> {
        await Promise.all(reasons.map(r => this.crudService.addRejection(submissionId, userId, r)));

        await this.crudService.incrementRejectionStreak(submissionId);
        await this.crudService.updateStatus(submissionId, SubmissionStatus.Rejected);
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
