if (!process.env.SPR_PREFIX) {
  // "Unique ID"
  process.env.SPR_PREFIX = Math.random().toString().split(".")[1]
}

export default {
  "auth": {
    "access_expiry": "6h",
    "discord": { "callbackUrl": "http://localhost:3001/login" },
    "frontend_callback": "localhost:3000/auth/callback",
    "google": { "callbackUrl": "" },
    "jwt_expiry": 600,
    "refresh_expiry": "7d"
  },
  "bot": { "prefix": "." },
  "db": {
    "database": "postgres",
    "enable_logs": false,
    "host": "localhost",
    "port": 5432
  },
  "defaultOrganizationId": 2,
  "gql": { "playground": false, "url": "http://localhost:3001" },
  "influx": {
    "address": "http://localhost",
  },
  "logger": {
    "levels": ["log", "error", "warn", "debug", "verbose"],
  },
  "minio": {
    "bucketNames": { "image_generation": "image_generation", "replays": "replays" },
    "endPoint": "localhost",
    "port": 9000,
    "useSSL": false
  },
  "redis": { "host": "localhost", "port": 6379, "prefix": process.env.SPR_PREFIX, "secure": false },
  "transport": {
    "analytics_queue": `${process.env.SPR_PREFIX}-analytics`,
    "bot_queue": `${process.env.SPR_PREFIX}-bot`,
    "celery-queue": `${process.env.SPR_PREFIX}-celery`,
    "core_queue": `${process.env.SPR_PREFIX}-core`,
    "events_queue": `${process.env.SPR_PREFIX}-events`,
    "events_prefix": process.env.SPR_PREFIX,
    "image_generation_queue": `${process.env.SPR_PREFIX}-image-gen`,
    "matchmaking_queue": `${process.env.SPR_PREFIX}-matchmaking`,
    "notification_queue": `${process.env.SPR_PREFIX}-notification`,
    "submission_queue": `${process.env.SPR_PREFIX}-submissions`,
    "url": "amqp://localhost:5672"
  },
  "web": { "api_root": "localhost:3001", "url": "localhost:3000" }
}
