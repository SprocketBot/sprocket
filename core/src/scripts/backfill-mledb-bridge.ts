import "reflect-metadata";

import {DataSource} from "typeorm";

type BridgeTable =
  | "league_to_skill_group"
  | "division_to_franchise_group"
  | "team_to_franchise"
  | "season_to_schedule_group"
  | "match_to_schedule_group"
  | "fixture_to_fixture"
  | "series_to_match_parent"
  | "player_to_user"
  | "player_to_player";

const ALL_TABLES: BridgeTable[] = [
    "league_to_skill_group",
    "division_to_franchise_group",
    "team_to_franchise",
    "season_to_schedule_group",
    "match_to_schedule_group",
    "fixture_to_fixture",
    "series_to_match_parent",
    "player_to_user",
    "player_to_player",
];

function parseArgs(argv: string[]) {
    const args = new Set(argv.slice(2));
    const getValue = (flag: string): string | undefined => {
        const idx = argv.indexOf(flag);
        if (idx === -1) return undefined;
        return argv[idx + 1];
    };

    const dryRun = args.has("--dry-run") || args.has("-n");
    const ssl = args.has("--ssl");
    const sslNoVerify = args.has("--ssl-no-verify");
    const onlyRaw = getValue("--only");
    const only = onlyRaw
        ? (onlyRaw
              .split(",")
              .map(s => s.trim())
              .filter(Boolean) as BridgeTable[])
        : undefined;

    const help = args.has("--help") || args.has("-h");

    return {
        dryRun,
        ssl,
        sslNoVerify,
        only,
        help,
    };
}

function validateOnlyTables(only?: BridgeTable[]) {
    if (!only) return;
    const invalid = only.filter(t => !ALL_TABLES.includes(t));
    if (invalid.length) {
        throw new Error(
            `Unknown --only table(s): ${invalid.join(", ")}. Valid: ${ALL_TABLES.join(", ")}`,
        );
    }
}

async function countInserted(runner: {query: (q: string) => Promise<unknown>}, insertSql: string) {
    const sql = `
WITH inserted AS (
  ${insertSql}
  RETURNING 1
)
SELECT COUNT(*)::int AS inserted
FROM inserted
`;
    const rows = (await runner.query(sql)) as Array<{inserted: number;}>;
    return rows?.[0]?.inserted ?? 0;
}

function logUsage() {
    // Keep this concise; this is a runnable ops script.
    // eslint-disable-next-line no-console
    console.log(`
Backfill mledb_bridge tables.

Connection:
  Provide either DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.
  If none are provided, it falls back to the app config/secrets.

Usage:
  npm run backfill:mledb-bridge -- --dry-run
  npm run backfill:mledb-bridge -- --only player_to_user,player_to_player
  npm run backfill:mledb-bridge -- --ssl-no-verify

Flags:
  --dry-run, -n   Run in a transaction and roll back
  --ssl           Force SSL
  --ssl-no-verify Use SSL and accept self-signed cert chains (rejectUnauthorized=false)
  --only <csv>    Only backfill specific bridge tables
`);
}

