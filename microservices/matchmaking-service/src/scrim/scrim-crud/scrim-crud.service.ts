import {Injectable} from "@nestjs/common";
import type {
    CreateScrimOptions,
    MatchmakingEndpoint,
    MatchmakingInput,
    Scrim,
    ScrimGame,
    ScrimPlayer,
    ScrimSettings,
} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";

import {ScrimPostgresRepository} from "../persistence/scrim-postgres.repository";
import {words} from "./words";

@Injectable()
export class ScrimCrudService {
    constructor(private readonly repository: ScrimPostgresRepository) {}

    async createScrim({
        authorId,
        organizationId,
        gameModeId,
        skillGroupId,
        settings,
        player,
    }: Omit<CreateScrimOptions, "join"> & {
        player?: ScrimPlayer;
    }): Promise<Scrim> {
        return this.repository.createScrim({
            authorId,
            organizationId,
            gameModeId,
            skillGroupId,
            settings,
            player,
        });
    }

    async createLFSScrim(
        authorId: number,
        organizationId: number,
        gameModeId: number,
        skillGroupId: number,
        settings: ScrimSettings,
        players: ScrimPlayer[],
        teams: ScrimPlayer[][],
        numRounds: number,
    ): Promise<Scrim> {
        return this.repository.createLFSScrim(
            authorId,
            organizationId,
            gameModeId,
            skillGroupId,
            settings,
            players,
            numRounds,
        );
    }

    async updateLFSScrim(scrim: Scrim): Promise<void> {
        await this.repository.saveScrim(scrim);
    }

    async removeScrim(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async getScrim(id: string): Promise<Scrim | null> {
        return this.repository.findById(id);
    }

    async getAllScrims(filters: MatchmakingInput<MatchmakingEndpoint.GetAllScrims> = {}): Promise<Scrim[]> {
        return this.repository.findAll(filters);
    }

    async getScrimsForClockCheck(): Promise<Scrim[]> {
        return this.repository.findForClockCheck();
    }

    async getScrimByPlayer(id: number): Promise<Scrim | null> {
        return this.repository.findByPlayer(id);
    }

    async getScrimBySubmissionId(submissionId: string): Promise<Scrim | null> {
        return this.repository.findBySubmissionId(submissionId);
    }

    async addPlayerToScrim(scrimId: string, player: ScrimPlayer): Promise<void> {
        await this.repository.addPlayer(scrimId, player);
    }

    async removePlayerFromScrim(scrimId: string, playerId: number): Promise<void> {
        await this.repository.removePlayer(scrimId, playerId);
    }

    async updatePlayer(scrimId: string, player: ScrimPlayer): Promise<void> {
        await this.repository.updatePlayer(scrimId, player);
    }

    async playerInAnyScrim(playerId: number): Promise<boolean> {
        return this.repository.playerInAnyScrim(playerId);
    }

    async updateScrimUpdatedAt(scrimId: string): Promise<void> {
        const scrim = await this.repository.findById(scrimId);
        if (!scrim) return;
        scrim.updatedAt = new Date();
        await this.repository.saveScrim(scrim);
    }

    async updateScrimStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.repository.updateStatus(scrimId, status);
    }

    async updateScrimUnlockedStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.repository.updateUnlockedStatus(scrimId, status);
    }

    async setSubmissionId(scrimId: string, submissionId: string): Promise<void> {
        await this.repository.setSubmissionId(scrimId, submissionId);
    }

    async setGroupInviteOpensAt(scrimId: string, opensAt: Date): Promise<void> {
        await this.repository.setGroupInviteOpensAt(scrimId, opensAt);
    }

    async generateLobby(scrimId: string): Promise<void> {
        await this.repository.setLobby(scrimId, {
            name: this.randomWord(),
            password: this.randomWord(),
        });
    }

    async setScrimGames(scrimId: string, games: ScrimGame[]): Promise<void> {
        await this.repository.setGames(scrimId, games);
    }

    private randomWord(): string {
        return words[Math.floor(Math.random() * words.length)];
    }
}
