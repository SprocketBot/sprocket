# Sprocket Infrastructure - Context Summary

This document summarizes the current state of the Sprocket infrastructure deployment on the production node, to be referenced when continuing documentation work on a different machine.

## Current Deployment State

**Status**: ✅ **PRODUCTION DEPLOYMENT COMPLETE AND RUNNING**

- **Date Completed**: November 8, 2025 (commit a2862ea)
- **Deployment Location**: Digital Ocean production node
- **Primary Domain**: sprocket.mlesports.gg
- **Infrastructure**: Docker Swarm with 3-layer architecture

## Architecture Overview

### Three-Layer Deployment Structure

1. **Layer 1 (Core Infrastructure)** - `layer_1/`
   - Traefik (reverse proxy/ingress with Let's Encrypt)
   - Vault (secrets management with S3 backend on Digital Ocean Spaces)
   - Socket Proxy (secure Docker API access)
   - Base networking

2. **Layer 2 (Data Services)** - `layer_2/`
   - ~~PostgreSQL~~ **REMOVED - Now hosted on Digital Ocean Managed Database**
   - Redis
   - RabbitMQ
   - InfluxDB
   - Grafana
   - N8n (workflow automation)
   - Neo4j (graph database)
   - Gatus (monitoring)
   - Loki (log aggregation)
   - Telegraf (metrics collection)

3. **Platform (Application Services)** - `platform/`
   - Sprocket web application
   - Sprocket API
   - Image generation service
   - Discord bot
   - Legacy bot
   - All microservices

## Key Infrastructure Decisions

### 1. Database Migration to Digital Ocean Managed PostgreSQL
**Critical Decision**: Removed PostgreSQL from Pulumi-managed infrastructure

- **Why**: Better reliability, automated backups, managed maintenance
- **Impact**: PostgreSQL is now an external dependency, not managed by Pulumi
- **Connection**: All services connect to `sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com:25060`

### 2. Vault Backend: Digital Ocean Spaces (S3-compatible)
- Vault data persists to Digital Ocean Spaces instead of local storage
- Bucket: `vault-secrets`
- Endpoint: `https://nyc3.digitaloceanspaces.com`

### 3. MinIO → AWS S3 Migration
- Originally used MinIO (self-hosted S3)
- Migrated to AWS S3 for better reliability
- Commit: 3b45f27 (October 8, 2025)

## Critical External Dependencies

### 1. Doppler (Secrets Management)
**IMPORTANT**: Most secrets and configuration values are stored in Doppler, NOT in Pulumi config.

- Doppler project contains all sensitive credentials
- OAuth secrets (Google, Discord, Epic, Steam)
- API tokens (Ballchasing, etc.)
- SMTP credentials
- Database passwords
- Application secrets

**Without Doppler access, deployment cannot be completed.**

### 2. GitHub Organization
**Required for**: Vault access control and authentication

- GitHub teams determine Vault policies
- GitHub OAuth used for Vault authentication
- Affects who can access secrets and infrastructure

### 3. Digital Ocean Resources
- **Managed PostgreSQL Database**: Primary data store
- **Spaces (S3)**: Vault backend + application storage
- **Droplet/Node**: Production deployment target

### 4. DNS Configuration
- Domain: `spr.ocket.cloud` or `sprocket.mlesports.gg`
- DNS records must point to production node IP
- Required for Let's Encrypt certificate provisioning

## Deployment Journey Timeline

### Phase 1: Initial Setup (Sept 14-19, 2025)
- Started with basic Pulumi infrastructure
- Layer 1 configuration and Vault setup
- **Major Challenge**: Vault bootstrapping and unsealing
- Multiple iterations to get repeatable Vault initialization

### Phase 2: Vault Struggles (Sept 19-23, 2025)
- Vault unsealing automation
- Secret provisioning from Doppler
- Integration with services
- **Key Commits**:
  - `5057afc`: Vault actually unseals!
  - `2103358`: All tokens working now

### Phase 3: Storage Migration (Sept 30 - Oct 8, 2025)
- MinIO → Cloud S3 migration (commit 3f32a74)
- S3-compatible storage configuration
- Final MinIO removal (commit 3b45f27)

### Phase 4: Database Externalization (Nov 1-3, 2025)
- **Critical Change**: Removed PostgreSQL from Pulumi management
- Migrated to Digital Ocean Managed Database
- Updated all service configurations to use managed DB

### Phase 5: Routing and Networking (Oct 26-27, 2025)
- Localhost-based routing for development
- IP-based routing for LAN/Tailscale access
- Host-based routing for production
- **Commit 7486e02**: Major documentation of routing strategies

### Phase 6: Production Deployment (Nov 4-8, 2025)
- Cloud deployment with real DNS
- Let's Encrypt certificate provisioning
- Service health verification
- **Final Commit a2862ea**: "Sprocket v1 is finally up and running completely"

## Key Configuration Files

### Pulumi Stack Configurations

**Layer 1** (`layer_1/Pulumi.layer_1.yaml`):
```yaml
hostname: sprocket.mlesports.gg
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
postgres-port: "25060"
vault-s3-endpoint: https://nyc3.digitaloceanspaces.com
vault-s3-bucket: vault-secrets
```

**Layer 2** (`layer_2/Pulumi.layer_2.yaml`):
```yaml
hostname: sprocket.mlesports.gg
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
s3-endpoint: nyc3.digitaloceanspaces.com
```

**Platform** (`platform/Pulumi.prod.yaml`):
```yaml
hostname: sprocket.mlesports.gg
subdomain: "main"
image-tag: main
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
server-ip: 192.168.4.39  # LAN access
tailscale-ip: 100.110.185.84  # Tailscale access
```

## Project Structure

```
sprocket-infra/
├── global/                    # Shared code and service definitions
│   ├── providers/            # Custom Pulumi providers
│   ├── services/             # Service component definitions
│   ├── helpers/              # Utility functions
│   └── refs/                 # Cross-stack references
├── layer_1/                  # Core infrastructure
├── layer_2/                  # Data services
├── platform/                 # Application services
├── scripts/                  # Bootstrap and helper scripts
│   └── vault-secrets/        # Vault secret initialization
├── README.md                 # Basic setup instructions
├── CLOUD_DEPLOYMENT.md       # Cloud deployment guide
├── LOCAL_ACCESS.md           # Local development guide
├── verify-deployment.sh      # Comprehensive verification script
└── quick-test.sh            # Quick health check script
```

## Major Services

### Infrastructure Services (Layer 1)
- **Traefik**: HTTPS routing, Let's Encrypt certificates, reverse proxy
- **Vault**: Secrets management with GitHub auth
- **Socket Proxy**: Secure Docker socket access for Traefik

### Data Services (Layer 2)
- **Redis**: Caching and pub/sub
- **RabbitMQ**: Message queue
- **InfluxDB**: Time-series metrics
- **Grafana**: Metrics visualization
- **Neo4j**: Graph database for relationships
- **N8n**: Workflow automation
- **Gatus**: Service monitoring
- **Loki**: Log aggregation
- **Telegraf**: Metrics collection

### Application Services (Platform)
- **Sprocket Web**: Main web UI (Next.js)
- **Sprocket API**: Backend API
- **Image Generation**: Image creation service
- **Discord Bot**: Main Discord integration
- **Legacy Bot**: Backward compatibility bot
- **Chatwoot**: Customer support chat

## Current Deployment Method

1. **Prerequisites**: Doppler access, GitHub org membership, Pulumi backend access
2. **Deploy Layer 1**: `cd layer_1 && pulumi up`
3. **Initialize Vault Secrets**: `cd scripts && ./bootstrap-vault-secrets.sh`
4. **Deploy Layer 2**: `cd layer_2 && pulumi up`
5. **Deploy Platform**: `cd platform && pulumi up`

## Known Issues and Gotchas

1. **Vault Unsealing**: Vault must be unsealed after deployment using stored unseal keys
2. **DNS Propagation**: Let's Encrypt certificate provisioning requires DNS to be correct first
3. **Service Discovery**: Traefik takes 30-60 seconds to discover new services
4. **Doppler Dependency**: Cannot deploy without Doppler secrets access
5. **Database Connection**: All services need managed PostgreSQL credentials
6. **Node Version**: Requires Node.js 16 for some Pulumi operations

## What's Working

✅ All services running on production node
✅ HTTPS with Let's Encrypt certificates
✅ Vault secrets management
✅ Database connections to managed PostgreSQL
✅ Service mesh and networking
✅ Monitoring and logging infrastructure
✅ Application services serving users

## Documentation Gaps (To Be Filled)

The following documentation needs to be created:

1. **Postmortem Documentation**
   - Detailed deployment journey
   - Technical challenges and solutions
   - Lessons learned

2. **Architecture Documentation**
   - Detailed architecture diagrams
   - Service dependency graphs
   - Network topology
   - Security architecture

3. **Deployment Guide**
   - Step-by-step with expected outputs
   - Troubleshooting for each step
   - Configuration reference
   - Verification procedures

4. **Component Documentation**
   - Deep dive on each service
   - Configuration options
   - Integration points
   - Health checks

5. **Operations Runbook**
   - Day 2 operations
   - Backup and restore
   - Scaling procedures
   - Incident response

6. **Troubleshooting Guide**
   - Common issues and solutions
   - Debugging techniques
   - Log locations
   - Recovery procedures

## Next Steps for Documentation

1. Move to workstation with better editing environment
2. Use this context to write comprehensive documentation
3. Organize into MkDocs-ready markdown files
4. Include diagrams and examples
5. Make it detailed enough for someone new to rebuild from scratch

## Notes for Future Maintainers

- This infrastructure has been built iteratively over several months
- Many decisions were made based on trial and error
- The git history is invaluable for understanding "why"
- Always check Doppler for the latest secrets
- The managed PostgreSQL database is the single source of truth for data
- Vault is critical - protect those unseal keys!
