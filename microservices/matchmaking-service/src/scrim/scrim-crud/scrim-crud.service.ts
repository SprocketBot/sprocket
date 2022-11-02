import {Injectable, Logger} from "@nestjs/common";
import type {CreateScrimOptions, Scrim, ScrimGame, ScrimPlayer} from "@sprocketbot/common";
import {config, RedisService, ScrimSchema, ScrimStatus} from "@sprocketbot/common";
import type {JobId} from "bull";
import {v4} from "uuid";

import {words} from "./words";

@Injectable()
export class ScrimCrudService {
    private readonly logger = new Logger(ScrimCrudService.name);

    private readonly prefix = `${config.redis.prefix}:scrim:`;

    constructor(private readonly redisService: RedisService) {}

    async createScrim({
        authorUserId,
        organizationId,
        gameModeId,
        skillGroupId,
        settings,
        player,
    }: Omit<CreateScrimOptions, "join"> & {
        player?: ScrimPlayer;
    }): Promise<Scrim> {
        const at = new Date();
        const scrim: Scrim = {
            id: v4(),
            createdAt: at,
            updatedAt: at,
            status: ScrimStatus.PENDING,
            authorUserId: authorUserId,
            organizationId: organizationId,
            gameModeId: gameModeId,
            skillGroupId: skillGroupId,
            players: [],
            games: [],
            settings: settings,
        };

        if (player) scrim.players.push(player);

        await this.redisService.setJson(`${this.prefix}${scrim.id}`, scrim);

        return scrim;
    }

    async removeScrim(id: string): Promise<void> {
        await this.redisService.deleteJsonField(`${this.prefix}${id}`, "$");
    }

    async getScrim(id: string): Promise<Scrim | null> {
        return this.redisService.getJsonIfExists<Scrim>(`${this.prefix}${id}`, ScrimSchema);
    }

    async getAllScrims(organizationId?: number, skillGroupIds?: number[]): Promise<Scrim[]> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        let scrims = await Promise.all(
            scrimKeys.map(async key => this.redisService.getJson<Scrim>(key, undefined, ScrimSchema)),
        );

        if (skillGroupIds)
            scrims = scrims.filter(scrim => skillGroupIds.includes(scrim.skillGroupId) && !scrim.settings.competitive);
        if (organizationId) scrims = scrims.filter(scrim => scrim.organizationId === organizationId);

        return scrims;
    }

    async getScrimByPlayer(id: number): Promise<Scrim | null> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        for (const key of scrimKeys) {
            const playerIds = await this.redisService.getJson<number[] | null | undefined>(key, "$.players[*].id");

            if (!playerIds) {
                this.logger.verbose(`GetScrimByPlayer id=${id} key=${key} playerIds is null`);
                continue;
            }

            if (playerIds.includes(id)) return this.redisService.getJson<[Scrim]>(key, "$").then(([r]) => r);
        }
        return null;
    }

    async getScrimBySubmissionId(submissionId: string): Promise<Scrim | null> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        for (const scrimKey of scrimKeys) {
            const [_submissionId] = await this.redisService.getJson<string[]>(scrimKey, "$.submissionId");
            if (_submissionId === submissionId) return this.redisService.getJson<Scrim>(scrimKey);
        }
        return null;
    }

    async addPlayerToScrim(scrimId: string, player: ScrimPlayer): Promise<void> {
        await this.redisService.appendToJsonArray<ScrimPlayer>(`${this.prefix}${scrimId}`, "players", player);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async removePlayerFromScrim(scrimId: string, playerId: number): Promise<void> {
        let [players] = await this.redisService.getJson<ScrimPlayer[][]>(`${this.prefix}${scrimId}`, "$.players");
        players = players.filter(p => p.userId !== playerId);
        await this.redisService.deleteJsonField(`${this.prefix}${scrimId}`, "$.players");
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.players", players);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async updatePlayer(scrimId: string, player: ScrimPlayer): Promise<void> {
        const [players] = await this.redisService.getJson<ScrimPlayer[][]>(`${this.prefix}${scrimId}`, "$.players");
        const pi = players.findIndex(p => p.userId === player.userId);
        if (pi === -1) throw new Error("Player not in scrim!");
        players[pi] = player;
        await this.redisService.deleteJsonField(`${this.prefix}${scrimId}`, "$.players");
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.players", players);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async playerInAnyScrim(playerId: number): Promise<boolean> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        const allScrimPlayers = await Promise.all(
            scrimKeys.map(async k => this.redisService.getJson(k, "$.players[*].id")),
        );
        return allScrimPlayers.flat().includes(playerId);
    }

    async updateScrimUpdatedAt(scrimId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.updatedAt", new Date());
    }

    async updateScrimStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.status", status);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async updateScrimUnlockedStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.unlockedStatus", status);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async setSubmissionId(scrimId: string, submissionId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.submissionId", submissionId);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async setTimeoutJobId(scrimId: string, jobId: JobId): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.jobId", jobId);
        await this.updateScrimUpdatedAt(scrimId);
    }

    async generateLobby(scrimId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.lobby", {
            name: this.randomWord(),
            password: this.randomWord(),
        });
        await this.updateScrimUpdatedAt(scrimId);
    }

    async setScrimGames(scrimId: string, games: ScrimGame[]): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.games", games);
        await this.updateScrimUpdatedAt(scrimId);
    }

    private randomWord(): string {
        return words[Math.floor(Math.random() * words.length)];
    }
}
