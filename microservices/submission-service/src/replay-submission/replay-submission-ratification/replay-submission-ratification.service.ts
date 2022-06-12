import {Injectable, Logger} from "@nestjs/common";
import {
    EventsService, EventTopic, MatchmakingEndpoint, MatchmakingService, ResponseStatus, ScrimStatus,
} from "@sprocketbot/common";

import {getSubmissionKey, submissionIsScrim} from "../../utils";
import {ReplaySubmissionCrudService} from "../replay-submission-crud.service";

@Injectable()
export class ReplaySubmissionRatificationService {
    private readonly logger = new Logger(ReplaySubmissionRatificationService.name);

    constructor(
        private readonly eventService: EventsService,
        private readonly crudService: ReplaySubmissionCrudService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async resetSubmission(submissionId: string, override: boolean, playerId: string): Promise<void> {
        if (!override) {
            if (submissionIsScrim(submissionId)) {
                const scrimResponse = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
                if (scrimResponse.status === ResponseStatus.ERROR || !scrimResponse.data) {
                    if (scrimResponse.status === ResponseStatus.ERROR) this.logger.error(scrimResponse.error);
                    throw new Error("Error fetching scrim");
                }
                const scrim = scrimResponse.data;
                if (scrim.status !== ScrimStatus.SUBMITTING) throw new Error("You cannot reset this scrim");
                if (!scrim.players.some(p => p.id.toString() === playerId)) throw new Error("You cannot reset this scrim");
            }
        }

        // Delete the submission
        await this.crudService.removeSubmission(submissionId);
        // Let everybody know that we've deleted the submission
        await this.eventService.publish(EventTopic.SubmissionReset, {submissionId: submissionId, redisKey: getSubmissionKey(submissionId)});
    }

    async ratifyScrim(playerId: string, submissionId: string): Promise<Boolean> {
        await this.crudService.addRatifier(submissionId, playerId);
        const submission = await this.crudService.getSubmission(getSubmissionKey(submissionId));
        if (!submission) throw new Error("Submission not found");
        if (submission.ratifiers.length >= submission.requiredRatifications) {
            await this.eventService.publish(EventTopic.SubmissionComplete, {
                submissionId: submissionId,
                redisKey: getSubmissionKey(submissionId),
                resultPaths: submission.items.map(si => si.outputPath!),
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

    async rejectSubmission(playerId: string, submissionId: string, reason: string): Promise<Boolean> {
        await this.crudService.addRejection(submissionId, playerId, reason);
        await this.eventService.publish(EventTopic.SubmissionRejectionAdded, {submissionId: submissionId, redisKey: getSubmissionKey(submissionId)});

        // TODO: support for different thresholds
        await this.eventService.publish(EventTopic.SubmissionRejected, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });
        return false;
    }

}
