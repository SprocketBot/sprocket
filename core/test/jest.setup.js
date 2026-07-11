const buffer = require('buffer');

if (typeof buffer.SlowBuffer === 'undefined') {
  buffer.SlowBuffer = buffer.Buffer;
}

const testSecrets = {
  CACHE_PASSWORD: 'test-cache-password',
  DISCORD_CLIENT_ID: 'test-discord-client-id',
  DISCORD_SECRET: 'test-discord-secret',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_SECRET: 'test-google-secret',
  JWT_SECRET: 'test-jwt-secret',
  MINIO_ACCESS_KEY: 'test-minio-access-key',
  MINIO_SECRET_KEY: 'test-minio-secret-key',
  POSTGRES_PASSWORD: 'test-postgres-password',
  REDIS_PASSWORD: 'test-redis-password',
};

for (const [key, value] of Object.entries(testSecrets)) {
  process.env[key] = process.env[key] || value;
}
