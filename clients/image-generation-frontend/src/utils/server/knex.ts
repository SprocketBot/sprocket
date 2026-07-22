import KnexClient from 'knex';
import config from '$src/config';

const postgresPoolSize = Number(process.env.POSTGRES_POOL_SIZE ?? config.knex.pool_size ?? 1);
const applicationName = String(
  process.env.POSTGRES_APPLICATION_NAME
    ?? process.env.SPROCKET_SERVICE_NAME
    ?? 'image-generation-frontend',
).replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 63);

export const knexClient = KnexClient({
  client: 'pg',
  connection: {
    ...config.knex,
    ssl: false,
    idle_in_transaction_session_timeout: Number(
      process.env.POSTGRES_IDLE_IN_TRANSACTION_TIMEOUT_MS ?? 60000,
    ),
    application_name: `${applicationName}.knex`.slice(0, 63),
  },
  asyncStackTraces: true,
  debug: false,
  pool: {
    min: 0,
    max: postgresPoolSize,
    idleTimeoutMillis: Number(process.env.POSTGRES_POOL_IDLE_TIMEOUT_MS ?? 10000),
  },
});
