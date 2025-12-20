-- SQL Script to Remove Auditing Functions and Triggers
-- This script reverses the changes made by migrations:
-- - 1658698707748-AuditingFunctions.ts
-- - 1658698711311-AddAuditTriggers.ts

-- Set search path to ensure we can find the tables and functions
SET search_path TO sprocket, public, history;

-- ============================================
-- Step 1: Drop triggers from original tables
-- ============================================

-- Drop triggers from all tables that had audit triggers added
DROP TRIGGER IF EXISTS player_history_trigger ON player;
DROP TRIGGER IF EXISTS user_history_trigger ON "user";
DROP TRIGGER IF EXISTS user_profile_history_trigger ON user_profile;
DROP TRIGGER IF EXISTS member_history_trigger ON member;
DROP TRIGGER IF EXISTS member_profile_history_trigger ON member_profile;
DROP TRIGGER IF EXISTS franchise_history_trigger ON franchise;
DROP TRIGGER IF EXISTS franchise_profile_history_trigger ON franchise_profile;
DROP TRIGGER IF EXISTS team_history_trigger ON team;
DROP TRIGGER IF EXISTS roster_slot_history_trigger ON roster_slot;
DROP TRIGGER IF EXISTS roster_role_history_trigger ON roster_role;

-- ============================================
-- Step 2: Drop history tables
-- ============================================

-- Drop all history tables in the history schema
DROP TABLE IF EXISTS history.player_history CASCADE;
DROP TABLE IF EXISTS history.user_history CASCADE;
DROP TABLE IF EXISTS history.user_profile_history CASCADE;
DROP TABLE IF EXISTS history.member_history CASCADE;
DROP TABLE IF EXISTS history.member_profile_history CASCADE;
DROP TABLE IF EXISTS history.franchise_history CASCADE;
DROP TABLE IF EXISTS history.franchise_profile_history CASCADE;
DROP TABLE IF EXISTS history.team_history CASCADE;
DROP TABLE IF EXISTS history.roster_slot_history CASCADE;
DROP TABLE IF EXISTS history.roster_role_history CASCADE;

-- ============================================
-- Step 3: Drop audit functions
-- ============================================

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_history_table() CASCADE;

-- Drop the helper functions
DROP FUNCTION IF EXISTS create_history_table(text, boolean) CASCADE;
DROP FUNCTION IF EXISTS remove_history_table(text) CASCADE;

-- ============================================
-- Step 4: Clean up schema (optional)
-- ============================================

-- Drop the history schema if it's empty
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'history'
    ) THEN
        DROP SCHEMA IF EXISTS history;
        RAISE NOTICE 'Dropped history schema as it is now empty';
    ELSE
        RAISE NOTICE 'History schema not dropped as it still contains tables';
    END IF;
END $$;

-- Note: We do NOT drop the uuid-ossp extension as it might be used elsewhere
-- If you are certain it's not used elsewhere, you can uncomment the line below:
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ============================================
-- Verification
-- ============================================

-- Verify that all audit functions have been removed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname IN ('update_history_table', 'create_history_table', 'remove_history_table')
    ) THEN
        RAISE WARNING 'Some audit functions may still exist';
    ELSE
        RAISE NOTICE 'All audit functions successfully removed';
    END IF;
END $$;

-- Verify that all history tables have been removed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'history'
    ) THEN
        RAISE WARNING 'Some history tables may still exist';
    ELSE
        RAISE NOTICE 'All history tables successfully removed';
    END IF;
END $$;
