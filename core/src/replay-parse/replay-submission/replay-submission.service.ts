import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {
    CeleryService,
    MatchmakingEndpoint, MatchmakingService, RedisService, ResponseStatus, ScrimStatus,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {
    Match, MatchParent, Round, ScrimMeta,
} from "../../database";
import {config} from "../../util/config";
import {REPLAY_SUBMISSION_PREFIX} from "../replay-parse.constants";
import type {ParseReplayResult} from "../replay-parse.types";
import type {BaseReplaySubmission, ReplaySubmission} from "./replay-submission.types";
import {ReplaySubmissionType} from "./replay-submission.types";

@Injectable()
export class ReplaySubmissionService {
    private readonly logger = new Logger(ReplaySubmissionService.name);

    constructor(
        private readonly celeryService: CeleryService,
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        @InjectRepository(ScrimMeta) private readonly scrimMetaRepo: Repository<ScrimMeta>,
        @InjectRepository(MatchParent) private readonly matchParentRepo: Repository<MatchParent>,
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        @InjectRepository(Round) private readonly roundRepo: Repository<Round>,
    ) {}

    async getSubmission(submissionId: string): Promise<ReplaySubmission> {
        const key = this.buildKey(submissionId);
        return this.redisService.getJson<ReplaySubmission>(key);
    }

    async getRatifiers(submissionId: string): Promise<ReplaySubmission["ratifiers"]> {
        const key = this.buildKey(submissionId);
        return this.redisService.getJson(key, "ratifiers");
    }

    async isRatified(submissionId: string): Promise<boolean> {
        const submission = await this.getSubmission(submissionId);
        return submission.ratifiers.length >= submission.requiredRatifications;
    }

    async submissionExists(submissionId: string): Promise<boolean> {
        const key = this.buildKey(submissionId);
        return this.redisService.keyExists(key);
    }

    async canCreateSubmission(submissionId: string, playerId: number): Promise<string | null> {
        const key = this.buildKey(submissionId);

        // Check that no submission exists already
        const exists = await this.redisService.keyExists(key);
        if (exists) return `Unable to create submission, a submission already exists for submissionId=${submissionId}`;

        if (this.isScrimSubmission(submissionId)) {
            // Scrim must exist
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) return `Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`;

            // Player must be in scrim
            const playerIds = scrim.players.map(p => p.id);
            if (!playerIds.includes(playerId)) return `Unable to create submission, playerId=${playerId} is not a player in the associated scrim`;

            // Scrim must be IN_PROGRESS
            if (scrim.status !== ScrimStatus.IN_PROGRESS) return `Unable to create submission, scrim must be in progress`;
        } else if (this.isMatchSubmission(submissionId)) {
            return "Submitting replays for matches is not implemented yet";
        } else {
            return `Cannot determine submission type from submissionId=${submissionId}`;
        }

        return null;
    }

    async createSubmission(submissionId: string, playerId: number): Promise<ReplaySubmission> {
        const isScrim = this.isScrimSubmission(submissionId);
        const isMatch = this.isMatchSubmission(submissionId);

        const commonFields: BaseReplaySubmission = {
            creatorId: playerId,
            taskIds: [],
            objects: [],
            validated: false,
            ratifiers: [],
            requiredRatifications: 1, // TODO configurable by organization (1, majority, unanimous)
        };
        let submission: ReplaySubmission;

        if (isScrim) {
            const result = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (result.status === ResponseStatus.ERROR) throw result.error;
            const scrim = result.data;
            if (!scrim) throw new Error(`Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`);

            submission = {
                ...commonFields,
                type: ReplaySubmissionType.SCRIM,
                scrimId: scrim.id,
            };
        } else if (isMatch) {
            throw new Error("Creating submissions for matches is not yet supported");
        } else {
            throw new Error(`submissionId=${submissionId} must begin with scrim- or match-`);
        }

        const key = this.buildKey(submissionId);
        await this.redisService.setJson(key, submission);

        return submission;
    }

    async ratifySubmission(submissionId: string, playerId: number): Promise<boolean> {
        if (this.isScrimSubmission(submissionId)) {
            // Scrim must exist
            const scrimRes = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (scrimRes.status === ResponseStatus.ERROR) throw scrimRes.error;
            const scrim = scrimRes.data;
            if (!scrim) throw new Error(`Unable to create submission, could not find a scrim associated with submissionId=${submissionId}`);

            // Player must be in scrim
            const playerIds = scrim.players.map(p => p.id);
            if (!playerIds.includes(playerId)) throw new Error(`Unable to create submission, playerId=${playerId} is not a player in the associated scrim`);

            // Scrim must be IN_PROGRESS
            if (scrim.status !== ScrimStatus.RATIFYING) throw new Error(`Unable to create submission, scrim must be ratifying`);

            // Add player to ratifiers
            await this.addRatifier(submissionId, playerId);

            const ratified = await this.isRatified(submissionId);
            if (!ratified) return true;

            this.logger.log(`scrim ${scrim.id} ratified!`);

            // TODO save to DB
            const submission = await this.getSubmission(submissionId);
            
            // Create Scrim/MatchParent/Match for scrim
            const scrimMeta = this.scrimMetaRepo.create();
            const matchParent = this.matchParentRepo.create();
            const match = this.matchRepo.create();

            // Create rounds for match
            const promises = submission.taskIds.map(async taskId => {
                const resultKey = this.celeryService.buildResultKey(taskId);
                const parsed = await this.redisService.getString<ParseReplayResult>(resultKey);
                if (!parsed) throw new Error(`Unable to find parsed replay for submissionId=${submissionId} at key=${resultKey}`);
                return parsed;
            });
            const parsedReplays = await Promise.all(promises);

            const rounds = parsedReplays.map(pr => this.roundRepo.create({
                match: match,
                roundStats: pr,
                homeWon: false,
            }));

            // Create relationships
            scrimMeta.parent = matchParent;
            matchParent.scrimMeta = scrimMeta;
            matchParent.match = match;
            match.matchParent = matchParent;
            match.rounds = rounds;

            // Save in DB
            await this.roundRepo.save(rounds);
            await this.matchRepo.save(match);
            await this.scrimMetaRepo.save(scrimMeta);
            await this.matchParentRepo.save(matchParent);

            // TODO complete scrim
            await this.matchmakingService.send(MatchmakingEndpoint.CompleteScrim, {
                scrimId: scrim.id,
                playerId: playerId,
            });

            return true;

        } else if (this.isMatchSubmission(submissionId)) {
            throw new Error("Submitting replays for matches is not implemented yet");
        } else {
            throw new Error(`Cannot determine submission type from submissionId=${submissionId}`);
        }
    }

    async addTaskId(submissionId: string, taskId: string): Promise<void> {
        const key = this.buildKey(submissionId);
        await this.redisService.appendToJsonArray(key, "taskIds", taskId);
    }

    async addObject(submissionId: string, object: string): Promise<void> {
        const key = this.buildKey(submissionId);
        await this.redisService.appendToJsonArray(key, "objects", object);
    }

    async addRatifier(submissionId: string, playerId: number): Promise<void> {
        const ratifiers = await this.getRatifiers(submissionId);

        // Players cannot ratify a scrim twice
        if (ratifiers.includes(playerId)) return;

        const key = this.buildKey(submissionId);
        await this.redisService.appendToJsonArray(key, "ratifiers", playerId);
    }

    async setValidatedTrue(submissionId: string): Promise<void> {
        const key = this.buildKey(submissionId);
        await this.redisService.setJsonField(key, "validated", true);
    }

    private buildKey(submissionId: string): string {
        return `${config.redis.prefix}:${REPLAY_SUBMISSION_PREFIX}:${submissionId}`;
    }

    private isScrimSubmission(submissionId: string): boolean {
        return Boolean(submissionId.startsWith("scrim-"));
    }

    private isMatchSubmission(submissionId: string): boolean {
        return Boolean(submissionId.startsWith("match-"));
    }


}
