# Accessing Sprocket Platform Locally

## Problem Identified

Your Sprocket platform is **successfully deployed and running**! However, the domains (`sprocket.spr.ocket.cloud`, etc.) currently resolve to a remote IP address (178.128.133.209) via public DNS, not to your local machine.

## Quick Diagnosis

Run this script anytime to check your local deployment status:

```bash
./quick-test.sh
```

## Solution: Configure /etc/hosts

To access your local deployment in your browser, you need to override DNS resolution by adding entries to `/etc/hosts`:

### Step 1: Edit /etc/hosts

```bash
sudo nano /etc/hosts
```

### Step 2: Add these lines at the end

```
127.0.0.1 sprocket.spr.ocket.cloud
127.0.0.1 api.sprocket.spr.ocket.cloud
127.0.0.1 image-generation.sprocket.spr.ocket.cloud
```

Or run this one-liner:

```bash
echo '127.0.0.1 sprocket.spr.ocket.cloud api.sprocket.spr.ocket.cloud image-generation.sprocket.spr.ocket.cloud' | sudo tee -a /etc/hosts
```

### Step 3: Access Your Services

Once /etc/hosts is configured:

- **Web UI**: https://sprocket.spr.ocket.cloud
- **API**: https://api.sprocket.spr.ocket.cloud
- **Image Generation**: https://image-generation.sprocket.spr.ocket.cloud

**Note**: Your browser will show a certificate warning because you're using Traefik's default self-signed certificate (Let's Encrypt can't issue certs for localhost). This is normal for local development. Click "Advanced" → "Accept the Risk and Continue" (or similar in your browser).

### Testing from Command Line

```bash
# Test with curl (skip cert verification with -k)
curl -k https://sprocket.spr.ocket.cloud

# Should return the web application HTML
```

## Why This Happens

1. The platform is configured to use real domain names (`sprocket.spr.ocket.cloud`)
2. Traefik routes traffic based on the `Host` header matching these domains
3. Public DNS points these domains to your production server (178.128.133.209)
4. When you access via `localhost:80`, the `Host` header is `localhost`, which doesn't match any Traefik routing rules
5. Adding entries to `/etc/hosts` makes your local machine resolve these domains to 127.0.0.1 instead

## Verification Tools

### Quick Test Script
```bash
./quick-test.sh
```

Shows:
- Traefik connectivity (ports 80 & 443)
- DNS resolution status
- Service health
- Router configuration

### Full Verification Script
```bash
./verify-deployment.sh
```

Comprehensive check including:
- Docker Swarm status
- All service replicas
- Traefik configuration
- Network connectivity
- Service logs
- TLS status

## Current Deployment Status

✅ All services are running correctly
✅ Traefik is configured and routing properly
✅ The web service is listening on port 3000
✅ Traefik routers are properly configured
⚠️  DNS resolves to production server (needs /etc/hosts override)

## Alternative: Using Port Forwarding

If you can't modify /etc/hosts, you can access services via port forwarding, but you'll need to reconfigure Traefik to listen without host matching. This is not recommended for development.

## Troubleshooting

### Issue: Still getting 404

Check that /etc/hosts entry was added correctly:
```bash
getent hosts sprocket.spr.ocket.cloud
# Should return: 127.0.0.1 sprocket.spr.ocket.cloud
```

### Issue: Connection refused

Check that services are running:
```bash
docker service ls
docker ps | grep sprocket-web
```

### Issue: Certificate error in browser

This is expected for local development. The self-signed certificate is safe to accept for your local machine.

### View Traefik Dashboard

The dashboard shows all configured routes:
```bash
# Forward port 8080 from Traefik container
TRAEFIK_CONTAINER=$(docker ps -q -f name=traefik)
docker exec $TRAEFIK_CONTAINER wget -q -O- http://localhost:8080/api/http/routers | python3 -m json.tool
```

## Additional Resources

- Check service logs: `docker service logs <service-name>`
- View Traefik logs: `docker service logs traefik-d3127fd`
- Restart a service: `docker service update --force <service-name>`
