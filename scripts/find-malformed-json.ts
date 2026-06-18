/**
 * Utility to find and report malformed JSON in the platform tables.
 * 
 * Run with: npx ts-node scripts/find-malformed-json.ts
 * 
 * This script queries each jsonb column and identifies rows where the JSON
 * is invalid (which would cause "invalid input syntax for type json" errors on read).
 */

import { createTransportPool } from '../common/src/postgres-transport/postgres-transport';

interface MalformedJsonRow {
  table: string;
  column: string;
  id: string;
  preview: string;
}

async function findMalformedJson() {
  const pool = createTransportPool();
  const issues: MalformedJsonRow[] = [];

  // Tables and their jsonb columns to check
  const tables = [
    { table: 'sprocket.platform_rpc_queue', columns: ['payload', 'response', 'error'] },
    { table: 'sprocket.platform_event', columns: ['payload'] },
    { table: 'sprocket.platform_task_queue', columns: ['args', 'result', 'error'] },
    { table: 'sprocket.platform_task_progress', columns: ['message'] },
    { table: 'sprocket.elo_job_queue', columns: ['payload', 'result', 'error'] },
  ];

  for (const { table, columns } of tables) {
    for (const column of columns) {
      // Find rows where jsonb_typeof returns NULL (invalid JSON)
      // This catches text that was accidentally inserted as "valid" jsonb
      const query = `
        SELECT * FROM (
          SELECT 
            '${table}' as table_name,
            '${column}' as column_name,
            id,
            ${column} as data
          FROM ${table}
          WHERE ${column} IS NOT NULL
            AND jsonb_typeof(${column}) IS NULL
        ) sub
        LIMIT 100
      `;

      try {
        const result = await pool.query(query);
        for (const row of result.rows) {
          issues.push({
            table: row.table_name,
            column: row.column_name,
            id: row.id,
            preview: JSON.stringify(row.data).substring(0, 200),
          });
        }
      } catch (error) {
        // Table might not exist or have the column
        console.warn(`Skipping ${table}.${column}: ${error}`);
      }
    }
  }

  // Also check for rows with unexpected text values in jsonb columns
  // These are values that were inserted as strings but are now causing issues
  const textCheckQuery = `
    SELECT 
      'sprocket.platform_rpc_queue' as table_name,
      'payload' as column_name,
      id,
      payload as data
    FROM sprocket.platform_rpc_queue
    WHERE payload IS NOT NULL 
      AND jsonb_typeof(payload) IS NULL
    LIMIT 100
  `;

  try {
    const result = await pool.query(textCheckQuery);
    for (const row of result.rows) {
      const existing = issues.find(
        i => i.table === row.table_name && i.column === row.column_name && i.id === row.id
      );
      if (!existing) {
        issues.push({
          table: row.table_name,
          column: row.column_name,
          id: row.id,
          preview: String(row.data).substring(0, 200),
        });
      }
    }
  } catch (error) {
    console.warn(`Text check failed: ${error}`);
  }

  await pool.end();

  if (issues.length === 0) {
    console.log('✅ No malformed JSON found in platform tables');
    return;
  }

  console.log(`❌ Found ${issues.length} rows with malformed JSON:\n`);
  for (const issue of issues) {
    console.log(`Table: ${issue.table}`);
    console.log(`Column: ${issue.column}`);
    console.log(`ID: ${issue.id}`);
    console.log(`Preview: ${issue.preview}`);
    console.log('---');
  }

  // Generate cleanup SQL
  console.log('\n📝 Suggested cleanup SQL:');
  for (const issue of issues) {
    console.log(`DELETE FROM ${issue.table} WHERE id = '${issue.id}'; -- ${issue.column}`);
  }
}

findMalformedJson().catch(console.error);