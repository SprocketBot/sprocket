import KnexClient from 'knex';
import config from '$src/config';

export const knexClient = KnexClient({
  client: 'pg',
  connection: {
    ...config.knex,
    ssl: false,
  },
  asyncStackTraces: true,
  debug: false,
  pool: {
    min: 2,
    max: 2,
  },
});
