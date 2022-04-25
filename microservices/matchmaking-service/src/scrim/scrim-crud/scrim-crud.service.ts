import {Injectable} from "@nestjs/common";
import type {
    Scrim, ScrimGame, ScrimPlayer,
} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";
import {RedisService} from "@sprocketbot/common";
import {v4} from "uuid";

import {config} from "../../util/config";
import type {CreateScrimOpts} from "./types";

@Injectable()
export class ScrimCrudService {
    private readonly prefix = `${config.redis.prefix}:scrim:`;

    constructor(private readonly redisService: RedisService) {
    }

    async createScrim({
        settings, author, gameMode,
    }: CreateScrimOpts): Promise<Scrim> {
        const scrim: Scrim = {
            id: v4(),
            players: [],
            settings: settings,
            status: ScrimStatus.PENDING,
            gameMode: gameMode,
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

    async getAllScrims(): Promise<Scrim[]> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        return Promise.all(scrimKeys.map<Promise<Scrim>>(async key => this.redisService.getJson<Scrim>(key)));
    }

    async getScrimByPlayer(id: number): Promise<Scrim | null> {
        const scrimKeys = await this.redisService.redis.keys(`${this.prefix}*`);
        for (const key of scrimKeys) {
            const playerIds = await this.redisService.getJson<number[]>(key, "$.players[*].id");
            if (playerIds.includes(id)) return this.redisService.getJson<[Scrim]>(key, "$").then(([r]) => r);
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

    async setSubmissionGroupId(scrimId: string, submissionGroupId: string): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.submissionGroupId", submissionGroupId);
    }

    async setScrimGames(scrimId: string, games: ScrimGame[]): Promise<void> {
        await this.redisService.setJsonField(`${this.prefix}${scrimId}`, "$.games", games);
    }

    async getValidated(scrimId: string): Promise<boolean> {
        const submissionId = await this.redisService.getJson(`${this.prefix}${scrimId}`, "$.submissionGroupId");
        return this.redisService.getJson(`${this.prefix}`);
    }
}
