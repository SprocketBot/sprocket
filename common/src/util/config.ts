import { ConfigResolver } from "./config-resolver";

export const config = {
  auth: {
    google: {
      get clientId(): string {
        return ConfigResolver.getSecret("GOOGLE_CLIENT_ID", "./secret/googleClientId.txt");
      },
      get secret(): string {
        return ConfigResolver.getSecret("GOOGLE_SECRET", "./secret/googleSecret.txt");
      },
      get callbackUrl(): string {
        return ConfigResolver.getConfig("GOOGLE_CALLBACK_URL", "auth.google.callbackUrl");
      },
    },
    discord: {
      get clientId(): string {
        return ConfigResolver.getSecret("DISCORD_CLIENT_ID", "./secret/discord-client.txt");
      },
      get secret(): string {
        return ConfigResolver.getSecret("DISCORD_SECRET", "./secret/discord-secret.txt");
      },
      get callbackURL(): string {
        return ConfigResolver.getConfig("DISCORD_CALLBACK_URL", "auth.discord.callbackUrl");
      },
    },
    get jwt_expiry(): string {
      return ConfigResolver.getConfig("JWT_EXPIRY", "auth.jwt_expiry");
    },
    get access_expiry(): string {
      return ConfigResolver.getConfig("ACCESS_EXPIRY", "auth.access_expiry");
    },
    get refresh_expiry(): string {
      return ConfigResolver.getConfig("REFRESH_EXPIRY", "auth.refresh_expiry");
    },
    get frontend_callback(): string {
      return ConfigResolver.getConfig("FRONTEND_CALLBACK", "auth.frontend_callback");
    },
    get jwt_secret(): string {
      return ConfigResolver.getSecret("JWT_SECRET", "./secret/jwtSecret.txt");
    },
  },
  bot: {
    get prefix(): string {
      return ConfigResolver.getConfig("BOT_PREFIX", "bot.prefix");
    },
  },
  cache: {
    get port(): number {
      return ConfigResolver.getNumberConfig("CACHE_PORT", "cache.port") ||
        ConfigResolver.getNumberConfig("REDIS_PORT", "redis.port");
    },
    get host(): string {
      return ConfigResolver.getConfig("CACHE_HOST", "cache.host") ||
        ConfigResolver.getConfig("REDIS_HOST", "redis.host");
    },
    get password(): string {
      // Try cache password first, then redis password
      try {
        return ConfigResolver.getSecret("CACHE_PASSWORD", "./secret/cache-password.txt");
      } catch {
        return ConfigResolver.getSecret("REDIS_PASSWORD", "./secret/redis-password.txt");
      }
    },
    get secure(): boolean {
      return ConfigResolver.getBooleanConfig("CACHE_SECURE", "cache.secure") ||
        ConfigResolver.getBooleanConfig("REDIS_SECURE", "redis.secure");
    },
  },
  celery: {
    get broker(): string {
      return ConfigResolver.getConfig("CELERY_BROKER", "transport.url");
    },
    get backend(): string {
      const host = config.redis.host;
      const port = config.redis.port;
      const pass = config.redis.password;
      return `redis${config.redis.secure ? "s" : ""}://:${pass}@${host}:${port}`;
    },
    get queue(): string {
      return ConfigResolver.getConfig("CELERY_QUEUE", "transport.celery-queue");
    },
  },
  db: {
    get host(): string {
      return ConfigResolver.getConfig("POSTGRES_HOST", "db.host");
    },
    get port(): number {
      return ConfigResolver.getNumberConfig("POSTGRES_PORT", "db.port");
    },
    get username(): string {
      return ConfigResolver.getConfig("POSTGRES_USERNAME", "db.username");
    },
    get password(): string {
      return ConfigResolver.getSecret("POSTGRES_PASSWORD", "./secret/db-password.txt");
    },
    get database(): string {
      return ConfigResolver.getConfig("POSTGRES_DATABASE", "db.database");
    },
    get enable_logs(): boolean {
      return ConfigResolver.getBooleanConfig("POSTGRES_ENABLE_LOGS", "db.enable_logs");
    },
  },
  gql: {
    get url(): string { return ConfigResolver.getConfig("GQL_URL", "gql.url") },
    get playground(): boolean { return ConfigResolver.getBooleanConfig("GQL_PLAYGROUND", "gql.playground") },
  },
  logger: {
    get levels(): any {
      const level = ConfigResolver.getConfig("LOGGER_LEVELS", "logger.levels");
      return level === "debug"
        ? JSON.stringify(["error", "warn", "log"])
        : JSON.stringify(["error", "warn", "log", "debug"]);
    },
  },
  minio: {
    get endPoint(): string {
      return ConfigResolver.getConfig("MINIO_ENDPOINT", "minio.endPoint");
    },
    get accessKey(): string {
      return ConfigResolver.getSecret("MINIO_ACCESS_KEY", "./secret/minio-access.txt");
    },
    get secretKey(): string {
      return ConfigResolver.getSecret("MINIO_SECRET_KEY", "./secret/minio-secret.txt");
    },
    bucketNames: {
      get replays(): string {
        return ConfigResolver.getConfig("MINIO_REPLAYS_BUCKET", "minio.bucketNames.replays");
      },
      get image_generation(): string {
        return ConfigResolver.getConfig("MINIO_IMAGE_GENERATION_BUCKET", "minio.bucketNames.image_generation");
      },
    },
    get useSSL(): boolean {
      return ConfigResolver.getBooleanConfig("MINIO_USE_SSL", "minio.useSSL", false);
    },
    get port(): number {
      return ConfigResolver.getNumberConfig("MINIO_PORT", "minio.port", 9000);
    },
  },
  redis: {
    get port(): number {
      return ConfigResolver.getNumberConfig("REDIS_PORT", "redis.port");
    },
    get host(): string {
      return ConfigResolver.getConfig("REDIS_HOST", "redis.host");
    },
    get password(): string {
      return ConfigResolver.getSecret("REDIS_PASSWORD", "./secret/redis-password.txt");
    },
    get prefix(): string {
      return ConfigResolver.getConfig("REDIS_PREFIX", "redis.prefix");
    },
    get secure(): boolean {
      return ConfigResolver.getBooleanConfig("REDIS_SECURE", "redis.secure", false);
    },
  },
  transport: {
    get url(): string {
      return ConfigResolver.getConfig("TRANSPORT_URL", "transport.url");
    },
    get core_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_CORE_QUEUE", "transport.core_queue", "core");
    },
    get bot_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_BOT_QUEUE", "transport.bot_queue", "bot");
    },
    get analytics_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_ANALYTICS_QUEUE", "transport.analytics_queue", "analytics");
    },
    get matchmaking_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_MATCHMAKING_QUEUE", "transport.matchmaking_queue", "matchmaking");
    },
    get notification_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_NOTIFICATION_QUEUE", "transport.notification_queue", "notifications");
    },
    get events_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_EVENTS_QUEUE", "transport.events_queue", "events");
    },
    get events_application_key(): string {
      return ConfigResolver.getConfig("TRANSPORT_EVENTS_APPLICATION_KEY", "transport.events_application_key");
    },
    get image_generation_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_IMAGE_GENERATION_QUEUE", "transport.image_generation_queue");
    },
    get submission_queue(): string {
      return ConfigResolver.getConfig("TRANSPORT_SUBMISSION_QUEUE", "transport.submission_queue");
    },
  },
  web: {
    get url(): string {
      return ConfigResolver.getConfig("WEB_URL", "web.url");
    },
    get api_root(): string {
      return ConfigResolver.getConfig("WEB_API_ROOT", "web.api_root");
    },
  },
  get defaultOrganizationId(): number {
    return ConfigResolver.getNumberConfig("DEFAULT_ORGANIZATION_ID", "defaultOrganizationId");
  },
};
