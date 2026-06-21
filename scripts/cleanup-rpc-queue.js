#!/usr/bin/env node
/**
 * DB Cleanup Script: Purge malformed RPC queue entries
 * 
 * This script identifies and removes improperly formed RPC queue entries
 * that could cause "invalid input syntax for type json" errors.
 * 
 * Usage:
 *   node scripts/cleanup-rpc-queue.js --host <host> --port <port> --user <user> --database <db> [--password <pass>] [--dry-run]
 * 
 * Environment variables can also be used:
 *   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 * 
 * The script will:
 * 1. Find entries with malformed JSON in response/error columns
 * 2. Either delete them (production) or list them (dry-run)
 * 3. Report statistics on what was found/removed
 */

const {Client} = require('pg');

const args = process.argv.slice(2);
const options = {
    host: null,
    port: null,
    user: null,
    password: null,
    database: null,
    dryRun: false,
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && i + 1 < args.length) options.host = args[++i];
    else if (args[i] === '--port' && i + 1 < args.length) options.port = parseInt(args[++i], 10);
    else if (args[i] === '--user' && i + 1 < args.length) options.user = args[++i];
    else if (args[i] === '--password' && i + 1 < args.length) options.password = args[++i];
    else if (args[i] === '--database' && i + 1 < args.length) options.database = args[++i];
    else if (args[i] === '--dry-run') options.dryRun = true;
}

// Check env vars for missing options
options.host = options.host || process.env.PGHOST;
options.port = options.port || parseInt(process.env.PGPORT || '5432', 10);
options.user = options.user || process.env.PGUSER;
options.password = options.password || process.env.PGPASSWORD;
options.database = options.database || process.env.PGDATABASE;

if (!options.host || !options.user || !options.database) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node cleanup-rpc-queue.js --host <host> --port <port> --user <user> --database <db> [--password <pass>] [--dry-run]');
    console.error('Or set environment variables: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE');
    process.exit(1);
}

async function main() {
    const client = new Client({
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        database: options.database,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Check if the table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'sprocket' 
                AND table_name = 'platform_rpc_queue'
            )
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.error('Error: sprocket.platform_rpc_queue table does not exist');
            process.exit(1);
        }

        console.log('\n=== Finding malformed JSON in RPC queue ===\n');

        // Find entries with malformed JSON in response column
        console.log('1. Checking response column for malformed JSON...');
        const malformedResponse = await client.query(`
            SELECT id, queue, pattern, status, response, updated_at
            FROM sprocket.platform_rpc_queue
            WHERE status = 'completed'
            AND response IS NOT NULL
            AND jsonb_typeof(response::jsonb) IS NULL
        `);
        console.log(`   Found ${malformedResponse.rows.length} entries with malformed response JSON`);

        // Find entries with malformed JSON in error column
        console.log('\n2. Checking error column for malformed JSON...');
        const malformedError = await client.query(`
            SELECT id, queue, pattern, status, error, updated_at
            FROM sprocket.platform_rpc_queue
            WHERE status = 'failed'
            AND error IS NOT NULL
            AND jsonb_typeof(error::jsonb) IS NULL
        `);
        console.log(`   Found ${malformedError.rows.length} entries with malformed error JSON`);

        // Find entries with null response for completed status (incomplete writes)
        console.log('\n3. Checking for completed entries with null response...');
        const nullResponse = await client.query(`
            SELECT id, queue, pattern, status, updated_at
            FROM sprocket.platform_rpc_queue
            WHERE status = 'completed'
            AND response IS NULL
        `);
        console.log(`   Found ${nullResponse.rows.length} completed entries with null response`);

        // Find stale processing entries (stuck for > 5 minutes)
        console.log('\n4. Checking for stale processing entries...');
        const staleProcessing = await client.query(`
            SELECT id, queue, pattern, status, locked_at, updated_at
            FROM sprocket.platform_rpc_queue
            WHERE status = 'processing'
            AND locked_at < now() - interval '5 minutes'
        `);
        console.log(`   Found ${staleProcessing.rows.length} stale processing entries`);

        // Summary
        const totalIssues = malformedResponse.rows.length + malformedError.rows.length + 
                           nullResponse.rows.length + staleProcessing.rows.length;
        
        console.log(`\n=== Total issues found: ${totalIssues} ===\n`);

        if (totalIssues === 0) {
            console.log('No issues found. Database looks healthy!');
            return;
        }

        // Show details of what will be removed
        if (malformedResponse.rows.length > 0) {
            console.log('\nMalformed response entries (first 5):');
            malformedResponse.rows.slice(0, 5).forEach(row => {
                console.log(`  - ${row.id} (${row.pattern}) - status: ${row.status}`);
            });
        }

        if (staleProcessing.rows.length > 0) {
            console.log('\nStale processing entries (first 5):');
            staleProcessing.rows.slice(0, 5).forEach(row => {
                console.log(`  - ${row.id} (${row.pattern}) - locked: ${row.locked_at}`);
            });
        }

        // Execute cleanup
        if (options.dryRun) {
            console.log('\n=== DRY RUN - No changes made ===\n');
            console.log('To execute cleanup, run without --dry-run flag');
        } else {
            console.log('\n=== Executing cleanup ===\n');
            
            let deletedCount = 0;

            // Delete malformed response entries
            if (malformedResponse.rows.length > 0) {
                const ids = malformedResponse.rows.map(r => `'${r.id}'`).join(',');
                const result = await client.query(`
                    DELETE FROM sprocket.platform_rpc_queue
                    WHERE id IN (${ids})
                `);
                deletedCount += result.rowCount;
                console.log(`Deleted ${result.rowCount} entries with malformed response`);
            }

            // Delete malformed error entries
            if (malformedError.rows.length > 0) {
                const ids = malformedError.rows.map(r => `'${r.id}'`).join(',');
                const result = await client.query(`
                    DELETE FROM sprocket.platform_rpc_queue
                    WHERE id IN (${ids})
                `);
                deletedCount += result.rowCount;
                console.log(`Deleted ${result.rowCount} entries with malformed error`);
            }

            // Reset null response completed entries to failed
            if (nullResponse.rows.length > 0) {
                const ids = nullResponse.rows.map(r => `'${r.id}'`).join(',');
                const result = await client.query(`
                    UPDATE sprocket.platform_rpc_queue
                    SET status = 'failed', error = '{"message": "Null response during cleanup"}'::jsonb, updated_at = now()
                    WHERE id IN (${ids})
                `);
                console.log(`Reset ${result.rowCount} completed entries with null response to failed`);
            }

            // Reset stale processing entries to pending
            if (staleProcessing.rows.length > 0) {
                const ids = staleProcessing.rows.map(r => `'${r.id}'`).join(',');
                const result = await client.query(`
                    UPDATE sprocket.platform_rpc_queue
                    SET status = 'pending', locked_at = NULL, updated_at = now()
                    WHERE id IN (${ids})
                `);
                console.log(`Reset ${result.rowCount} stale processing entries to pending`);
            }

            console.log(`\n=== Cleanup complete. ${deletedCount} entries deleted/reset ===`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();