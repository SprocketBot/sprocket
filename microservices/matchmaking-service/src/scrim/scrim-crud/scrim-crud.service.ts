import {Injectable, Logger} from "@nestjs/common";
import type {
    Scrim, ScrimGame, ScrimPlayer,
} from "@sprocketbot/common";
import {
    config, RedisService, ScrimStatus,
} from "@sprocketbot/common";
import type {JobId} from "bull";
import {randomBytes} from "crypto";
import {v4} from "uuid";

import type {CreateScrimOpts} from "./types";

@Injectable()
export class ScrimCrudService {
    private readonly logger = new Logger(ScrimCrudService.name);

    private readonly prefix = `${config.redis.prefix}:scrim:`;

    constructor(private readonly redisService: RedisService) {
    }

    async createScrim({
        organizationId, settings, author, gameMode, skillGroupId,
    }: CreateScrimOpts): Promise<Scrim> {
        const scrim: Scrim = {
            id: v4(),
            organizationId: organizationId,
            players: [],
            settings: settings,
            status: ScrimStatus.PENDING,
            gameMode: gameMode,
            skillGroupId: skillGroupId,
            games: [],
        };
        if (author) {
            scrim.players.push(author);
        }

        await this.redisService.setJson(
            `${this.prefix}${scrim.id}`,
            scrim,
        );

        return scrim;
    }

    async removeScrim(id: string): Promise<void> {
        await this.redisService.deleteJsonField(`${this.prefix}${id}`, "$");
    }

    async getScrim(id: string): Promise<Scrim | null> {
        return this.redisService.getJson<Scrim>(`${this.prefix}${id}`);
    }

    async getAllScrims(skillGroupId?: number): Promise<Scrim[]> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        const scrims = await Promise.all(scrimKeys.map<Promise<Scrim>>(async key => this.redisService.getJson<Scrim>(key)));

        return skillGroupId ? scrims.filter(s => s.skillGroupId === skillGroupId || !s.settings.competitive) : scrims;
    }

    async getScrimByPlayer(id: number): Promise<Scrim | null> {
        this.logger.verbose(`GetScrimByPlayer id=${id}`);
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        for (const key of scrimKeys) {
            const playerIds = await this.redisService.getJson<number[]>(key, "$.players[*].id");

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!playerIds?.includes) {
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
    }

    async removePlayerFromScrim(scrimId: string, player: ScrimPlayer): Promise<void> {
        let [players] = await this.redisService.getJson<ScrimPlayer[][]>(`${this.prefix}${scrimId}`, "$.players");
        players = players.filter(p => p.id !== player.id);
        await this.redisService.deleteJsonField(`${this.prefix}${scrimId}`, "$.players");
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.players", players);
    }

    async updatePlayer(scrimId: string, player: ScrimPlayer): Promise<void> {
        const [players] = await this.redisService.getJson<ScrimPlayer[][]>(`${this.prefix}${scrimId}`, "$.players");
        const pi = players.findIndex(p => p.id === player.id);
        if (pi === -1) throw new Error("Player not in scrim!");
        players[pi] = player;
        await this.redisService.deleteJsonField(`${this.prefix}${scrimId}`, "$.players");
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.players", players);
    }

    async playerInAnyScrim(playerId: number): Promise<boolean> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        const allScrimPlayers = await Promise.all(scrimKeys.map(async k => this.redisService.getJson(k, "$.players[*].id")));
        return allScrimPlayers.flat().includes(playerId);
    }

    async updateScrimStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.status", status);
    }

    async updateScrimUnlockedStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.unlockedStatus", status);
    }

    async setSubmissionId(scrimId: string, submissionId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.submissionId", submissionId);
    }

    async setTimeoutJobId(scrimId: string, jobId: JobId): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.jobId", jobId);
    }

    async generateLobby(scrimId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.settings.lobby", {
            name: "sprocket",
            password: randomBytes(3).toString("hex"),
        });
    }

    async setScrimGames(scrimId: string, games: ScrimGame[]): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.games", games);
    }

    async getValidated(scrimId: string): Promise<boolean> {
        // Not implemented yet, so just throwing this here to get rid of a warning until it's added.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const submissionId = await this.redisService.getJson(`${this.prefix}${scrimId}`, "$.submissionId");
        return this.redisService.getJson(`${this.prefix}`);
    }
}
