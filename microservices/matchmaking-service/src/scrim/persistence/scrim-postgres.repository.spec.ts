import type {PostgresService} from "@sprocketbot/common";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";

import {ScrimPostgresRepository} from "./scrim-postgres.repository";

describe("ScrimPostgresRepository", () => {
    it("hydrates a scrim from typed Postgres relations", async () => {
        const query = jest.fn()
            .mockResolvedValueOnce({
                rows: [ {
                    id: "00000000-0000-4000-8000-000000000001",
                    created_at: new Date("2026-01-01T00:00:00.000Z"),
                    updated_at: new Date("2026-01-01T00:01:00.000Z"),
                    status: ScrimStatus.POPPED,
                    unlocked_status: null,
                    author_id: 1,
                    organization_id: 2,
                    game_mode_id: 3,
                    skill_group_id: 4,
                    submission_id: "scrim-submission",
                    timeout_job_id: null,
                    group_invite_opens_at: null,
                    popped_at: new Date("2026-01-01T00:01:00.000Z"),
                    lobby_name: "lobby",
                    lobby_password: "pass",
                    settings_team_size: 3,
                    settings_team_count: 2,
                    settings_mode: ScrimMode.TEAMS,
                    settings_competitive: true,
                    settings_observable: false,
                    settings_lfs: false,
                    settings_checkin_timeout: 120000,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    player_id: 10,
                    name: "Player",
                    joined_at: new Date("2026-01-01T00:00:00.000Z"),
                    leave_at: new Date("2026-01-01T00:05:00.000Z"),
                    group_key: "A",
                    checked_in: true,
                } ],
            })
            .mockResolvedValueOnce({rows: [ {id: 99} ] })
            .mockResolvedValueOnce({
                rows: [ {
                    game_id: 99,
                    team_index: 0,
                    player_id: 10,
                    name: "Player",
                    joined_at: new Date("2026-01-01T00:00:00.000Z"),
                    leave_at: new Date("2026-01-01T00:05:00.000Z"),
                    group_key: "A",
                    checked_in: true,
                } ],
            });
        const repo = new ScrimPostgresRepository({query} as unknown as PostgresService);

        const scrim = await repo.findBySubmissionId("scrim-submission");

        expect(scrim).toMatchObject({
            id: "00000000-0000-4000-8000-000000000001",
            status: ScrimStatus.POPPED,
            authorId: 1,
            organizationId: 2,
            gameModeId: 3,
            skillGroupId: 4,
            submissionId: "scrim-submission",
            lobby: {name: "lobby", password: "pass"},
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.TEAMS,
                competitive: true,
                observable: false,
                lfs: false,
                checkinTimeout: 120000,
            },
            players: [ {
                id: 10,
                name: "Player",
                group: "A",
                checkedIn: true,
            } ],
            games: [ {
                teams: [ {
                    players: [ {
                        id: 10,
                        name: "Player",
                        group: "A",
                        checkedIn: true,
                    } ],
                } ],
            } ],
        });
    });

    it("persists a created scrim through normalized scrim and player rows", async () => {
        const client = {query: jest.fn().mockResolvedValue({rows: [] })};
        const transaction = jest.fn(async (cb: (value: typeof client) => Promise<unknown>) => cb(client));
        const repo = new ScrimPostgresRepository({transaction} as unknown as PostgresService);

        const scrim = await repo.createScrim({
            authorId: 1,
            organizationId: 2,
            gameModeId: 3,
            skillGroupId: 4,
            settings: {
                teamSize: 3,
                teamCount: 2,
                mode: ScrimMode.TEAMS,
                competitive: true,
                observable: false,
                lfs: false,
                checkinTimeout: 120000,
            },
            player: {
                id: 10,
                name: "Player",
                joinedAt: new Date("2026-01-01T00:00:00.000Z"),
                leaveAt: new Date("2026-01-01T00:05:00.000Z"),
            },
        });

        expect(scrim.players).toHaveLength(1);
        expect(transaction).toHaveBeenCalledTimes(1);
        expect(client.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO sprocket.scrim_queue"),
            expect.arrayContaining([scrim.id, ScrimStatus.PENDING, 1, 2, 3, 4]),
        );
        expect(client.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO sprocket.scrim_queue_player"),
            [
                scrim.id,
                10,
                0,
                "Player",
                new Date("2026-01-01T00:00:00.000Z"),
                new Date("2026-01-01T00:05:00.000Z"),
                null,
                null,
            ],
        );
    });

    it("hydrates all scrims with batched game rows", async () => {
        const query = jest.fn()
            .mockResolvedValueOnce({
                rows: [ {
                    id: "00000000-0000-4000-8000-000000000001",
                    created_at: new Date("2026-01-01T00:00:00.000Z"),
                    updated_at: new Date("2026-01-01T00:01:00.000Z"),
                    status: ScrimStatus.IN_PROGRESS,
                    unlocked_status: null,
                    author_id: 1,
                    organization_id: 2,
                    game_mode_id: 3,
                    skill_group_id: 4,
                    submission_id: "scrim-submission",
                    timeout_job_id: null,
                    group_invite_opens_at: null,
                    popped_at: new Date("2026-01-01T00:01:00.000Z"),
                    lobby_name: "lobby",
                    lobby_password: "pass",
                    settings_team_size: 3,
                    settings_team_count: 2,
                    settings_mode: ScrimMode.TEAMS,
                    settings_competitive: true,
                    settings_observable: false,
                    settings_lfs: false,
                    settings_checkin_timeout: 120000,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    scrim_id: "00000000-0000-4000-8000-000000000001",
                    player_id: 10,
                    name: "Player",
                    joined_at: new Date("2026-01-01T00:00:00.000Z"),
                    leave_at: new Date("2026-01-01T00:05:00.000Z"),
                    group_key: "A",
                    checked_in: true,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    scrim_id: "00000000-0000-4000-8000-000000000001",
                    id: 99,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    game_scrim_id: "00000000-0000-4000-8000-000000000001",
                    game_id: 99,
                    team_index: 0,
                    player_id: 10,
                    name: "Player",
                    joined_at: new Date("2026-01-01T00:00:00.000Z"),
                    leave_at: new Date("2026-01-01T00:05:00.000Z"),
                    group_key: "A",
                    checked_in: true,
                } ],
            });
        const repo = new ScrimPostgresRepository({query} as unknown as PostgresService);

        const scrims = await repo.findAll();

        expect(scrims).toMatchObject([ {
            id: "00000000-0000-4000-8000-000000000001",
            games: [ {
                teams: [ {
                    players: [ {
                        id: 10,
                        name: "Player",
                        group: "A",
                        checkedIn: true,
                    } ],
                } ],
            } ],
        } ]);
        expect(query.mock.calls[3][0]).toContain("INNER JOIN sprocket.scrim_queue_game qg ON qg.id = gp.game_id");
        expect(query.mock.calls[3][0]).not.toContain("SELECT g.scrim_id");
    });

    it("pushes scrim list filters into the Postgres query", async () => {
        const query = jest.fn().mockResolvedValue({rows: [] });
        const repo = new ScrimPostgresRepository({query} as unknown as PostgresService);

        await repo.findAll({
            organizationId: 2,
            status: ScrimStatus.PENDING,
            skillGroupIds: [4, 5],
            lfs: false,
        });

        expect(query).toHaveBeenCalledTimes(1);
        expect(query.mock.calls[0][0]).toContain("status = $1");
        expect(query.mock.calls[0][0]).toContain("organization_id = $2");
        expect(query.mock.calls[0][0]).toContain("settings_lfs = $3");
        expect(query.mock.calls[0][0]).toContain("(settings_competitive = false OR skill_group_id = ANY($4::int[]))");
        expect(query.mock.calls[0][1]).toEqual([ScrimStatus.PENDING, 2, false, [4, 5] ]);
    });

    it("updates status in the scrim table and stamps popped time for popped scrims", async () => {
        const query = jest.fn().mockResolvedValue({rows: [] });
        const repo = new ScrimPostgresRepository({query} as unknown as PostgresService);

        await repo.updateStatus("00000000-0000-4000-8000-000000000001", ScrimStatus.POPPED);

        expect(query).toHaveBeenCalledWith(
            expect.stringContaining("popped_at = CASE WHEN $2 = $3"),
            ["00000000-0000-4000-8000-000000000001", ScrimStatus.POPPED, ScrimStatus.POPPED],
        );
    });
});
