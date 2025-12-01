#!/bin/bash

# Test script for intakeUser mutation
# This tests the fix for infinite recursion and proper entity loading

set -e

echo "Testing intakeUser mutation..."
echo "================================"
echo ""

# Generate a unique Discord ID for testing
TEST_DISCORD_ID="test_$(date +%s)"
TEST_NAME="TestPlayer_$(date +%s)"
TEST_SKILL_GROUP_ID=1  # Assuming skill group ID 1 exists
TEST_SALARY=100.0

echo "Test Case 1: Create new user"
echo "Discord ID: $TEST_DISCORD_ID"
echo "Name: $TEST_NAME"
echo "Skill Group ID: $TEST_SKILL_GROUP_ID"
echo "Salary: $TEST_SALARY"
echo ""

# First, let's verify the skill group exists
echo "Verifying skill group exists..."
SKILL_GROUP_EXISTS=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
  "SELECT COUNT(*) FROM sprocket.game_skill_group WHERE id = $TEST_SKILL_GROUP_ID;")

if [ "$(echo $SKILL_GROUP_EXISTS | xargs)" == "0" ]; then
  echo "✗ Skill group ID $TEST_SKILL_GROUP_ID does not exist in the database"
  echo "Available skill groups:"
  docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -c \
    "SELECT gsg.id, gsgp.description FROM sprocket.game_skill_group gsg
     JOIN sprocket.game_skill_group_profile gsgp ON gsg.id = gsgp.\"skillGroupId\"
     LIMIT 10;"
  exit 1
fi

echo "✓ Skill group exists"
echo ""

# GraphQL mutation for intakeUser
MUTATION='mutation {
  intakeUser(
    name: "'"$TEST_NAME"'",
    discord_id: "'"$TEST_DISCORD_ID"'",
    playersToLink: [{
      gameSkillGroupId: '$TEST_SKILL_GROUP_ID',
      salary: '$TEST_SALARY'
    }]
  ) {
    ... on Player {
      id
      salary
      member {
        id
        profile {
          name
        }
        user {
          id
          profile {
            displayName
          }
        }
      }
      skillGroup {
        id
      }
    }
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
if echo "$RESPONSE" | jq -e '.data.intakeUser.id' > /dev/null 2>&1; then
  PLAYER_ID=$(echo "$RESPONSE" | jq -r '.data.intakeUser.id')
  echo "✓ User intake successful! Player ID: $PLAYER_ID"

  # Verify the data in the database
  echo ""
  echo "Verifying database state..."

  # Check User
  USER_COUNT=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT COUNT(*) FROM sprocket.user u
     JOIN sprocket.user_authentication_account uaa ON u.id = uaa.\"userId\"
     WHERE uaa.\"accountId\" = '$TEST_DISCORD_ID' AND uaa.\"accountType\" = 'DISCORD';")
  echo "Users with Discord ID $TEST_DISCORD_ID: $(echo $USER_COUNT | xargs)"

  # Check UserAuthenticationAccount
  AUTH_COUNT=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT COUNT(*) FROM sprocket.user_authentication_account
     WHERE \"accountId\" = '$TEST_DISCORD_ID' AND \"accountType\" = 'DISCORD';")
  echo "Auth accounts: $(echo $AUTH_COUNT | xargs)"

  # Check Member
  MEMBER_COUNT=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT COUNT(*) FROM sprocket.member m
     JOIN sprocket.user u ON m.\"userId\" = u.id
     JOIN sprocket.user_authentication_account uaa ON u.id = uaa.\"userId\"
     WHERE uaa.\"accountId\" = '$TEST_DISCORD_ID';")
  echo "Members: $(echo $MEMBER_COUNT | xargs)"

  # Check Player
  PLAYER_COUNT=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
    "SELECT COUNT(*) FROM sprocket.player WHERE id = $PLAYER_ID;")
  echo "Players: $(echo $PLAYER_COUNT | xargs)"

  if [ "$(echo $USER_COUNT | xargs)" == "1" ] && \
     [ "$(echo $AUTH_COUNT | xargs)" == "1" ] && \
     [ "$(echo $MEMBER_COUNT | xargs)" == "1" ] && \
     [ "$(echo $PLAYER_COUNT | xargs)" == "1" ]; then
    echo "✓ All entities created correctly!"
  else
    echo "✗ Entity count mismatch - check the mutation logic"
  fi

  # Test Case 2: Try to create the same user again (should reuse existing)
  echo ""
  echo "Test Case 2: Attempt to create duplicate user"
  echo "This should reuse the existing user without errors"
  echo ""

  DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:3001/graphql \
    -H "Content-Type: application/json" \
    -d "{\"query\": $ESCAPED_MUTATION}")

  if echo "$DUPLICATE_RESPONSE" | jq -e '.data.intakeUser.id' > /dev/null 2>&1; then
    echo "✓ Duplicate user handled correctly (no infinite recursion)"

    # Verify we didn't create duplicate records
    NEW_USER_COUNT=$(docker-compose exec -T postgres psql -U sprocketbot -d sprocketbot -t -c \
      "SELECT COUNT(*) FROM sprocket.user u
       JOIN sprocket.user_authentication_account uaa ON u.id = uaa.\"userId\"
       WHERE uaa.\"accountId\" = '$TEST_DISCORD_ID';")

    if [ "$(echo $NEW_USER_COUNT | xargs)" == "1" ]; then
      echo "✓ No duplicate users created"
    else
      echo "✗ Duplicate users detected: $(echo $NEW_USER_COUNT | xargs)"
    fi
  else
    echo "Response to duplicate attempt:"
    echo "$DUPLICATE_RESPONSE" | jq '.'
    if echo "$DUPLICATE_RESPONSE" | jq -e '.data.intakeUser.message' > /dev/null 2>&1; then
      ERROR_MSG=$(echo "$DUPLICATE_RESPONSE" | jq -r '.data.intakeUser.message')
      echo "Returned error: $ERROR_MSG"
    fi
  fi

else
  echo "✗ User intake failed"
  if echo "$RESPONSE" | jq -e '.errors' > /dev/null; then
    echo "GraphQL Errors:"
    echo "$RESPONSE" | jq '.errors'
  elif echo "$RESPONSE" | jq -e '.data.intakeUser.message' > /dev/null; then
    echo "Operation Error:"
    echo "$RESPONSE" | jq '.data.intakeUser'
  fi
fi

echo ""
echo "Test complete!"
echo ""
echo "Cleanup note: Test user with Discord ID $TEST_DISCORD_ID was created and remains in the database."
