#!/bin/bash
set -e

# Test script for intakeUserBulk mutation
# This script reproduces the infinite recursion bug when trying to intake
# a user with a Discord ID that already exists

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DATA_DIR="$SCRIPT_DIR/test-data"
CSV_FILE="$TEST_DATA_DIR/test-users.csv"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Testing intakeUserBulk Mutation ===${NC}"
echo ""

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}Error: CSV file not found at $CSV_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Test CSV content:${NC}"
cat "$CSV_FILE"
echo ""

# GraphQL endpoint
GRAPHQL_URL="${GRAPHQL_URL:-http://localhost:3001/graphql}"

echo -e "${YELLOW}Testing against: $GRAPHQL_URL${NC}"
echo ""

# Create a multipart form data request
# Note: This is a simplified version. In production, you'd need proper auth token
BOUNDARY="----WebKitFormBoundary$(date +%s)"

# Create temporary file for the request
TEMP_REQUEST=$(mktemp)

cat > "$TEMP_REQUEST" << EOF
--${BOUNDARY}
Content-Disposition: form-data; name="operations"

{"query":"mutation IntakeUserBulk(\$files: [Upload!]!) { intakeUserBulk(files: \$files) }","variables":{"files":[null]}}
--${BOUNDARY}
Content-Disposition: form-data; name="map"

{"0":["variables.files.0"]}
--${BOUNDARY}
Content-Disposition: form-data; name="0"; filename="test-users.csv"
Content-Type: text/csv

$(cat "$CSV_FILE")
--${BOUNDARY}--
EOF

echo -e "${GREEN}Sending GraphQL mutation...${NC}"
echo ""

# Send the request
RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: multipart/form-data; boundary=${BOUNDARY}" \
    --data-binary "@$TEMP_REQUEST" || echo '{"errors":[{"message":"Connection failed"}]}')

# Clean up
rm "$TEMP_REQUEST"

echo -e "${YELLOW}Response:${NC}"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for errors
if echo "$RESPONSE" | grep -q '"errors"'; then
    echo -e "${RED}✗ Mutation returned errors${NC}"

    # Check for recursion-related errors
    if echo "$RESPONSE" | grep -qi "maximum.*call.*stack\|recursion\|stack.*overflow"; then
        echo -e "${RED}🔥 INFINITE RECURSION DETECTED!${NC}"
        echo -e "${YELLOW}This is the bug we're trying to fix.${NC}"
    fi

    exit 1
else
    echo -e "${GREEN}✓ Mutation completed${NC}"

    # Check if there were any business logic errors returned in the data
    ERRORS=$(echo "$RESPONSE" | jq -r '.data.intakeUserBulk[]?' 2>/dev/null || echo "")
    if [ -n "$ERRORS" ] && [ "$ERRORS" != "null" ]; then
        echo -e "${YELLOW}Business logic errors encountered:${NC}"
        echo "$ERRORS"
    else
        echo -e "${GREEN}✓ No errors reported${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=== Test Complete ===${NC}"
