# Sprocket Monolith

The Sprocket monolith consolidates all 7 NestJS microservices into a single Node.js process, reducing memory overhead by 43-85% while maintaining all functionality.

## Services Consolidated

The monolith includes:
1. **Core** - GraphQL API + HTTP Server (port 3001)
2. **Discord Bot** - Discord.js integration
3. **Matchmaking Service** - Queue and matchmaking logic
4. **Notification Service** - Event notifications
5. **Submission Service** - Replay submission handling
6. **Image Generation Service** - Template-based image generation
7. **Server Analytics Service** - Analytics tracking

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start infrastructure + monolith
docker-compose -f docker-compose.monolith.yml up

# Or run in detached mode
docker-compose -f docker-compose.monolith.yml up -d

# View logs
docker-compose -f docker-compose.monolith.yml logs -f monolith

# Stop everything
docker-compose -f docker-compose.monolith.yml down
```

### Local Development (Without Docker)

1. **Start infrastructure services:**
```bash
docker-compose -f docker-compose.monolith.yml up rabbitmq redis postgres minio
```

2. **Run the monolith locally:**
```bash
npm run dev:monolith
```

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
# RabbitMQ
RABBITMQ_USER=sprocketbot
RABBITMQ_PASSWORD=localdevpassword

# Redis
REDIS_PASSWORD=localdevpassword

# PostgreSQL
POSTGRES_USERNAME=sprocketbot
POSTGRES_PASSWORD=localdevpassword
POSTGRES_DATABASE=sprocketbot

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=sprocketbot
MINIO_ROOT_PASSWORD=localdevpassword

# Discord (for bot functionality)
DISCORD_TOKEN=your_discord_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# Other service-specific variables
# Add as needed from your existing .env files
```

## Accessing Services

Once running, you can access:

- **GraphQL Playground**: http://localhost:3001/graphql
- **Health Check**: http://localhost:3001/health
- **RabbitMQ Management**: http://localhost:15672 (guest/guest or your configured credentials)
- **MinIO Console**: http://localhost:9001
- **Redis**: localhost:6379
- **PostgreSQL**: localhost:5434

## Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2026-02-02T21:30:00.000Z",
  "services": [
    "core",
    "discord-bot",
    "matchmaking",
    "notification",
    "submission",
    "image-generation",
    "server-analytics"
  ]
}
```

## RabbitMQ Queues

The monolith connects to all 7 microservice queues:
- `dev-core` - Core service messages
- `dev-bot` - Discord bot messages
- `dev-matchmaking` - Matchmaking messages
- `dev-notification` - Notification messages
- `dev-submissions` - Submission messages
- `dev-ig` - Image generation messages
- `dev-analytics` - Analytics messages

## Architecture

```
┌─────────────────────────────────────────┐
│         Monolith Process                │
│  ┌─────────────────────────────────┐   │
│  │  HTTP Server (Port 3001)        │   │
│  │  - GraphQL API                  │   │
│  │  - REST Endpoints               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  7 RabbitMQ Microservices       │   │
│  │  - Core                         │   │
│  │  - Discord Bot                  │   │
│  │  - Matchmaking                  │   │
│  │  - Notification                 │   │
│  │  - Submission                   │   │
│  │  - Image Generation             │   │
│  │  - Server Analytics             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
            │         │         │
            ▼         ▼         ▼
     [RabbitMQ]  [Redis]  [PostgreSQL]
```

## Memory Savings

**Before (7 separate processes):**
- Each process: ~50-100 MB overhead
- Total overhead: ~350-700 MB

**After (1 monolith process):**
- Single process: ~50-100 MB overhead
- **Savings: ~300-600 MB (43-85% reduction)**

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, either:
1. Stop the service using that port
2. Change the port mapping in `docker-compose.monolith.yml`:
   ```yaml
   ports:
     - '3002:3001'  # External:Internal
   ```

### RabbitMQ Connection Failed
- Ensure RabbitMQ is healthy: `docker-compose -f docker-compose.monolith.yml ps`
- Check RabbitMQ logs: `docker-compose -f docker-compose.monolith.yml logs rabbitmq`
- Verify credentials in `.env` match the RabbitMQ configuration

### Database Connection Failed
- Ensure PostgreSQL is running and healthy
- Check connection string in your configuration
- Verify database exists: `docker exec -it sprocket-postgres-1 psql -U sprocketbot -l`

### Build Errors
If you encounter build errors:
```bash
# Rebuild without cache
docker-compose -f docker-compose.monolith.yml build --no-cache monolith

# Or rebuild locally
npm run build:common
npm run build:monolith
```

## Switching Back to Microservices

To run the original microservice architecture:

```bash
docker-compose up
```

This will start all services individually as before.

## Development Workflow

1. **Start infrastructure:**
   ```bash
   docker-compose -f docker-compose.monolith.yml up rabbitmq redis postgres minio
   ```

2. **Run monolith in watch mode:**
   ```bash
   npm run dev:monolith
   ```

3. **Make changes** - The monolith will automatically restart on file changes

4. **Run tests:**
   ```bash
   npm run test --workspace=apps/monolith
   ```

## Production Deployment

For production, build and run the optimized version:

```bash
# Build
npm run build:monolith

# Run
npm run start:monolith
```

Or use the production Dockerfile (to be created for production deployments).

## Contributing

When adding new features to the monolith, ensure they're added to the appropriate service module within the consolidated structure. The monolith maintains service boundaries through module imports.

## Support

For issues or questions, please open an issue in the GitHub repository.
