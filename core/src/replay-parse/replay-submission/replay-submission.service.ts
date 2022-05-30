import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    ParsedReplay, ProgressMessage, ScrimPlayer, Task,
} from "@sprocketbot/common";
import {
    CeleryService,
    config,
    MatchmakingEndpoint,
    MatchmakingService,
    MinioService,
    Parser,
    RedisService,
    ResponseStatus,
    ScrimStatus,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {
    Match, MatchParent, Round, ScrimMeta,
} from "../../database";
import {ScrimService} from "../../scrim";
import {read} from "../../util/read";
import {REPLAY_SUBMISSION_PREFIX} from "../replay-parse.constants";
import type {ParseReplayResult} from "../replay-parse.types";
import type {BaseReplaySubmission, ReplaySubmission} from "./types/replay-submission.types";
import {ReplaySubmissionType} from "./types/replay-submission.types";
import type {ReplaySubmissionItem} from "./types/submission-item.types";
import type {ReplaySubmissionStats} from "./types/submission-stats.types";

@Injectable()
export class ReplaySubmissionService {
    private readonly logger = new Logger(ReplaySubmissionService.name);

    constructor(
        private readonly celeryService: CeleryService,
        private readonly redisService: RedisService,
        private readonly matchmakingService: MatchmakingService,
        private readonly scrimService: ScrimService,
        private readonly minioService: MinioService,
        @InjectRepository(ScrimMeta) private readonly scrimMetaRepo: Repository<ScrimMeta>,
        @InjectRepository(MatchParent) private readonly matchParentRepo: Repository<MatchParent>,
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        @InjectRepository(Round) private readonly roundRepo: Repository<Round>,
    ) {
    }

    async getSubmission(submissionId: string): Promise<ReplaySubmission> {
        const key = this.buildKey(submissionId);
        return this.redisService.getJson<ReplaySubmission>(key);
    }

    async getRatifiers(submissionId: string): Promise<ReplaySubmission["ratifiers"]> {
        const key = this.buildKey(submissionId);
        return this.redisService.getJson(key, "ratifiers");
    }

    async getItems(submissionId: string): Promise<ReplaySubmission["items"]> {
        const key = this.buildKey(submissionId);
        return this.redisService.getJson(key, "items");
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
            items: [],
            validated: false,
            ratifiers: [],
            stats: undefined,
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

    async removeSubmission(submissionId: string): Promise<void> {
        const key = this.buildKey(submissionId);
        return this.redisService.delete(key);
    }

    async endSubmission(submissionId: string, player: ScrimPlayer): Promise<void> {
        const isScrim = this.isScrimSubmission(submissionId);
        const isMatch = this.isMatchSubmission(submissionId);

        if (isScrim) {
            // Scrim must exist
            const scrimRes = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (scrimRes.status === ResponseStatus.ERROR) throw scrimRes.error;
            const scrim = scrimRes.data;
            if (!scrim) throw new Error(`Unable to end submission, could not find a scrim associated with submissionId=${submissionId}`);

            // Save stats on submission for ratification
            const stats = await this.calculateStats(submissionId);
            await this.setStats(submissionId, stats);

            // Move scrim to RATIFYING
            await this.scrimService.endScrim(player, scrim.id);
        } else if (isMatch) {
            throw new Error("Ending submissions for matches is not yet supported");
        } else {
            throw new Error(`submissionId=${submissionId} must begin with scrim- or match-`);
        }
    }

    async ratifySubmission(submissionId: string, playerId: number): Promise<boolean> {
        if (this.isScrimSubmission(submissionId)) {
            // Scrim must exist
            const scrimRes = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submissionId);
            if (scrimRes.status === ResponseStatus.ERROR) throw scrimRes.error;
            const scrim = scrimRes.data;
            if (!scrim) throw new Error(`Unable to ratify submission, could not find a scrim associated with submissionId=${submissionId}`);

            // Player must be in scrim
            const playerIds = scrim.players.map(p => p.id);
            if (!playerIds.includes(playerId)) throw new Error(`Unable to ratify submission, playerId=${playerId} is not a player in the associated scrim`);

            // Scrim must be RATIFYING
            if (scrim.status !== ScrimStatus.RATIFYING) throw new Error(`Unable to ratify submission, scrim must be ratifying`);

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

            await this.matchmakingService.send(MatchmakingEndpoint.CompleteScrim, {
                scrimId: scrim.id,
                playerId: playerId,
            });

            await this.removeSubmission(submissionId);

            this.logger.debug(`Submission ${submissionId} completed and removed`);

            return true;
        } else if (this.isMatchSubmission(submissionId)) {
            throw new Error("Submitting replays for matches is not implemented yet");
        } else {
            throw new Error(`Cannot determine submission type from submissionId=${submissionId}`);
        }
    }

    async upsertItem(submissionId: string, item: ReplaySubmissionItem): Promise<void> {
        const key = this.buildKey(submissionId);

        const existingItems = await this.redisService.getJson<ReplaySubmissionItem[] | undefined>(key, ".items");
        if (existingItems?.some(ei => ei.taskId === item.taskId)) {
            // The task is already in the array
            const t = {
                ...existingItems.find(ei => ei.taskId === item.taskId)!,
                ...item,
            };
            const i = existingItems.findIndex(ei => ei.taskId === item.taskId);
            await this.redisService.setJsonField(key, `items[${i}]`, t);
        } else {
            await this.redisService.appendToJsonArray(key, "items", item);
        }
    }

    async updateItemProgress(submissionId: string, progress: ProgressMessage<Task.ParseReplay>): Promise<void> {
        const items = await this.getItems(submissionId);
        const item = items.find(i => i.taskId === progress.taskId);
        if (!item) throw new Error(`Task with id ${progress.taskId} not found for submission ${submissionId}`);
        item.progress = progress;
        await this.upsertItem(submissionId, item);
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

    async setStats(submissionId: string, stats: ReplaySubmissionStats): Promise<void> {
        const key = this.buildKey(submissionId);
        await this.redisService.setJsonField(key, "stats", stats);
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

    private async calculateStats(submissionId: string): Promise<ReplaySubmissionStats> {
        // Get stats from Minio
        const items = await this.getItems(submissionId);
        if (!items.every(item => Boolean(item.outputPath))) {
            throw new Error(`Submission ${submissionId} has incomplete stats due to item with a missing outputPath`);
        }

        const promises = items.map(async item => {
            const outputPath = item.outputPath!; // Must exist because of our .every check above
            const stream = await this.minioService.get(config.minio.bucketNames.replays, outputPath);
            const b = await read(stream);
            return JSON.parse(b.toString()) as ParsedReplay;
        });
        const rawStats = await Promise.all(promises);

        return this.convertStats(rawStats);
    }

    private convertStats(rawStats: ParsedReplay[]): ReplaySubmissionStats {
        // TODO in the future, we will be able to translate the ballchasing player to a Sprocket member
        // in the validation step. Since we don't have that, for now we will just use the names from
        // the replays directly
        const out: ReplaySubmissionStats = {
            games: [],
        };

        for (const raw of rawStats) {
            const {parser, data} = raw;
            switch (parser) {
                case Parser.BALLCHASING: {
                    // teams = [blue, orange]
                    const blueWon = data.blue.stats.core.goals > data.orange.stats.core.goals;
                    const teams = [
                        {
                            won: blueWon,
                            score: data.blue.stats.core.goals,
                            players: data.blue.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
                            })),
                        },
                        {
                            won: !blueWon,
                            score: data.orange.stats.core.goals,
                            players: data.orange.players.map(p => ({
                                name: p.name,
                                goals: p.stats.core.goals,
                            })),
                        },
                    ];
                    out.games.push({teams});
                    break;
                }
                case Parser.CARBALL:
                default:
                    throw new Error(`Parser ${parser} is not supported!`);
            }
        }

        return out;
    }
}
