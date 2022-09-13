CREATE OR REPLACE FUNCTION get_next_id(tablename TEXT)
    RETURNS NUMERIC
    LANGUAGE plpgsql
AS
$$
DECLARE
    maxid NUMERIC;
BEGIN

    EXECUTE FORMAT('CREATE TEMP TABLE IF NOT EXISTS temp_%s_ids (c numeric) ON COMMIT DROP;', tablename);
    EXECUTE FORMAT('SELECT 1 + max(ID) + (SELECT COUNT(*) FROM temp_%s_ids) FROM mledb.%I', tablename,
                   tablename) INTO maxid;
    EXECUTE FORMAT('INSERT INTO temp_%s_ids (c) VALUES (0)', tablename);
    RETURN maxid;
END;
$$;

ALTER FOREIGN TABLE mledb.match
    ALTER COLUMN id SET DEFAULT get_next_id('match'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
          ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN is_double_header SET DEFAULT FALSE,
        ALTER COLUMN map SET DEFAULT 'unknown'
;

ALTER FOREIGN TABLE mledb.fixture
    ALTER COLUMN id SET DEFAULT get_next_id('fixture'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
;

ALTER FOREIGN TABLE mledb.series
    ALTER COLUMN id SET DEFAULT get_next_id('series'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
          ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN league SET DEFAULT 'UNKNOWN',
        ALTER COLUMN full_ncp SET DEFAULT FALSE
;

ALTER FOREIGN TABLE mledb.series_replay
    ALTER COLUMN id SET DEFAULT get_next_id('series_replay'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
          ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN ncp SET DEFAULT FALSE,
          ALTER COLUMN is_dummy SET DEFAULT FALSE,
        ALTER COLUMN overtime_seconds SET DEFAULT 0
;

ALTER FOREIGN TABLE mledb.player_stats_core
    ALTER COLUMN id SET DEFAULT get_next_id('player_stats_core'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
;

ALTER FOREIGN TABLE mledb.player_stats
    ALTER COLUMN id SET DEFAULT get_next_id('player_stats'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
;

ALTER FOREIGN TABLE mledb.team_core_stats
    ALTER COLUMN id SET DEFAULT get_next_id('team_core_stats'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
;

ALTER FOREIGN TABLE mledb.team_role_usage
    ALTER COLUMN id SET DEFAULT get_next_id('team_role_usage'),
          ALTER COLUMN created_by SET DEFAULT 'sprocket',
          ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN updated_by SET DEFAULT 'sprocket',
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
;
