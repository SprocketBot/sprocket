#!/bin/bash
set -e

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: File $ENV_FILE not found."
    echo "Usage: $0 [.env file path]"
    exit 1
fi

echo "Reading secrets from $ENV_FILE..."

# Define mapping from ENV_VAR to pulumi-config-key
declare -A MAPPING=(
    ["GOOGLE_CLIENT_ID"]="google-client-id"
    ["GOOGLE_CLIENT_SECRET"]="google-client-secret"
    ["DISCORD_CLIENT_ID"]="discord-client-id"
    ["DISCORD_CLIENT_SECRET"]="discord-client-secret"
    ["EPIC_CLIENT_ID"]="epic-client-id"
    ["EPIC_CLIENT_SECRET"]="epic-client-secret"
    ["STEAM_API_KEY"]="steam-api-key"
    ["BALLCHASING_TOKEN"]="ballchasing-token"
    ["BALLCHASING_API_KEY"]="ballchasing-token"
    ["BALLCHASING_API_TOKEN"]="ballchasing-token"
    ["CHATWOOT_HMAC_KEY"]="chatwoot-hmac-key"
    ["DISCORD_BOT_TOKEN"]="discord-bot-token"
)

# Read file line by line
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Trim whitespace from key
    key=$(echo "$key" | xargs)
    # Remove 'export ' prefix if present
    key=${key#export }
    # Value might contain spaces, so we only trim leading/trailing
    value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    if [[ -n "${MAPPING[$key]}" ]]; then
        pulumi_key="${MAPPING[$key]}"
        echo "Setting $pulumi_key..."
        pulumi config set --secret "$pulumi_key" "$value"
    fi
done < "$ENV_FILE"

echo "Secrets configuration complete."
