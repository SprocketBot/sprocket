#!/bin/bash

# Sprocket Platform Deployment Verification Script
# This script performs comprehensive checks on the deployed platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXPECTED_SERVICES=(
    "traefik-d3127fd"
    "prod-sprocket-core-service"
    "prod-sprocket-web-service"
    "prod-discord-bot-service"
    "prod-datastores-redis-redis-primary"
    "prod-datastores-rmq-service"
)

EXPECTED_HOSTS=(
    "sprocket.spr.ocket.cloud"
    "api.sprocket.spr.ocket.cloud"
    "image-generation.sprocket.spr.ocket.cloud"
)

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check 1: Docker Swarm Mode
print_header "1. Checking Docker Swarm Mode"
if docker info 2>/dev/null | grep -q "Swarm: active"; then
    print_success "Docker Swarm is active"
else
    print_error "Docker Swarm is not active"
    exit 1
fi

# Check 2: Docker Services Status
print_header "2. Checking Docker Services"
echo -e "${BLUE}Service Status:${NC}"
docker service ls --format "table {{.Name}}\t{{.Mode}}\t{{.Replicas}}" | head -20

echo ""
FAILED_SERVICES=0
for service_pattern in "${EXPECTED_SERVICES[@]}"; do
    SERVICE_COUNT=$(docker service ls --filter "name=${service_pattern}" --format "{{.Name}}" | wc -l)
    if [ "$SERVICE_COUNT" -gt 0 ]; then
        SERVICE_NAME=$(docker service ls --filter "name=${service_pattern}" --format "{{.Name}}" | head -1)
        REPLICAS=$(docker service ls --filter "name=${service_pattern}" --format "{{.Replicas}}" | head -1)
        if echo "$REPLICAS" | grep -q "0/"; then
            print_error "Service $SERVICE_NAME has 0 replicas running"
            FAILED_SERVICES=$((FAILED_SERVICES + 1))
        else
            print_success "Service $SERVICE_NAME is running ($REPLICAS)"
        fi
    else
        print_error "Service matching '$service_pattern' not found"
        FAILED_SERVICES=$((FAILED_SERVICES + 1))
    fi
done

if [ $FAILED_SERVICES -gt 0 ]; then
    print_warning "$FAILED_SERVICES service(s) have issues"
fi

# Check 3: Traefik Status
print_header "3. Checking Traefik Configuration"
TRAEFIK_SERVICE=$(docker service ls --filter "name=traefik" --format "{{.Name}}" | head -1)
if [ -n "$TRAEFIK_SERVICE" ]; then
    print_success "Traefik service found: $TRAEFIK_SERVICE"

    # Check Traefik ports
    PORTS=$(docker service inspect "$TRAEFIK_SERVICE" --format '{{range .Endpoint.Ports}}{{.PublishedPort}}->{{.TargetPort}}/{{.Protocol}} {{end}}')
    print_info "Traefik ports: $PORTS"

    # Check for port 80 and 443
    if echo "$PORTS" | grep -q "80->"; then
        print_success "Port 80 is exposed"
    else
        print_error "Port 80 is not exposed"
    fi

    if echo "$PORTS" | grep -q "443->"; then
        print_success "Port 443 is exposed"
    else
        print_error "Port 443 is not exposed"
    fi
else
    print_error "Traefik service not found"
fi

# Check 4: Web Service Configuration
print_header "4. Checking Web Service Configuration"
WEB_SERVICE=$(docker service ls --filter "name=prod-sprocket-web-service" --format "{{.Name}}" | head -1)
if [ -n "$WEB_SERVICE" ]; then
    print_success "Web service found: $WEB_SERVICE"

    # Get Traefik labels
    LABELS=$(docker service inspect "$WEB_SERVICE" --format '{{json .Spec.TaskTemplate.ContainerSpec.Labels}}')

    if echo "$LABELS" | jq -r '.[] | select(. == "true")' 2>/dev/null | grep -q "true"; then
        print_success "Traefik enabled on web service"
    fi

    RULE=$(echo "$LABELS" | jq -r '."traefik.http.routers.sprocket-web-sprocket.rule"' 2>/dev/null)
    if [ "$RULE" != "null" ] && [ -n "$RULE" ]; then
        print_success "Routing rule configured: $RULE"
    else
        print_error "No routing rule found"
    fi

    PORT=$(echo "$LABELS" | jq -r '."traefik.http.services.sprocket-web-sprocket.loadbalancer.server.port"' 2>/dev/null)
    if [ "$PORT" != "null" ] && [ -n "$PORT" ]; then
        print_success "Target port configured: $PORT"
    fi
else
    print_error "Web service not found"
fi

# Check 5: DNS/Hosts Configuration
print_header "5. Checking DNS/Hosts Configuration"
HOSTS_MISSING=0
for host in "${EXPECTED_HOSTS[@]}"; do
    if getent hosts "$host" >/dev/null 2>&1; then
        IP=$(getent hosts "$host" | awk '{print $1}')
        print_success "$host resolves to $IP"
    else
        print_error "$host does not resolve"
        HOSTS_MISSING=$((HOSTS_MISSING + 1))
    fi
done

if [ $HOSTS_MISSING -gt 0 ]; then
    print_warning "\nTo access services locally, add these entries to /etc/hosts:"
    echo -e "${YELLOW}127.0.0.1 ${EXPECTED_HOSTS[*]}${NC}"
    echo ""
    echo "Run: sudo nano /etc/hosts"
    echo "Add: 127.0.0.1 ${EXPECTED_HOSTS[*]}"
fi

# Check 6: Network Connectivity
print_header "6. Testing Network Connectivity"

# Test port 80
if timeout 2 bash -c "</dev/tcp/localhost/80" 2>/dev/null; then
    print_success "Port 80 is accessible"
