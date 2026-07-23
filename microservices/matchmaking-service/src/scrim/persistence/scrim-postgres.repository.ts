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
import {PostgresService, ScrimStatus} from "@sprocketbot/common";
import type {QueryResult, QueryResultRow} from "pg";
import {v4} from "uuid";

interface DbClient {
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
}

interface ScrimRow {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: ScrimStatus;
    unlocked_status?: ScrimStatus;
    author_id: number;
    organization_id: number;
    game_mode_id: number;
    skill_group_id: number;
    submission_id?: string;
    test_run_id?: string;
    timeout_job_id?: string;
    group_invite_opens_at?: Date;
    popped_at?: Date;
    lobby_name?: string;
    lobby_password?: string;
    settings_team_size: number;
    settings_team_count: number;
    settings_mode: ScrimSettings["mode"];
    settings_competitive: boolean;
    settings_observable: boolean;
    settings_lfs: boolean;
    settings_checkin_timeout: number;
}

interface ScrimPlayerRow {
    scrim_id?: string;
    player_id: number;
    name: string;
    joined_at: Date;
    leave_at: Date;
    group_key?: string;
    checked_in?: boolean;
}

interface ScrimGameRow {
    scrim_id?: string;
    id: number;
}

interface ScrimGamePlayerRow {
    game_scrim_id?: string;
    game_id: number;
    team_index: number;
    player_id: number;
    name: string;
    joined_at: Date;
    leave_at: Date;
    group_key?: string;
    checked_in?: boolean;
}

