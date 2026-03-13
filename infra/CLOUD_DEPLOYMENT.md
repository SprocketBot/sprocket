# Cloud Deployment Guide

This guide covers deploying the Sprocket platform to a cloud node with proper DNS configuration.

## Prerequisites

- Cloud node with Docker Swarm initialized
- DNS configured to point to your cloud node
- Pulumi CLI installed
- Access to the same Pulumi organization/backend

## DNS Configuration

Before deploying, ensure your DNS is configured. You need these records pointing to your cloud node's IP:

```
sprocket.spr.ocket.cloud        A    <cloud-node-ip>
api.sprocket.spr.ocket.cloud    A    <cloud-node-ip>
vault.spr.ocket.cloud           A    <cloud-node-ip>
traefik.spr.ocket.cloud         A    <cloud-node-ip>
```

Or use a wildcard record:
```
*.spr.ocket.cloud               A    <cloud-node-ip>
```

## Firewall Configuration

Ensure these ports are open on your cloud node:

- **80** (HTTP) - Required for Let's Encrypt certificate validation and HTTP traffic
- **443** (HTTPS) - Required for HTTPS traffic
- **2377** (TCP) - Docker Swarm management (if multi-node)
- **7946** (TCP/UDP) - Docker Swarm container network discovery (if multi-node)
- **4789** (UDP) - Docker Swarm overlay network traffic (if multi-node)

## Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd sprocket-infra
   ```

2. **Login to Pulumi:**
   ```bash
   pulumi login
   ```

3. **Verify Docker Swarm is initialized:**
   ```bash
   docker info | grep Swarm
   # Should show "Swarm: active"
   ```

   If not initialized:
   ```bash
   docker swarm init
   ```

## Configuration

### Layer 1 Configuration

```bash
cd layer_1
pulumi stack select prod  # or your stack name
pulumi config set hostname spr.ocket.cloud
```

Remove any local-only configuration if present:
```bash
pulumi config rm server-ip
pulumi config rm tailscale-ip
```

### Platform Configuration

```bash
cd ../platform
pulumi stack select prod
pulumi config set hostname spr.ocket.cloud
pulumi config set subdomain sprocket
```

Remove any local-only configuration if present:
```bash
pulumi config rm server-ip
pulumi config rm tailscale-ip
```

### Layer 2 Configuration

```bash
cd ../layer_2
pulumi stack select prod
# Verify configuration (no hostname needed for layer_2)
```

## Deployment Order

Deploy in this specific order:

### 1. Deploy Layer 1 (Core Infrastructure)

```bash
cd layer_1
pulumi up
```

This deploys:
- Traefik (reverse proxy/ingress)
- Vault (secrets management)
- Socket proxy (secure Docker API access)
- Base networking

**Expected duration:** 2-5 minutes

### 2. Deploy Layer 2 (Data Layer)

```bash
cd ../layer_2
pulumi up
```

This deploys:
- PostgreSQL databases
- Redis
- RabbitMQ
- InfluxDB
- Grafana
- Other data services

**Expected duration:** 3-7 minutes

### 3. Deploy Platform (Application Services)

```bash
cd ../platform
pulumi up
```

This deploys:
- Sprocket web application
- Sprocket API
- Image generation service
- Discord bot
- All microservices

**Expected duration:** 5-10 minutes

## Verification

After deployment completes, verify the services are accessible:

### Check Traefik Dashboard
```bash
# Should return HTTP 200
curl -I https://traefik.spr.ocket.cloud
```

### Check Vault
```bash
# Should return HTTP 200
curl -I https://vault.spr.ocket.cloud
```

### Check Sprocket Web App
```bash
# Should return HTTP 302 (redirect to login)
curl -I https://sprocket.spr.ocket.cloud
```

### Check Sprocket API
```bash
# Should return HTTP response (may be 502 if services still starting)
curl -I https://api.sprocket.spr.ocket.cloud
```

## TLS Certificates

Let's Encrypt will automatically provision TLS certificates for your services. This process:

- Happens automatically on first request to each service
- May take 30-60 seconds per domain
- Certificates are stored in Traefik's persistent volume
- Auto-renews before expiration

You may see temporary certificate errors during initial provisioning - this is normal.

## Troubleshooting

### Services showing 404

**Cause:** Traefik hasn't discovered the services yet.

**Solution:** Wait 30-60 seconds for service discovery, or restart Traefik:
```bash
docker service update --force traefik-<hash>
```

### Certificate errors

**Cause:** Let's Encrypt is still provisioning certificates.

**Solution:** Wait 1-2 minutes and refresh. Check Traefik logs:
```bash
docker service logs traefik-<hash> | grep -i acme
```

### Services won't start

**Cause:** Resource constraints or dependency issues.

**Solution:** Check service logs:
```bash
# List all services
docker service ls

# Check specific service logs
docker service logs <service-name>
```

### Rate limiting errors from Let's Encrypt

**Cause:** Too many certificate requests (happens during testing).

**Solution:** Let's Encrypt has rate limits. Wait 1 hour or use the staging environment temporarily:
```bash
# In layer_1 Traefik configuration, switch to staging CA
# This requires modifying the Traefik.ts file
```

## Post-Deployment

### Access the Application

Once deployed, access Sprocket at:
- **Web UI:** https://sprocket.spr.ocket.cloud
- **API:** https://api.sprocket.spr.ocket.cloud
- **Traefik Dashboard:** https://traefik.spr.ocket.cloud
- **Vault:** https://vault.spr.ocket.cloud

### Monitor Services

```bash
# Check all services status
docker service ls

# View service details
docker service ps <service-name>

# View logs
docker service logs <service-name> --tail 100 -f
```

## Differences from Local Deployment

The cloud deployment differs from local development in these ways:

### ✅ Cloud Deployment (Production)
- Uses real DNS (spr.ocket.cloud)
- Real TLS certificates from Let's Encrypt
- Host-based routing (e.g., `Host(\`sprocket.spr.ocket.cloud\`)`)
- No IP-based routing hacks
- Accessible from anywhere via domain name

### 🏠 Local Deployment (Development)
- Uses `.localhost` domains
- Self-signed/no certificates
- IP-based routing for remote access
- Only accessible from local network/Tailscale
- Requires `/etc/hosts` modifications for remote access

## Maintenance

### Updating Services

To update a service:
```bash
cd <layer-directory>
# Make changes to code/configuration
pulumi up
```

### Viewing Current Configuration

```bash
cd <layer-directory>
pulumi config
pulumi stack output
```

### Backing Up

Important items to backup:
- Pulumi state (automatically backed up if using Pulumi Cloud)
- Vault data (persistent volume)
- PostgreSQL data (persistent volume)
- Traefik certificates (persistent volume)

## Security Considerations

1. **Secrets Management:** All secrets should be stored in Vault, not in Pulumi config
2. **Firewall:** Only expose ports 80 and 443 to the public internet
3. **Updates:** Regularly update Docker images and services
4. **Monitoring:** Set up monitoring and alerting for production deployments
5. **Backups:** Implement regular backup strategy for persistent data

## Additional Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
