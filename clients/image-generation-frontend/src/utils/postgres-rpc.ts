import pg from 'pg';
import { v4 } from 'uuid';
import config from '../config';

const { Pool } = pg;

const postgresPoolSize = Number(process.env.POSTGRES_POOL_SIZE ?? config.knex.pool_size ?? 1);
const applicationName = String(
  process.env.POSTGRES_APPLICATION_NAME
    ?? process.env.SPROCKET_SERVICE_NAME
    ?? 'image-generation-frontend',
).replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 63);

const pool = new Pool({
  ...config.knex,
  ssl: false,
  max: postgresPoolSize,
  idleTimeoutMillis: Number(process.env.POSTGRES_POOL_IDLE_TIMEOUT_MS ?? 10000),
  connectionTimeoutMillis: Number(process.env.POSTGRES_POOL_CONNECTION_TIMEOUT_MS ?? 5000),
  maxLifetimeSeconds: Number(process.env.POSTGRES_POOL_MAX_LIFETIME_SECONDS ?? 300),
  idle_in_transaction_session_timeout: Number(
    process.env.POSTGRES_IDLE_IN_TRANSACTION_TIMEOUT_MS ?? 60000,
  ),
  application_name: `${applicationName}.rpc`.slice(0, 63),
});

export async function postgresRpcRequest(
  pattern: string,
  data: Record<string, unknown> = {},
): Promise<unknown> {
  const id = v4();
  await pool.query('CREATE SCHEMA IF NOT EXISTS sprocket');
  await pool.query(
    `
      INSERT INTO sprocket.platform_rpc_queue (id, queue, pattern, payload)
      VALUES ($1, $2, $3, $4)
    `,
    [id, config.transport.queue, pattern, data],
  );

  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const result = await pool.query(
      'SELECT status, response, error FROM sprocket.platform_rpc_queue WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    if (row?.status === 'completed') {
      await pool.query('DELETE FROM sprocket.platform_rpc_queue WHERE id = $1', [id]);
      return row.response;
    }
    if (row?.status === 'failed') {
      throw new Error(row.error?.message ?? 'Request failed');
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  throw new Error('Request timed out.');
}
