#!/bin/bash

# Generate random passwords for infrastructure services
# These will be consistent across all layers

set -e

# Function to generate a secure random password
generate_password() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate a secure random token (longer, single line)
generate_token() {
  openssl rand -base64 64 | tr -d "=+/\n\r " | tr -d '\n\r' | cut -c1-50
}

echo "🔐 Generating infrastructure passwords..."

echo "🔑 Creating ./secret directory for secret files..."
mkdir -p secret

# Generate passwords for layer 2 services
REDIS_PASSWORD=$(generate_password)
REDIS_HOST="layer2_redis"
REDIS_PORT="6379"
MINIO_ROOT_USER="admin"
MINIO_ROOT_PASSWORD=$(generate_password)
MINIO_ENDPOINT="minio"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="sprocketuser"
MINIO_SECRET_KEY=$(generate_password)
MINIO_USE_SSL="false"
MINIO_REPLAYS_BUCKET="replays"
MINIO_IMAGE_GENERATION_BUCKET="image-generation"
INFLUX_ADMIN_PASSWORD=$(generate_password)
INFLUX_ADMIN_TOKEN=$(generate_token)
GRAFANA_ADMIN_PASSWORD=$(generate_password)

# Generate passwords for layer 3 services
PLATFORM_REDIS_PASSWORD=$(generate_password)
RABBITMQ_USER="admin"
RABBITMQ_PASSWORD=$(generate_password)

# Generate auth secrets
JWT_SECRET="sprocket-jwt-secret-$(date +%s)"
FORWARD_AUTH_SECRET=$(generate_token)

# Create infrastructure passwords file
cat >.env.infra <<EOF
# Generated Infrastructure Passwords
# These are generated locally and used across all layers

# Layer 2 Infrastructure Services
REDIS_PASSWORD='${REDIS_PASSWORD}'
REDIS_HOST='${REDIS_HOST}'
REDIS_PORT='${REDIS_PORT}'
MINIO_ROOT_USER='${MINIO_ROOT_USER}'
MINIO_ROOT_PASSWORD='${MINIO_ROOT_PASSWORD}'
MINIO_ENDPOINT='${MINIO_ENDPOINT}'
MINIO_PORT='${MINIO_PORT}'
MINIO_ACCESS_KEY='${MINIO_ACCESS_KEY}'
MINIO_SECRET_KEY='${MINIO_SECRET_KEY}'
MINIO_USE_SSL='${MINIO_USE_SSL}'
MINIO_REPLAYS_BUCKET='${MINIO_REPLAYS_BUCKET}'
MINIO_IMAGE_GENERATION_BUCKET='${MINIO_IMAGE_GENERATION_BUCKET}'
INFLUX_ADMIN_PASSWORD='${INFLUX_ADMIN_PASSWORD}'
INFLUX_ADMIN_TOKEN='${INFLUX_ADMIN_TOKEN}'
GRAFANA_ADMIN_PASSWORD='${GRAFANA_ADMIN_PASSWORD}'

# Layer 3 Platform Services
PLATFORM_REDIS_PASSWORD='${PLATFORM_REDIS_PASSWORD}'
RABBITMQ_USER='${RABBITMQ_USER}'
RABBITMQ_PASSWORD='${RABBITMQ_PASSWORD}'

# Transport Queues
TRANSPORT_CORE_QUEUE='core'
TRANSPORT_BOT_QUEUE='bot'
TRANSPORT_ANALYTICS_QUEUE='analytics'
TRANSPORT_MATCHMAKING_QUEUE='matchmaking'
TRANSPORT_NOTIFICATION_QUEUE='notifications'
TRANSPORT_EVENTS_QUEUE='events'
TRANSPORT_EVENTS_APPLICATION_KEY='sprocket'
TRANSPORT_IMAGE_GENERATION_QUEUE='image-generation'
TRANSPORT_SUBMISSION_QUEUE='submission'
CELERY_QUEUE='celery'

# Auth Secrets
FORWARD_AUTH_SECRET='${FORWARD_AUTH_SECRET}'
JWT_SECRET='${JWT_SECRET}'

# Additional Configuration for Layer 3 Services
BOT_PREFIX='!'
REDIS_PREFIX='sprocket:'
REDIS_SECURE='false'
CACHE_HOST='layer2_redis'
CACHE_PORT='6379'
CACHE_PASSWORD='${REDIS_PASSWORD}'
CACHE_SECURE='false'
JWT_EXPIRY="15m"
ACCESS_EXPIRY="15m"
REFRESH_EXPIRY="7d"
CLIENT_SECURE="true"
CLIENT_CHATWOOT_ENABLED="false"
CLIENT_CHATWOOT_URL=""
CLIENT_CHATWOOT_WEBSITE_TOKEN=""
GQL_PLAYGROUND="false"
LOGGER_LEVELS="error,warn,log"
DEFAULT_ORGANIZATION_ID="1"
EOF

echo "\$JWT_SECRET" > ./secret/jwtSecret.txt
echo "\$MINIO_ACCESS_KEY" > ./secret/minio-access-key.txt
echo "\$MINIO_SECRET_KEY" > ./secret/minio-secret-key.txt

echo "✅ Generated infrastructure passwords in .env.infra"
echo ""
echo "These passwords will be:"
echo "  - Used to configure the services when they start"
echo "  - Used by dependent services to connect"
echo "  - Combined with your Doppler secrets in the final .env file"