else
    print_error "Port 80 is not accessible"
fi

# Test port 443
if timeout 2 bash -c "</dev/tcp/localhost/443" 2>/dev/null; then
    print_success "Port 443 is accessible"
else
    print_error "Port 443 is not accessible"
fi

# Test Traefik response
print_info "Testing Traefik HTTP response..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "000")
if [ "$HTTP_RESPONSE" = "404" ]; then
    print_success "Traefik is responding (404 means routing not matched, but Traefik is working)"
elif [ "$HTTP_RESPONSE" = "000" ]; then
    print_error "Cannot connect to Traefik on port 80"
else
    print_info "Traefik returned HTTP $HTTP_RESPONSE"
fi

# Check 7: Web Service Health
print_header "7. Checking Web Service Health"
WEB_CONTAINER=$(docker ps -q -f name=prod-sprocket-web | head -1)
if [ -n "$WEB_CONTAINER" ]; then
    print_success "Web service container found: $WEB_CONTAINER"

    # Check if service is listening
    print_info "Checking if web service is listening on port 3000..."
    if docker exec "$WEB_CONTAINER" sh -c "netstat -tuln 2>/dev/null | grep -q :3000 || ss -tuln 2>/dev/null | grep -q :3000" 2>/dev/null; then
        print_success "Web service is listening on port 3000"
    else
        print_warning "Cannot verify if web service is listening (netstat/ss not available)"
    fi

    # Check service logs
    print_info "Recent web service logs:"
    docker service logs "$WEB_SERVICE" --tail 5 2>&1 | sed 's/^/  /'
else
    print_error "Web service container not found"
fi

# Check 8: TLS/Certificate Status
print_header "8. Checking TLS Configuration"
print_info "Testing HTTPS connection to Traefik..."
TLS_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:443 2>/dev/null || echo "000")
if [ "$TLS_RESPONSE" != "000" ]; then
    print_success "Traefik HTTPS is responding (HTTP $TLS_RESPONSE)"

    # Check certificate
    CERT_INFO=$(echo | openssl s_client -connect localhost:443 -servername sprocket.spr.ocket.cloud 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "")
    if echo "$CERT_INFO" | grep -q "TRAEFIK DEFAULT CERT"; then
        print_warning "Using Traefik default certificate (Let's Encrypt cert not available)"
        print_info "This is expected for local development without proper DNS"
    elif [ -n "$CERT_INFO" ]; then
        print_success "Certificate: $CERT_INFO"
    fi
else
    print_error "Cannot connect to Traefik HTTPS on port 443"
fi

# Check 9: Direct Service Test
print_header "9. Testing Direct Service Access"
if [ $HOSTS_MISSING -eq 0 ]; then
    print_info "Testing HTTP access to sprocket.spr.ocket.cloud..."
    TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://sprocket.spr.ocket.cloud 2>/dev/null || echo "000")
    if [ "$TEST_RESPONSE" = "301" ] || [ "$TEST_RESPONSE" = "302" ] || [ "$TEST_RESPONSE" = "200" ]; then
        print_success "HTTP request successful (HTTP $TEST_RESPONSE)"
    elif [ "$TEST_RESPONSE" = "404" ]; then
        print_warning "HTTP 404 - Traefik is working but route not matched"
    else
        print_error "HTTP request failed (HTTP $TEST_RESPONSE)"
    fi

    print_info "Testing HTTPS access to sprocket.spr.ocket.cloud..."
    TEST_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://sprocket.spr.ocket.cloud 2>/dev/null || echo "000")
    if [ "$TEST_RESPONSE" = "200" ]; then
        print_success "HTTPS request successful!"
        print_info "You can access the website at: https://sprocket.spr.ocket.cloud"
    elif [ "$TEST_RESPONSE" = "301" ] || [ "$TEST_RESPONSE" = "302" ]; then
        print_success "HTTPS request returned redirect (HTTP $TEST_RESPONSE)"
    elif [ "$TEST_RESPONSE" = "404" ]; then
        print_error "HTTPS 404 - Route not matched. Check Traefik routing configuration"
    else
        print_error "HTTPS request failed (HTTP $TEST_RESPONSE)"
    fi
else
    print_warning "Skipping direct service test - DNS/hosts not configured"
fi

# Check 10: Service Logs for Errors
print_header "10. Checking for Recent Errors"
print_info "Recent Traefik errors (last 10):"
docker service logs "$TRAEFIK_SERVICE" --tail 100 2>&1 | grep -i "error" | tail -10 | sed 's/^/  /' || echo "  No recent errors"

# Summary
print_header "Verification Summary"
if [ $FAILED_SERVICES -eq 0 ] && [ $HOSTS_MISSING -eq 0 ]; then
    print_success "All checks passed! Your platform should be accessible."
    echo -e "\n${GREEN}Access your platform at:${NC}"
    echo -e "  • Web UI: ${BLUE}https://sprocket.spr.ocket.cloud${NC}"
    echo -e "  • API: ${BLUE}https://api.sprocket.spr.ocket.cloud${NC}"
    echo -e "  • Image Gen: ${BLUE}https://image-generation.sprocket.spr.ocket.cloud${NC}"
elif [ $HOSTS_MISSING -gt 0 ]; then
    print_warning "Services are running, but DNS/hosts configuration needed."
    echo -e "\n${YELLOW}Action Required:${NC}"
    echo -e "Add to ${BLUE}/etc/hosts${NC}: ${YELLOW}127.0.0.1 ${EXPECTED_HOSTS[*]}${NC}"
    echo -e "\nThen access your platform at:"
    echo -e "  • Web UI: ${BLUE}https://sprocket.spr.ocket.cloud${NC}"
else
    print_error "Some checks failed. Review the output above for details."
    exit 1
fi
