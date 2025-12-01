#!/bin/bash

# Test script for changePlayerName mutation
# This tests the fix for the TypeORM relations issue

set -e

echo "Testing changePlayerName mutation..."
echo "======================================"
echo ""

# Test player: mleid=10000, name=-j
MLEID=10000
OLD_NAME="-j"
NEW_NAME="TestNameChange"

echo "Test Case 1: Change player name"
echo "Player MLEID: $MLEID"
echo "Old Name: $OLD_NAME"
echo "New Name: $NEW_NAME"
echo ""

# GraphQL mutation
MUTATION='mutation {
  changePlayerName(mleid: '$MLEID', newName: "'"$NEW_NAME"'") {
    ... on OperationError {
      message
      code
    }
  }
}'

echo "Sending GraphQL mutation..."
# Properly escape the GraphQL query for JSON
ESCAPED_MUTATION=$(echo "$MUTATION" | jq -Rs .)
RESPONSE=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\": $ESCAPED_MUTATION}")

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Check if the mutation was successful
if echo "$RESPONSE" | jq -e '.data.changePlayerName.code == 200' > /dev/null; then
  echo "✓ Mutation completed successfully"

  # Verify the name was changed in the database
  echo ""
  echo "Verifying database changes..."
  CURRENT_NAME=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT name FROM mledb.player WHERE mleid = $MLEID;")

  echo "Current name in MLE DB: $(echo $CURRENT_NAME | xargs)"

  # Check user profile
  USER_DISPLAY_NAME=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT up.\"displayName\" FROM sprocket.user_profile up
     JOIN sprocket.user u ON u.id = up.\"userId\"
     JOIN mledb_bridge.player_to_user ptu ON u.id = ptu.\"userId\"
     JOIN mledb.player p ON p.id = ptu.\"playerId\"
     WHERE p.mleid = $MLEID;")

  echo "User display name: $(echo $USER_DISPLAY_NAME | xargs)"

  if [ "$(echo $CURRENT_NAME | xargs)" == "$NEW_NAME" ] && [ "$(echo $USER_DISPLAY_NAME | xargs)" == "$NEW_NAME" ]; then
    echo "✓ Name successfully updated in both MLE DB and Sprocket user profile!"
  else
    echo "✗ Name mismatch - check the mutation logic"
  fi
else
  echo "✗ Mutation failed"
  if echo "$RESPONSE" | jq -e '.errors' > /dev/null; then
    echo "Errors:"
    echo "$RESPONSE" | jq '.errors'
  fi
fi

echo ""
echo "Test Case 2: Restore original name"
echo "Restoring name to: $OLD_NAME"
echo ""

# Restore original name
RESTORE_MUTATION='mutation {
  changePlayerName(mleid: '$MLEID', newName: "'"$OLD_NAME"'") {
    ... on OperationError {
      message
      code
    }
  }
}'

ESCAPED_RESTORE=$(echo "$RESTORE_MUTATION" | jq -Rs .)
RESTORE_RESPONSE=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\": $ESCAPED_RESTORE}")

if echo "$RESTORE_RESPONSE" | jq -e '.data.changePlayerName.code == 200' > /dev/null; then
  echo "✓ Name restored successfully"
else
  echo "✗ Failed to restore name"
fi

echo ""
echo "Test complete!"
