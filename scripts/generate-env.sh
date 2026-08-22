#!/bin/bash

# Script to generate complete .env file from Doppler + generated infrastructure passwords
# Run this locally where you have Doppler CLI authenticated

set -e

DOPPLER_PROJECT="${DOPPLER_PROJECT:-sprocket}"
DOPPLER_CONFIG="${DOPPLER_CONFIG:-prd}"

echo "🔐 Step 1: Generating infrastructure passwords..."
./generate-passwords.sh

echo ""
echo "☁️  Step 2: Downloading secrets from Doppler project: $DOPPLER_PROJECT, config: $DOPPLER_CONFIG"

# Generate .env file from Doppler
doppler secrets download --project="$DOPPLER_PROJECT" --config="$DOPPLER_CONFIG" --format=env --no-file >.env.doppler

echo ""
echo "🔗 Step 3: Combining infrastructure passwords with Doppler secrets..."

# Combine infrastructure passwords with Doppler secrets
cat .env.infra .env.doppler >.env

# Fix compatibility issues: Copy POSTGRES_HOSTNAME to POSTGRES_HOST for services that expect it
if grep -q "^POSTGRES_HOSTNAME=" .env && ! grep -q "^POSTGRES_HOST=" .env; then
  echo "# Compatibility: Copy POSTGRES_HOSTNAME to POSTGRES_HOST" >>.env
  grep "^POSTGRES_HOSTNAME=" .env | sed 's/POSTGRES_HOSTNAME=/POSTGRES_HOST=/' >>.env
fi

# # Prefer our generated JWT_SECRET over Doppler's (remove Doppler's if it has special chars)
# if grep -q "^JWT_SECRET=" .env.infra && grep -q '[{}#$%<>`]' .env && grep -q "^JWT_SECRET=" .env; then
#     echo "# Replacing complex JWT_SECRET with simple generated one"
#     sed -i '/^JWT_SECRET=/d' .env
#     grep "^JWT_SECRET=" .env.infra >> .env
# fi

# Clean up temporary files
rm .env.infra .env.doppler

echo "✅ Generated complete .env file with $(wc -l <.env) environment variables"
echo ""
echo "This .env file contains:"
echo "  - Generated infrastructure passwords (Redis, MinIO, RabbitMQ, etc.)"
echo "  - Your Doppler secrets (Discord tokens, database credentials, etc.)"
echo ""
echo "Next steps:"
echo "1. Review the .env file to ensure all required variables are present"
echo "2. Copy files to your swarm manager:"
echo "   scp .env *.yml deploy.sh user@swarm-manager:~/sprocket-deployment/"
echo "3. Run the deployment script on the swarm manager"
echo ""
echo "Required variables check:"

# Check for critical variables
REQUIRED_VARS=(
  "HOSTNAME"
  "ENVIRONMENT_SUBDOMAIN"
  "IMAGE_TAG"
  "POSTGRES_HOSTNAME"
  "POSTGRES_PASSWORD"
  "POSTGRES_USERNAME"
  "POSTGRES_DATABASE"
  "POSTGRES_PORT"
  "DISCORD_CLIENT_ID"
  "DISCORD_CLIENT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "^${var}=" .env; then
    echo "✅ $var"
  else
    echo "❌ $var (missing - add to Doppler)"
  fi
done

echo ""
echo "Generated infrastructure passwords:"
INFRA_VARS=(
  "REDIS_PASSWORD"
  "REDIS_HOST"
  "REDIS_PORT"
  "MINIO_ROOT_PASSWORD"
  "MINIO_ENDPOINT"
  "MINIO_PORT"
  "MINIO_ACCESS_KEY"
  "MINIO_SECRET_KEY"
  "MINIO_USE_SSL"
  "MINIO_REPLAYS_BUCKET"
  "MINIO_IMAGE_GENERATION_BUCKET"
  "PLATFORM_REDIS_PASSWORD"
  "RABBITMQ_USER"
  "RABBITMQ_PASSWORD"
  "TRANSPORT_EVENTS_QUEUE"
  "TRANSPORT_CORE_QUEUE"
  "TRANSPORT_BOT_QUEUE"
  "CELERY_QUEUE"
  "JWT_SECRET"
  "FORWARD_AUTH_SECRET"
  "CACHE_HOST"
  "CACHE_PORT"
  "CACHE_PASSWORD"
  "BOT_PREFIX"
  "REDIS_PREFIX"
  "DEFAULT_ORGANIZATION_ID"
)

for var in "${INFRA_VARS[@]}"; do
  if grep -q "^${var}=" .env; then
    echo "✅ $var (generated)"
  else
    echo "❌ $var (generation failed)"
  fi
done