async function main() {
    const {
        dryRun, ssl, sslNoVerify, only, help,
    } = parseArgs(process.argv);
    if (help) {
        logUsage();
        process.exit(0);
    }
    validateOnlyTables(only);

    const sanitizeDatabaseUrl = (raw: string, removeSslParams: boolean): string => {
        if (!removeSslParams) return raw;
        try {
            const u = new URL(raw);
            u.searchParams.delete("ssl");
            u.searchParams.delete("sslmode");
            u.searchParams.delete("sslcert");
            u.searchParams.delete("sslkey");
            u.searchParams.delete("sslrootcert");
            return u.toString();
        } catch {
            // If it's not a WHATWG URL for some reason, fall back untouched.
            return raw;
        }
    };

    const resolveDbOptions = (): ConstructorParameters<typeof DataSource>[0] => {
        // Prefer explicit connection envs so this script can run outside the full app secret setup.
        // Supports either DATABASE_URL or the standard PG* env vars.
        const databaseUrl = process.env.DATABASE_URL;
        const pghost = process.env.PGHOST;
        const pgport = process.env.PGPORT;
        const pguser = process.env.PGUSER;
        const pgpassword = process.env.PGPASSWORD;
        const pgdatabase = process.env.PGDATABASE;
        const pgsslmode = process.env.PGSSLMODE;

        const wantsSsl = sslNoVerify || ssl || pgsslmode === "require" || pgsslmode === "verify-ca" || pgsslmode === "verify-full";
        const sslOption = sslNoVerify
            ? {rejectUnauthorized: false}
            : wantsSsl
                ? true
                : undefined;

        if (databaseUrl) {
            const sanitizedUrl = sanitizeDatabaseUrl(databaseUrl, Boolean(sslOption));
            return {
                type: "postgres",
                url: sanitizedUrl,
                synchronize: false,
                logging: false,
                // TypeORM forwards `ssl` to the pg driver, but some setups behave more reliably
                // when also passing it through `extra.ssl`.
                ...(sslOption ? {ssl: sslOption, extra: {ssl: sslOption}} : {}),
            };
        }

        if (pghost || pguser || pgdatabase) {
            const host = pghost ?? "localhost";
            return {
                type: "postgres",
                host,
                port: pgport ? Number(pgport) : 5432,
                username: pguser ?? "postgres",
                password: pgpassword ?? "",
                database: pgdatabase ?? "postgres",
                synchronize: false,
                logging: false,
                ...(sslOption
                    ? {ssl: sslOption}
                    : {
                          ssl:
                host === "postgres" || host === "localhost"
                    ? false
                    : {rejectUnauthorized: false},
                      }),
            };
        }

        // Fallback to app config if env vars were not provided.
        // Import lazily to avoid requiring secrets when DATABASE_URL is set.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {config} = require("@sprocketbot/common") as typeof import("@sprocketbot/common");
        return {
            type: "postgres",
            host: config.db.host,
            port: config.db.port,
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            synchronize: false,
            logging: config.db.enable_logs,
            ...(sslOption
                ? {ssl: sslOption}
                : {
                      ssl:
            config.db.host === "postgres" || config.db.host === "localhost"
                ? false
                : {
                        rejectUnauthorized: false,
                    },
                  }),
        };
    };

    const dataSource = new DataSource(resolveDbOptions());

    await dataSource.initialize();
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    const selected = only?.length ? only : ALL_TABLES;
    const insertedByTable: Partial<Record<BridgeTable, number>> = {};

    try {
        await runner.startTransaction();

        for (const table of selected) {
            // eslint-disable-next-line no-console
            console.log(`Backfilling mledb_bridge.${table}...`);

            switch (table) {
                case "league_to_skill_group": {
                    // Derive from sprocket skill group profile codes (PL/ML/CL/AL/FL).
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.league_to_skill_group ("league", "skillGroupId")
SELECT src.league, src."skillGroupId"
FROM (
  SELECT
    CASE gsgp.code
      WHEN 'PL' THEN 'PREMIER'
      WHEN 'ML' THEN 'MASTER'
      WHEN 'CL' THEN 'CHAMPION'
      WHEN 'AL' THEN 'ACADEMY'
      WHEN 'FL' THEN 'FOUNDATION'
      ELSE NULL
    END AS league,
    gsgp."skillGroupId" AS "skillGroupId"
  FROM sprocket.game_skill_group_profile gsgp
) src
WHERE src.league IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.league_to_skill_group l2sg
    WHERE l2sg.league = src.league
      AND l2sg."skillGroupId" = src."skillGroupId"
  )
                        `.trim(),
                    );
                    break;
                }

                case "division_to_franchise_group": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.division_to_franchise_group ("divison", "franchiseGroupId")
SELECT d.name AS "divison", fg.id AS "franchiseGroupId"
FROM mledb.division d
JOIN sprocket.franchise_group_profile fgp ON fgp.name = d.name
JOIN sprocket.franchise_group fg ON fg.id = fgp."groupId"
WHERE d.conference != 'META'
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.division_to_franchise_group b
    WHERE b."divison" = d.name
      AND b."franchiseGroupId" = fg.id
  )
                        `.trim(),
                    );
                    break;
                }

                case "team_to_franchise": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.team_to_franchise ("team", "franchiseId")
SELECT t.name AS team, fp."franchiseId" AS "franchiseId"
FROM mledb.team t
JOIN sprocket.franchise_profile fp ON fp.title = t.name
WHERE t.division_name != 'Meta'
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.team_to_franchise b
    WHERE b.team = t.name
      AND b."franchiseId" = fp."franchiseId"
  )
                        `.trim(),
                    );
                    break;
                }

                case "season_to_schedule_group": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.season_to_schedule_group ("seasonNumber", "scheduleGroupId")
SELECT s.season_number AS "seasonNumber", sg.id AS "scheduleGroupId"
FROM mledb.season s
JOIN sprocket.schedule_group sg ON sg.description = CONCAT('Season ', s.season_number)
WHERE NOT EXISTS (
  SELECT 1
  FROM mledb_bridge.season_to_schedule_group b
  WHERE b."seasonNumber" = s.season_number
    AND b."scheduleGroupId" = sg.id
)
                        `.trim(),
                    );
                    break;
                }

                case "match_to_schedule_group": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.match_to_schedule_group ("matchId", "weekScheduleGroupId")
SELECT m.id AS "matchId", sg.id AS "weekScheduleGroupId"
FROM mledb.match m
JOIN mledb_bridge.season_to_schedule_group s2sg ON s2sg."seasonNumber" = m.season
JOIN sprocket.schedule_group sg
  ON sg.description = CONCAT('Week ', m.match_number)
 AND sg."parentGroupId" = s2sg."scheduleGroupId"