@Injectable()
export class ScrimPostgresRepository {
    constructor(private readonly postgres: PostgresService) {}

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
        const at = new Date();
        const scrim: Scrim = {
            id: v4(),
            createdAt: at,
            updatedAt: at,
            status: ScrimStatus.PENDING,
            authorId: authorId,
            organizationId: organizationId,
            gameModeId: gameModeId,
            skillGroupId: skillGroupId,
            players: player ? [player] : [],
            games: [],
            settings: settings,
        };
        await this.saveScrim(scrim);
        return scrim;
    }

    async createLFSScrim(
        authorId: number,
        organizationId: number,
        gameModeId: number,
        skillGroupId: number,
        settings: ScrimSettings,
        players: ScrimPlayer[],
        numRounds: number,
    ): Promise<Scrim> {
        const at = new Date();
        const scrim: Scrim = {
            id: v4(),
            createdAt: at,
            updatedAt: at,
            status: ScrimStatus.PENDING,
            authorId: authorId,
            organizationId: organizationId,
            gameModeId: gameModeId,
            skillGroupId: skillGroupId,
            players: [...players],
            games: [],
            settings: settings,
        };

        for (let i = 0;i < numRounds;i++) {
            const now = new Date();
            const placeholderDurationMs = 30 * 60 * 1000;
            scrim.games?.push({
                teams: ["orange", "blue"].map(() => ({
                    players: [
                        {
                            id: 1,
                            name: "Placeholder",
                            joinedAt: now,
                            leaveAt: new Date(now.getTime() + placeholderDurationMs),
                        },
                    ],
                })),
            });
        }

        await this.saveScrim(scrim);
        return scrim;
    }

    async createTestScrim(options: Omit<CreateScrimOptions, "join"> & {testRunId: string;}): Promise<Scrim> {
        const at = new Date();
        const scrim: Scrim = {
            id: v4(),
            createdAt: at,
            updatedAt: at,
            status: ScrimStatus.IN_PROGRESS,
            authorId: options.authorId,
            organizationId: options.organizationId,
            gameModeId: options.gameModeId,
            skillGroupId: options.skillGroupId,
            testRunId: options.testRunId,
            submissionId: `scrim-test-${v4()}`,
            players: [],
            games: [],
            settings: options.settings,
        };
        await this.saveScrim(scrim);
        return scrim;
    }

    async saveScrim(scrim: Scrim): Promise<void> {
        await this.postgres.transaction(async client => {
            await this.upsertScrimRow(client, scrim);
            await this.replacePlayers(client, scrim.id, scrim.players);
            await this.replaceGames(client, scrim.id, scrim.games ?? []);
        });
    }

    async delete(scrimId: string): Promise<void> {
        await this.postgres.query("DELETE FROM sprocket.scrim_queue WHERE id = $1", [scrimId]);
    }

    async findById(scrimId: string): Promise<Scrim | null> {
        const result = await this.postgres.query<ScrimRow>(
            "SELECT * FROM sprocket.scrim_queue WHERE id = $1",
            [scrimId],
        );
        if (!result.rows[0]) return null;
        return this.hydrate(result.rows[0]);
    }

    async findAll(filters: MatchmakingInput<MatchmakingEndpoint.GetAllScrims> = {}): Promise<Scrim[]> {
        // Filter at DB level using indexes - only load active scrims
        // This dramatically reduces data transfer and eliminates N+1 queries
        // Use the existing status and skill_group_id indexes
        let query = "SELECT * FROM sprocket.scrim_queue WHERE ";
        const params: unknown[] = [];
        const predicates: string[] = [];

        if (filters.status) {
            params.push(filters.status);
            predicates.push(`status = $${params.length}`);
        } else {
            predicates.push("status IN ('PENDING', 'POPPED', 'IN_PROGRESS')");
        }

        if (filters.organizationId !== undefined) {
            params.push(filters.organizationId);
            predicates.push(`organization_id = $${params.length}`);
        }

        if (filters.lfs !== undefined) {
            params.push(filters.lfs);
            predicates.push(`settings_lfs = $${params.length}`);
        }

        const skillGroupIds = Array.from(new Set([
            ...filters.skillGroupId !== undefined ? [filters.skillGroupId] : [],
            ...filters.skillGroupIds ?? [],
        ]));
        if (filters.skillGroupId !== undefined || filters.skillGroupIds !== undefined) {
            if (skillGroupIds.length > 0) {
                params.push(skillGroupIds);
                predicates.push(`(settings_competitive = false OR skill_group_id = ANY($${params.length}::int[]))`);
            } else {
                predicates.push("settings_competitive = false");
            }
        }

        query += predicates.join(" AND ");
        query += ` ORDER BY created_at ASC`;
        
        const result = await this.postgres.query<ScrimRow>(query, params);
        
        if (result.rows.length === 0) return [];
        
        // Batch load all players and games in just 2 queries instead of 2N+1
        const scrimIds = result.rows.map(row => row.id);
        const [allPlayers, allGames] = await Promise.all([
            this.loadPlayersBatch(scrimIds),
            this.loadGamesBatch(scrimIds),
        ]);
        
        // Map players and games to their respective scrims
        const playersByScrim = new Map<string, ScrimPlayer[]>();
        const gamesByScrim = new Map<string, ScrimGame[]>();
        
        for (const player of allPlayers) {
            const list = playersByScrim.get(player.scrimId) ?? [];
            list.push(player.player);
            playersByScrim.set(player.scrimId, list);
        }
        
        for (const game of allGames) {
            const list = gamesByScrim.get(game.scrimId) ?? [];
            list.push(game.game);
            gamesByScrim.set(game.scrimId, list);
        }
        
        // Build scrim objects using preloaded data
        return result.rows.map(row => {
            const players = playersByScrim.get(row.id) ?? [];
            const games = gamesByScrim.get(row.id) ?? [];
            
            return this.buildScrim(row, players, games);
        });
    }

    /**
     * Find scrims that need clock checking - those in PENDING or POPPED status.
     * Uses the status index for efficient queries.
     */
    async findForClockCheck(): Promise<Scrim[]> {
        const result = await this.postgres.query<ScrimRow>(`SELECT * FROM sprocket.scrim_queue
             WHERE status IN ('PENDING', 'POPPED') 
             ORDER BY updated_at ASC`);
        
        if (result.rows.length === 0) return [];
        
        // Batch load all players and games in just 2 queries
        const scrimIds = result.rows.map(row => row.id);
        const [allPlayers, allGames] = await Promise.all([
            this.loadPlayersBatch(scrimIds),
            this.loadGamesBatch(scrimIds),
        ]);
        
        // Map players and games to their respective scrims
        const playersByScrim = new Map<string, ScrimPlayer[]>();
        const gamesByScrim = new Map<string, ScrimGame[]>();
        
        for (const player of allPlayers) {
            const list = playersByScrim.get(player.scrimId) ?? [];
            list.push(player.player);
            playersByScrim.set(player.scrimId, list);
        }
        
        for (const game of allGames) {
            const list = gamesByScrim.get(game.scrimId) ?? [];
            list.push(game.game);
            gamesByScrim.set(game.scrimId, list);
        }
        
        return result.rows.map(row => {
            const players = playersByScrim.get(row.id) ?? [];
            const games = gamesByScrim.get(row.id) ?? [];
            return this.buildScrim(row, players, games);
        });
    }

    async findByPlayer(playerId: number): Promise<Scrim | null> {
        const result = await this.postgres.query<ScrimRow>(
            `
                SELECT s.*
                FROM sprocket.scrim_queue s
                INNER JOIN sprocket.scrim_queue_player p ON p.scrim_id = s.id
                WHERE p.player_id = $1
                ORDER BY s.created_at ASC
                LIMIT 1
            `,
            [playerId],
        );
        if (!result.rows[0]) return null;
        return this.hydrate(result.rows[0]);
    }

    async findBySubmissionId(submissionId: string): Promise<Scrim | null> {
        const result = await this.postgres.query<ScrimRow>(
            "SELECT * FROM sprocket.scrim_queue WHERE submission_id = $1 ORDER BY created_at ASC LIMIT 1",
            [submissionId],
        );
        if (!result.rows[0]) return null;
        return this.hydrate(result.rows[0]);
    }

    async playerInAnyScrim(playerId: number): Promise<boolean> {
        const result = await this.postgres.query<{exists: boolean;}>(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM sprocket.scrim_queue_player
                    WHERE player_id = $1
                ) AS exists
            `,
            [playerId],
        );
        return result.rows[0]?.exists ?? false;
    }

    async addPlayer(scrimId: string, player: ScrimPlayer): Promise<void> {
        await this.postgres.transaction(async client => {
            const result = await client.query<{position: number;}>(
                `
                    SELECT COALESCE(MAX(position) + 1, 0) AS position
                    FROM sprocket.scrim_queue_player
                    WHERE scrim_id = $1
                `,
                [scrimId],
            );
            await this.upsertPlayer(client, scrimId, player, result.rows[0].position);
            await this.touch(client, scrimId);
        });
    }

    async removePlayer(scrimId: string, playerId: number): Promise<void> {
        await this.postgres.transaction(async client => {
            await client.query(
                "DELETE FROM sprocket.scrim_queue_player WHERE scrim_id = $1 AND player_id = $2",
                [scrimId, playerId],
            );
            await this.touch(client, scrimId);
        });
    }

    async updatePlayer(scrimId: string, player: ScrimPlayer): Promise<void> {
        await this.postgres.transaction(async client => {
            const result = await client.query<{position: number;}>(
                `
                    SELECT position
                    FROM sprocket.scrim_queue_player
                    WHERE scrim_id = $1 AND player_id = $2
                `,
                [scrimId, player.id],
            );
            if (!result.rows[0]) throw new Error("Player not in scrim!");
            await this.upsertPlayer(client, scrimId, player, result.rows[0].position);
            await this.touch(client, scrimId);
        });
    }

    async updateStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.postgres.query(
            `
                UPDATE sprocket.scrim_queue
                SET status = $2,
                    popped_at = CASE WHEN $2 = $3 THEN COALESCE(popped_at, now()) ELSE popped_at END,
                    updated_at = now()
                WHERE id = $1
            `,
            [scrimId, status, ScrimStatus.POPPED],
        );
    }

    async updateUnlockedStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.scrim_queue SET unlocked_status = $2, updated_at = now() WHERE id = $1",
            [scrimId, status],
        );
    }

    async setSubmissionId(scrimId: string, submissionId: string): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.scrim_queue SET submission_id = $2, updated_at = now() WHERE id = $1",
            [scrimId, submissionId],
        );
    }

    async setGroupInviteOpensAt(scrimId: string, opensAt: Date): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.scrim_queue SET group_invite_opens_at = $2, updated_at = now() WHERE id = $1",
            [scrimId, opensAt],
        );
    }

    async setLobby(scrimId: string, lobby: {name: string; password: string;}): Promise<void> {
        await this.postgres.query(
            `
                UPDATE sprocket.scrim_queue
                SET lobby_name = $2, lobby_password = $3, updated_at = now()
                WHERE id = $1
            `,
            [scrimId, lobby.name, lobby.password],
        );
    }

    async setGames(scrimId: string, games: ScrimGame[]): Promise<void> {
        await this.postgres.transaction(async client => {
            await this.replaceGames(client, scrimId, games);
            await this.touch(client, scrimId);
        });
    }

    private async hydrate(row: ScrimRow): Promise<Scrim> {
        const [players, games] = await Promise.all([
            this.loadPlayers(this.postgres, row.id),
            this.loadGames(this.postgres, row.id),
        ]);

        return {
            id: row.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            status: row.status,
            unlockedStatus: row.unlocked_status ?? undefined,
            authorId: row.author_id,
            organizationId: row.organization_id,
            gameModeId: row.game_mode_id,
            skillGroupId: row.skill_group_id,
            submissionId: row.submission_id ?? undefined,
            testRunId: row.test_run_id ?? undefined,
            timeoutJobId: row.timeout_job_id ? Number(row.timeout_job_id) : undefined,
            groupInviteOpensAt: row.group_invite_opens_at ?? undefined,
            poppedAt: row.popped_at ?? undefined,
            players: players,
            games: games,
            lobby: row.lobby_name && row.lobby_password
                ? {name: row.lobby_name, password: row.lobby_password}
                : undefined,
            settings: {
                teamSize: row.settings_team_size,
                teamCount: row.settings_team_count,
                mode: row.settings_mode,
                competitive: row.settings_competitive,
                observable: row.settings_observable,
                lfs: row.settings_lfs,
                checkinTimeout: row.settings_checkin_timeout,
            },
        };
    }

    private async upsertScrimRow(client: DbClient, scrim: Scrim): Promise<void> {
        await client.query(
            `
                INSERT INTO sprocket.scrim_queue (
                    id,
                    created_at,
                    updated_at,
                    status,
                    unlocked_status,
                    author_id,
                    organization_id,
                    game_mode_id,
                    skill_group_id,
                    submission_id,
                    test_run_id,
                    timeout_job_id,
                    group_invite_opens_at,
                    popped_at,
                    lobby_name,
                    lobby_password,
                    settings_team_size,
                    settings_team_count,
                    settings_mode,
                    settings_competitive,
                    settings_observable,
                    settings_lfs,
                    settings_checkin_timeout
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                ON CONFLICT (id) DO UPDATE SET
                    updated_at = EXCLUDED.updated_at,
                    status = EXCLUDED.status,
                    unlocked_status = EXCLUDED.unlocked_status,
                    author_id = EXCLUDED.author_id,
                    organization_id = EXCLUDED.organization_id,
                    game_mode_id = EXCLUDED.game_mode_id,
                    skill_group_id = EXCLUDED.skill_group_id,
                    submission_id = EXCLUDED.submission_id,
                    test_run_id = EXCLUDED.test_run_id,
                    timeout_job_id = EXCLUDED.timeout_job_id,
                    group_invite_opens_at = EXCLUDED.group_invite_opens_at,
                    popped_at = EXCLUDED.popped_at,
                    lobby_name = EXCLUDED.lobby_name,
                    lobby_password = EXCLUDED.lobby_password,
                    settings_team_size = EXCLUDED.settings_team_size,
                    settings_team_count = EXCLUDED.settings_team_count,
                    settings_mode = EXCLUDED.settings_mode,
                    settings_competitive = EXCLUDED.settings_competitive,
                    settings_observable = EXCLUDED.settings_observable,
                    settings_lfs = EXCLUDED.settings_lfs,
                    settings_checkin_timeout = EXCLUDED.settings_checkin_timeout
            `,
            [
                scrim.id,
                scrim.createdAt,
                scrim.updatedAt,
                scrim.status,
                scrim.unlockedStatus ?? null,
                scrim.authorId,
                scrim.organizationId,
                scrim.gameModeId,
                scrim.skillGroupId,
                scrim.submissionId ?? null,
                scrim.testRunId ?? null,
                scrim.timeoutJobId ? `${scrim.timeoutJobId}` : null,
                scrim.groupInviteOpensAt ?? null,
                scrim.poppedAt ?? null,
                scrim.lobby?.name ?? null,
                scrim.lobby?.password ?? null,
                scrim.settings.teamSize,
                scrim.settings.teamCount,
                scrim.settings.mode,
                scrim.settings.competitive,
                scrim.settings.observable,
                scrim.settings.lfs,
                scrim.settings.checkinTimeout,
            ],
        );
    }

    private async replacePlayers(client: DbClient, scrimId: string, players: ScrimPlayer[]): Promise<void> {
        await client.query("DELETE FROM sprocket.scrim_queue_player WHERE scrim_id = $1", [scrimId]);
        await Promise.all(players.map(async (player, index) => this.upsertPlayer(client, scrimId, player, index)));
    }

    private async upsertPlayer(
        client: DbClient,
        scrimId: string,
        player: ScrimPlayer,
        position: number,
    ): Promise<void> {
        await client.query(
            `
                INSERT INTO sprocket.scrim_queue_player (
                    scrim_id,
                    player_id,
                    position,
                    name,
                    joined_at,
                    leave_at,
                    group_key,
                    checked_in
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (scrim_id, player_id) DO UPDATE SET
                    position = EXCLUDED.position,
                    name = EXCLUDED.name,
                    joined_at = EXCLUDED.joined_at,
                    leave_at = EXCLUDED.leave_at,
                    group_key = EXCLUDED.group_key,
                    checked_in = EXCLUDED.checked_in
            `,
            [
                scrimId,
                player.id,
                position,
                player.name,
                player.joinedAt,
                player.leaveAt,
                player.group ?? null,
                player.checkedIn ?? null,
            ],
        );
    }

    private async replaceGames(client: DbClient, scrimId: string, games: ScrimGame[]): Promise<void> {
        await client.query("DELETE FROM sprocket.scrim_queue_game WHERE scrim_id = $1", [scrimId]);
        for (const [gameIndex, game] of games.entries()) {
            const gameResult = await client.query<{id: number;}>(
                `
                    INSERT INTO sprocket.scrim_queue_game (scrim_id, position)
                    VALUES ($1, $2)
                    RETURNING id
                `,
                [scrimId, gameIndex],
            );
            const gameId = gameResult.rows[0].id;
            for (const [teamIndex, team] of game.teams.entries()) {
                await Promise.all(team.players.map(async (player, playerIndex) => client.query(
                    `
                        INSERT INTO sprocket.scrim_queue_game_player (
                            game_id,
                            team_index,
                            position,
                            player_id,
                            name,
                            joined_at,
                            leave_at,
                            group_key,
                            checked_in
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `,
                    [
                        gameId,
                        teamIndex,
                        playerIndex,
                        player.id,
                        player.name,
                        player.joinedAt,
                        player.leaveAt,
                        player.group ?? null,
                        player.checkedIn ?? null,
                    ],
                )));
            }
        }
    }

    private async loadPlayers(client: DbClient, scrimId: string): Promise<ScrimPlayer[]> {
        const result = await client.query<ScrimPlayerRow>(
            `
                SELECT player_id, name, joined_at, leave_at, group_key, checked_in
                FROM sprocket.scrim_queue_player
                WHERE scrim_id = $1
                ORDER BY position ASC
            `,
            [scrimId],
        );
        return result.rows.map(row => this.mapPlayer(row));
    }

    private async loadGames(client: DbClient, scrimId: string): Promise<ScrimGame[]> {
        const gameResult = await client.query<ScrimGameRow>(
            `
                SELECT id
                FROM sprocket.scrim_queue_game
                WHERE scrim_id = $1
                ORDER BY position ASC
            `,
            [scrimId],
        );
        if (!gameResult.rows.length) return [];

        const playerResult = await client.query<ScrimGamePlayerRow>(
            `
                SELECT game_id, team_index, player_id, name, joined_at, leave_at, group_key, checked_in
                FROM sprocket.scrim_queue_game_player
                WHERE game_id = ANY($1::int[])
                ORDER BY game_id ASC, team_index ASC, position ASC
            `,
            [gameResult.rows.map(row => row.id)],
        );

        return gameResult.rows.map(game => {
            const players = playerResult.rows.filter(row => row.game_id === game.id);
            const teamCount = Math.max(-1, ...players.map(row => row.team_index)) + 1;
            return {
                teams: Array.from({length: teamCount}).map((_, teamIndex) => ({
                    players: players
                        .filter(row => row.team_index === teamIndex)
                        .map(row => this.mapPlayer(row)),
                })),
            };
        });
    }

    private mapPlayer(row: ScrimPlayerRow | ScrimGamePlayerRow): ScrimPlayer {
        return {
            id: row.player_id,
            name: row.name,
            joinedAt: row.joined_at,
            leaveAt: row.leave_at,
            group: row.group_key ?? undefined,
            checkedIn: row.checked_in ?? undefined,
        };
    }

    /**
     * Batch load players for multiple scrims in a single query.
     * Reduces N+1 queries to just 1 query.
     */
    private async loadPlayersBatch(scrimIds: string[]): Promise<Array<{scrimId: string; player: ScrimPlayer;}>> {
        if (scrimIds.length === 0) return [];
        
        const result = await this.postgres.query<ScrimPlayerRow & {scrim_id: string;}>(
            `
                SELECT scrim_id, player_id, name, joined_at, leave_at, group_key, checked_in
                FROM sprocket.scrim_queue_player
                WHERE scrim_id = ANY($1::uuid[])
                ORDER BY scrim_id, position ASC
            `,
            [scrimIds],
        );
        
        return result.rows.map(row => ({
            scrimId: row.scrim_id,
            player: this.mapPlayer(row),
        }));
    }

    /**
     * Batch load games for multiple scrims in a single query.
     * Reduces N+1 queries to just 2 queries (games + players).
     */
    private async loadGamesBatch(scrimIds: string[]): Promise<Array<{scrimId: string; game: ScrimGame;}>> {
        if (scrimIds.length === 0) return [];
        
        const gameResult = await this.postgres.query<ScrimGameRow & {scrim_id: string;}>(
            `
                SELECT scrim_id, id
                FROM sprocket.scrim_queue_game
                WHERE scrim_id = ANY($1::uuid[])
                ORDER BY scrim_id, position ASC
            `,
            [scrimIds],
        );
        
        if (gameResult.rows.length === 0) return [];
        
        const gameIds = gameResult.rows.map(row => row.id);
        
        const playerResult = await this.postgres.query<ScrimGamePlayerRow & {game_scrim_id: string;}>(
            `
                SELECT
                    qg.scrim_id as game_scrim_id,
                    gp.game_id,
                    gp.team_index,
                    gp.player_id,
                    gp.name,
                    gp.joined_at,
                    gp.leave_at,
                    gp.group_key,
                    gp.checked_in
                FROM sprocket.scrim_queue_game_player gp
                INNER JOIN sprocket.scrim_queue_game qg ON qg.id = gp.game_id
                WHERE gp.game_id = ANY($1::int[])
                ORDER BY gp.game_id ASC, gp.team_index ASC, gp.position ASC
            `,
            [gameIds],
        );
        
        // Group players by game_id for efficient lookup
        const playersByGame = new Map<number, ScrimGamePlayerRow[]>();
        for (const row of playerResult.rows) {
            const list = playersByGame.get(row.game_id) ?? [];
            list.push(row);
            playersByGame.set(row.game_id, list);
        }
        
        // Build games with their players
        const gamesByScrim = new Map<string, ScrimGame[]>();
        
        for (const gameRow of gameResult.rows) {
            const players = playersByGame.get(gameRow.id) ?? [];
            const teamCount = Math.max(-1, ...players.map(row => row.team_index)) + 1;
            
            const game: ScrimGame = {
                teams: Array.from({length: teamCount}).map((_, teamIndex) => ({
                    players: players
                        .filter(row => row.team_index === teamIndex)
                        .map(row => this.mapPlayer(row)),
                })),
            };
            
            const list = gamesByScrim.get(gameRow.scrim_id) ?? [];
            list.push(game);
            gamesByScrim.set(gameRow.scrim_id, list);
        }
        
        // Flatten to array format
        const result: Array<{scrimId: string; game: ScrimGame;}> = [];
        for (const [scrimId, games] of gamesByScrim) {
            for (const game of games) {
                result.push({scrimId, game});
            }
        }
        
        return result;
    }

    /**
     * Build a Scrim object from a row with preloaded players and games.
     */
    private buildScrim(row: ScrimRow, players: ScrimPlayer[], games: ScrimGame[]): Scrim {
        return {
            id: row.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            status: row.status,
            unlockedStatus: row.unlocked_status ?? undefined,
            authorId: row.author_id,
            organizationId: row.organization_id,
            gameModeId: row.game_mode_id,
            skillGroupId: row.skill_group_id,
            submissionId: row.submission_id ?? undefined,
            testRunId: row.test_run_id ?? undefined,
            timeoutJobId: row.timeout_job_id ? Number(row.timeout_job_id) : undefined,
            groupInviteOpensAt: row.group_invite_opens_at ?? undefined,
            poppedAt: row.popped_at ?? undefined,
            players: players,
            games: games,
            lobby: row.lobby_name && row.lobby_password
                ? {name: row.lobby_name, password: row.lobby_password}
                : undefined,
            settings: {
                teamSize: row.settings_team_size,
                teamCount: row.settings_team_count,
                mode: row.settings_mode,
                competitive: row.settings_competitive,
                observable: row.settings_observable,
                lfs: row.settings_lfs,
                checkinTimeout: row.settings_checkin_timeout,
            },
        };
    }

    private async touch(client: DbClient, scrimId: string): Promise<void> {
        await client.query(
            "UPDATE sprocket.scrim_queue SET updated_at = now() WHERE id = $1",
            [scrimId],
        );
    }
}
