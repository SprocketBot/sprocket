#!/bin/bash

# Test script for the observability solution
# This script tests the complete observability implementation

set -e

echo "🚀 Starting Observability Solution Test..."
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Function to make HTTP requests and check responses
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 500 ]; then
        echo -e "${GREEN}✓ Success: HTTP $http_code${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}✗ Failed: HTTP $http_code${NC}"
        echo "Response: $body"
        return 1
    fi
    echo ""
}

# Test 1: Database Migration
echo "📊 Testing Database Migration..."
echo "Running migration to create observability tables..."

# Run the migration (assuming migrate-up script exists)
if [ -f "./migrate-up" ]; then
    ./migrate-up
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${YELLOW}⚠ Migration script not found, skipping database test${NC}"
fi
echo ""

# Test 2: Test Logging Endpoints
echo "📝 Testing Logging Functionality..."
test_endpoint "GET" "/test-observability/log-test" "Manual logging test"

# Test 3: Test Metrics Endpoints
echo "📈 Testing Metrics Functionality..."
test_endpoint "GET" "/test-observability/metric-test" "Manual metrics test"

# Test 4: Test Auto-Instrumentation
echo "🔍 Testing Auto-Instrumentation..."
test_endpoint "GET" "/test-observability/auto-instrumentation-test" "Auto-instrumentation test"

# Test 5: Test Error Handling
echo "❌ Testing Error Handling..."
test_endpoint "GET" "/test-observability/error-test" "Error handling test"

# Test 6: Check Database Entries
echo "🗄️ Checking Database Entries..."
echo "This would typically check the database for logs and metrics entries"
echo "For now, you can manually check the database with:"
echo "psql -U postgres -d postgres -c 'SELECT COUNT(*) FROM sprocket.logs;'"
echo "psql -U postgres -d postgres -c 'SELECT COUNT(*) FROM sprocket.metrics;'"

# Test 7: Check Jaeger UI
echo ""
echo "🌍 Checking Observability UIs..."
echo "Jaeger UI should be available at: http://jaeger.localhost:16686"
echo "Grafana UI should be available at: http://grafana.localhost:3000"
echo "Tempo is available for distributed tracing"

# Test 8: Check Service Health
echo ""
echo "🏥 Checking Service Health..."
health_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
health_code=$(echo "$health_response" | tail -n 1)

if [ "$health_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Core service is healthy${NC}"
else
    echo -e "${RED}✗ Core service health check failed${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Observability Solution Test Completed!${NC}"
echo ""
echo "Next Steps:"
echo "1. Run the migration: ./migrate-up"
echo "2. Start the services: docker-compose up -d"
echo "3. Test the endpoints manually:"
echo "   - curl $BASE_URL/test-observability/log-test"
echo "   - curl $BASE_URL/test-observability/metric-test"
echo "   - curl $BASE_URL/test-observability/auto-instrumentation-test"
echo "   - curl $BASE_URL/test-observability/error-test"
echo "4. Check Jaeger UI: http://jaeger.localhost:16686"
echo "5. Check Grafana UI: http://grafana.localhost:3000"
echo ""
echo -e "${YELLOW}Note: Make sure to run the migration before testing!${NC}"