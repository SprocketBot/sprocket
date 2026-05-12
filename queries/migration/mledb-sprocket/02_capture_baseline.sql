\set ON_ERROR_STOP on

\if :{?migration_run_id}
\else
    \echo 'missing required psql variable: migration_run_id'
    \quit 2
\endif

\if :{?migration_description}
\else
    \set migration_description 'mledb to sprocket migration baseline'
\endif

\if :{?migration_git_sha}
\else
    \set migration_git_sha ''
\endif

\ir 00_guard_schema.sql

SELECT migration_guard.capture_sprocket_baseline(
    :'migration_run_id'::uuid,
    :'migration_description',
    nullif(:'migration_git_sha', '')
);

SELECT run_id, description, git_sha, started_at, status
FROM migration_guard.runs
WHERE run_id = :'migration_run_id'::uuid;

SELECT schema_name, table_name, row_count, has_primary_key
FROM migration_guard.sprocket_table_snapshots
WHERE run_id = :'migration_run_id'::uuid
ORDER BY schema_name, table_name;
