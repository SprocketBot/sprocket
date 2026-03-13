#!/bin/bash

# Quick test script for local Sprocket deployment
# This script tests if services are accessible locally

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== Quick Sprocket Deployment Test ==="
echo ""

# Test 1: Check if Traefik is responding
echo -n "Testing Traefik on port 80... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: sprocket.spr.ocket.cloud" http://localhost:80 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}OK (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}Traefik responding but route not matched (404)${NC}"
else
    echo -e "${RED}FAIL (HTTP $HTTP_CODE)${NC}"
fi

# Test 2: Check if HTTPS works
echo -n "Testing Traefik on port 443... "
HTTPS_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" -H "Host: sprocket.spr.ocket.cloud" https://localhost:443 2>/dev/null)
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo -e "${GREEN}OK (HTTP $HTTPS_CODE)${NC}"
elif [ "$HTTPS_CODE" = "404" ]; then
    echo -e "${YELLOW}Traefik responding but route not matched (404)${NC}"
else
    echo -e "${RED}FAIL (HTTP $HTTPS_CODE)${NC}"
fi

# Test 3: Check DNS resolution
echo -n "Checking DNS for sprocket.spr.ocket.cloud... "
RESOLVED_IP=$(getent hosts sprocket.spr.ocket.cloud | awk '{print $1}')
if [ "$RESOLVED_IP" = "127.0.0.1" ] || [ "$RESOLVED_IP" = "::1" ]; then
    echo -e "${GREEN}Resolves to localhost ($RESOLVED_IP)${NC}"
elif [ -n "$RESOLVED_IP" ]; then
    echo -e "${YELLOW}Resolves to $RESOLVED_IP (NOT localhost)${NC}"
    echo -e "${YELLOW}You need to add to /etc/hosts:${NC}"
    echo -e "${YELLOW}  127.0.0.1 sprocket.spr.ocket.cloud api.sprocket.spr.ocket.cloud image-generation.sprocket.spr.ocket.cloud${NC}"
else
    echo -e "${RED}Does not resolve${NC}"
fi

# Test 4: Check if web service container is running
echo -n "Checking web service container... "
WEB_CONTAINER=$(docker ps -q -f name=prod-sprocket-web 2>/dev/null | head -1)
if [ -n "$WEB_CONTAINER" ]; then
    echo -e "${GREEN}Running ($WEB_CONTAINER)${NC}"
else
    echo -e "${RED}Not found${NC}"
fi

# Test 5: Check Traefik routing
echo -n "Checking Traefik router for web service... "
TRAEFIK_CONTAINER=$(docker ps -q -f name=traefik 2>/dev/null | head -1)
if [ -n "$TRAEFIK_CONTAINER" ]; then
    ROUTER_EXISTS=$(docker exec "$TRAEFIK_CONTAINER" wget -q -O- http://localhost:8080/api/http/routers 2>/dev/null | grep -o "sprocket-web-sprocket" | head -1)
    if [ "$ROUTER_EXISTS" = "sprocket-web-sprocket" ]; then
        echo -e "${GREEN}Router configured${NC}"
    else
        echo -e "${RED}Router not found${NC}"
    fi
else
    echo -e "${RED}Traefik container not found${NC}"
fi

echo ""
echo "=== Summary ==="
if [ "$RESOLVED_IP" != "127.0.0.1" ] && [ "$RESOLVED_IP" != "::1" ]; then
    echo -e "${YELLOW}Action needed:${NC} Add domains to /etc/hosts"
    echo ""
    echo "Run this command:"
    echo -e "${GREEN}echo '127.0.0.1 sprocket.spr.ocket.cloud api.sprocket.spr.ocket.cloud image-generation.sprocket.spr.ocket.cloud' | sudo tee -a /etc/hosts${NC}"
    echo ""
    echo "Then test with:"
    echo "  curl -k https://sprocket.spr.ocket.cloud"
else
    echo -e "${GREEN}Services are configured! Access at:${NC}"
    echo "  http://sprocket.spr.ocket.cloud"
    echo "  https://sprocket.spr.ocket.cloud (use -k with curl to skip cert verification)"
fi