WHERE NOT EXISTS (
  SELECT 1
  FROM mledb_bridge.match_to_schedule_group b
  WHERE b."matchId" = m.id
    AND b."weekScheduleGroupId" = sg.id
)
                        `.trim(),
                    );
                    break;
                }

                case "fixture_to_fixture": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.fixture_to_fixture ("mleFixtureId", "sprocketFixtureId")
SELECT f.id AS "mleFixtureId", sf.id AS "sprocketFixtureId"
FROM mledb.fixture f
JOIN mledb.match m ON m.id = f.match_id
JOIN mledb_bridge.match_to_schedule_group m2sg ON m2sg."matchId" = m.id
JOIN mledb_bridge.team_to_franchise home_b ON home_b.team = f.home_name
JOIN mledb_bridge.team_to_franchise away_b ON away_b.team = f.away_name
JOIN sprocket.schedule_fixture sf
  ON sf."scheduleGroupId" = m2sg."weekScheduleGroupId"
 AND sf."homeFranchiseId" = home_b."franchiseId"
 AND sf."awayFranchiseId" = away_b."franchiseId"
WHERE NOT EXISTS (
  SELECT 1
  FROM mledb_bridge.fixture_to_fixture b
  WHERE b."mleFixtureId" = f.id
    AND b."sprocketFixtureId" = sf.id
)
                        `.trim(),
                    );
                    break;
                }

                case "series_to_match_parent": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.series_to_match_parent ("seriesId", "matchParentId")
SELECT s.id AS "seriesId", mp.id AS "matchParentId"
FROM mledb.series s
JOIN mledb_bridge.fixture_to_fixture f2f ON f2f."mleFixtureId" = s.fixture_id
JOIN sprocket.match_parent mp ON mp."fixtureId" = f2f."sprocketFixtureId"
JOIN sprocket."match" m ON m."matchParentId" = mp.id
JOIN mledb_bridge.league_to_skill_group l2sg ON l2sg.league = s.league
JOIN sprocket.game_mode gm ON gm.code = CONCAT('RL_', s.mode)
WHERE s.fixture_id IS NOT NULL
  AND s.league IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER')
  AND m."skillGroupId" = l2sg."skillGroupId"
  AND m."gameModeId" = gm.id
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.series_to_match_parent b
    WHERE b."seriesId" = s.id
      AND b."matchParentId" = mp.id
  )
                        `.trim(),
                    );
                    break;
                }

                case "player_to_user": {
                    // Prefer matching on discord id since this is the stable cross-system key.
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.player_to_user ("playerId", "userId")
SELECT mp.id AS "playerId", uaa."userId" AS "userId"
FROM mledb.player mp
JOIN sprocket.user_authentication_account uaa
  ON uaa."accountType" = 'DISCORD'
 AND uaa."accountId" = mp.discord_id
WHERE mp.discord_id IS NOT NULL
  AND mp.discord_id != ''
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.player_to_user b
    WHERE b."playerId" = mp.id
      AND b."userId" = uaa."userId"
  )
                        `.trim(),
                    );
                    break;
                }

                case "player_to_player": {
                    insertedByTable[table] = await countInserted(
                        runner,
                        `
INSERT INTO mledb_bridge.player_to_player ("mledPlayerId", "sprocketPlayerId")
SELECT mp.id AS "mledPlayerId", sp.id AS "sprocketPlayerId"
FROM mledb.player mp
JOIN mledb_bridge.player_to_user p2u ON p2u."playerId" = mp.id
JOIN sprocket.member mem ON mem."userId" = p2u."userId"
JOIN mledb_bridge.league_to_skill_group l2sg ON l2sg.league = mp.league
JOIN sprocket.player sp
  ON sp."memberId" = mem.id
 AND sp."skillGroupId" = l2sg."skillGroupId"
WHERE mp.league IN ('FOUNDATION', 'ACADEMY', 'CHAMPION', 'MASTER', 'PREMIER')
  AND NOT EXISTS (
    SELECT 1
    FROM mledb_bridge.player_to_player b
    WHERE b."mledPlayerId" = mp.id
      AND b."sprocketPlayerId" = sp.id
  )
                        `.trim(),
                    );
                    break;
                }

                default: {
                    // Exhaustiveness
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw new Error(`Unhandled table: ${table}`);
                }
            }

            // eslint-disable-next-line no-console
            console.log(
                `  inserted: ${insertedByTable[table] ?? 0}`,
            );
        }

        if (dryRun) {
            // eslint-disable-next-line no-console
            console.log("Dry-run enabled; rolling back.");
            await runner.rollbackTransaction();
        } else {
            await runner.commitTransaction();
        }
    } catch (err) {
        await runner.rollbackTransaction();
        throw err;
    } finally {
        await runner.release();
        await dataSource.destroy();
    }

    // eslint-disable-next-line no-console
    console.log("\nDone.\nSummary:");
    for (const t of selected) {
        // eslint-disable-next-line no-console
        console.log(`  ${t}: ${insertedByTable[t] ?? 0} inserted`);
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});

