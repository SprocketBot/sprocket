# Sprocket Infrastructure Architecture

**Version**: 1.1
**Last Updated**: December 4, 2025
**Status**: Production

---

## Executive Summary

**For Decision Makers & Non-Technical Stakeholders**

The Sprocket platform runs on a robust, cost-effective infrastructure designed to support competitive Rocket League esports leagues. This infrastructure serves hundreds of active users with 99.9%+ uptime while keeping costs low.

### At a Glance

| Metric | Value |
|--------|-------|
| **Monthly Cost** | ~$131/month |
| **Current Capacity** | Supports <1,000 concurrent users |
| **Uptime Target** | 99.9% (less than 9 hours downtime per year) |
| **Deployment Model** | Single-node Docker Swarm (can scale to multi-node) |
| **Recovery Time** | ~6 hours to rebuild from scratch |
| **Team Size Supported** | 1-3 engineers can manage effectively |

### Cost Breakdown

| Component | Monthly Cost | Purpose | Can We Optimize? |
|-----------|-------------|---------|------------------|
| **Digital Ocean Droplet** | $96 | Main server (4 vCPUs, 8GB RAM) | ✓ Yes - can right-size based on actual usage |
| **Managed PostgreSQL** | $15 | Production database with auto-backups | ✗ No - critical for reliability |
| **Block Storage Volumes** | $15 | Persistent data storage | ~ Maybe - review volume usage |
| **Spaces (S3 Storage)** | $5 | File storage (images, replays, backups) | ~ Maybe - cleanup old files |
| **Total** | **$131/month** | **$1,572/year** | |

**Cost Optimization Opportunities**:
- Droplet could potentially be reduced to $72/month tier (3 vCPUs, 6GB RAM) if usage analysis shows headroom
- Block storage volumes could be consolidated if some are underutilized
- Estimated potential savings: $15-30/month without impacting performance

### Business Value

**What This Infrastructure Provides**:
1. **Reliability**: Automatic restarts if services crash, daily database backups
2. **Security**: All traffic encrypted (HTTPS), secrets stored securely in Vault
3. **Scalability**: Can handle traffic growth by adding more servers when needed
4. **Developer Velocity**: Engineers can deploy updates in minutes, not hours
5. **Cost Efficiency**: Managed services save 10-20 hours/month vs. self-managing everything

**Alternative We Avoided**: Running everything ourselves (self-hosted database, self-hosted storage) would save ~$35/month but would require an estimated 10-15 hours/month of additional maintenance work. At even a modest engineering rate, managed services are significantly more cost-effective.

### Risk Assessment

**Current Risks**:

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Single Server Failure** | Complete outage until recovery (~1-6 hours) | Low (hosting provider has 99.99% uptime SLA) | Daily automated backups, documented recovery process |
| **Database Failure** | Data loss if backup fails | Very Low (managed service with auto-backups) | Digital Ocean handles backups, 7-day retention |
| **Cost Overrun** | Budget exceeded if traffic spikes | Low (current usage well below capacity) | Monitoring alerts, can scale down if needed |
| **Key Person Dependency** | Knowledge concentrated in 1-2 people | Medium | This documentation addresses this risk |
| **Vendor Lock-in** | Difficult to move from Digital Ocean | Low (using standard Docker/Pulumi, can migrate) | Infrastructure as Code makes migration feasible |

**Single Points of Failure** (High Priority for Future):
- Single server node (if it fails, everything fails)
- No automated disaster recovery testing
- Certificate renewal depends on Let's Encrypt being available

**Recommended Next Steps** (in priority order):
1. Set up automated monitoring alerts (PagerDuty/similar) - $0-29/month
2. Test disaster recovery procedure quarterly - 4-6 hours/quarter
3. Consider multi-node setup when traffic exceeds 500 concurrent users - 2-3x current infrastructure cost

### Scaling Timeline

| User Load | Infrastructure Needed | Est. Monthly Cost | When to Upgrade |
|-----------|----------------------|-------------------|-----------------|
| <500 concurrent users | **Current setup** (1 node) | $131 | We're here now |
| 500-1,500 concurrent | Add 1-2 worker nodes | $250-350 | When CPU consistently >70% |
| 1,500-5,000 concurrent | 3-5 node cluster + load balancer | $500-800 | Traffic growth requires it |
| 5,000+ concurrent | Multi-region, auto-scaling | $1,000+ | Significant growth phase |

**Current Status**: Infrastructure has significant headroom. Single-node setup can handle 2-3x current traffic without issues.

### For Technical Readers

The rest of this document provides detailed technical information about:
- Three-layer architecture design and rationale
- Network topology and security model
- Service catalog (22 services across 3 layers)
- Data flows and integration patterns
- Scalability considerations and growth path

**Key Terms Explained**: If you encounter unfamiliar technical terms, see [GLOSSARY.md](./GLOSSARY.md) for plain-language definitions.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture 101: Core Concepts](#architecture-101-core-concepts)
3. [Architecture Principles](#architecture-principles)
4. [Three-Layer Architecture](#three-layer-architecture)
5. [Network Topology](#network-topology)
6. [Service Catalog](#service-catalog)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)

---

## Overview

### What You're Looking At

**If you're new to this documentation**, here's the essential context:

**Sprocket is NOT a game** - it's a **web platform** (think: website + Discord bot) for managing competitive Rocket League esports leagues. Players play Rocket League (the video game by Psyonix), but they use Sprocket to:
- Register and create teams
- Schedule and track matches
- Submit match results and replay files
- View statistics and leaderboards
- Communicate via Discord integration

**This document describes the infrastructure** (servers, databases, networks) that **runs the Sprocket platform** - NOT the Rocket League game itself. Think of it like documentation for the servers running ESPN.com, not the sports being covered.

**Key Distinction**:
- **Rocket League** = The video game (made by Psyonix, runs on players' computers/consoles)
- **Sprocket** = The league management platform (made by us, runs on our servers, documented here)

### Infrastructure Overview

The Sprocket platform infrastructure is built on a **three-layer architecture** deployed using Docker Swarm and managed via Pulumi (Infrastructure as Code). The architecture prioritizes:

- **Separation of Concerns**: Clear boundaries between infrastructure, data, and applications
- **Managed Services**: Critical components (database, storage) use managed cloud services
- **Automation**: Repeatable deployments with minimal manual intervention
- **Security**: Secrets management via Vault, TLS everywhere
- **Observability**: Comprehensive monitoring and logging

### High-Level Architecture

![System Architecture](./system-architecture.png)

The diagram above shows the overall Sprocket system architecture with four main layers:
- **Users & Clients**: Web browsers (Next.js app), Discord bot interface, and mobile devices
- **Core Services**: Sprocket Web (Next.js), Sprocket API (NestJS/GraphQL), and Discord Bot
- **Microservices**: Specialized background services (image generation, matchmaking, analytics, ELO, replay parsing, notifications)
- **Data Layer**: PostgreSQL database, Redis cache, and S3 storage for files

All services communicate through the API layer, with microservices using RabbitMQ message queue for asynchronous processing.

For a text-based representation, see below:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC INTERNET                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         │ HTTP (80) - Redirects to HTTPS
                         │
                    ┌────▼────┐
                    │ Traefik │  Layer 1: Infrastructure
                    │ (Proxy) │  Reverse proxy, TLS termination,
                    └────┬────┘  Let's Encrypt automation
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │  Vault  │      │Platform │     │  Layer  │
   │(Secrets)│      │Services │     │   2     │
   └────┬────┘      └────┬────┘     │Services │
        │                │           └────┬────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼────┐          ┌─────▼─────┐
         │ Digital │          │  Digital  │
         │ Ocean   │          │  Ocean    │
         │Postgres │          │  Spaces   │
         │         │          │  (S3)     │
         └─────────┘          └───────────┘
```

---

## Architecture 101: Core Concepts

**For Junior Engineers and Those New to Container Infrastructure**

Before diving into our specific architecture, let's establish some foundational concepts. If you're already familiar with Docker, Pulumi, and Infrastructure as Code, feel free to skip to [Architecture Principles](#architecture-principles).

### What is Docker?

**Simple Explanation**: Docker is like a shipping container for software. Just like physical shipping containers make it easy to move goods from ships to trucks to trains, Docker containers make it easy to move applications from your laptop to test servers to production.

**Key Concepts**:
- **Container**: A running instance of your application with everything it needs (code, dependencies, configuration)
- **Image**: The template for creating containers (like a blueprint)
- **Why containers?**: "It works on my machine" becomes "it works everywhere" because the container is the same environment everywhere

**Real Example**: Our Sprocket Web service uses the image `asaxplayinghorse/sprocket-web:main`. When we run this image, it becomes a container serving the website on port 3000.

### What is Docker Swarm?

**Simple Explanation**: Docker Swarm turns multiple servers into a cluster that Docker manages as one unit. Think of it like managing a team instead of individual people - you say "I need 3 people working on this task" and the manager (Swarm) assigns them.

**Key Features**:
- **Service**: A definition of what to run ("run 3 copies of the web app")
- **Replica**: Each copy/instance
- **Orchestration**: Swarm automatically restarts failed containers, distributes them across servers, and handles updates

**Our Setup**: Currently 1 server (node), but Swarm allows us to add more servers later without changing our application code.

### What is Infrastructure as Code (IaC)?

**Simple Explanation**: Instead of clicking through web interfaces to create servers, databases, and networks, you write code that describes what you want. The IaC tool reads your code and creates/updates everything automatically.

**Why This Matters**:
```
Without IaC:
"To recreate production, first log into Digital Ocean, click..."
(50 steps later...)
"...and hope you didn't miss anything"

With IaC:
"To recreate production, run: pulumi up"
Done. Everything exactly as defined in code.
```

**Benefits**:
- **Version Control**: Infrastructure changes are tracked in git like code changes
- **Repeatable**: Deploy the same way every time
- **Self-Documenting**: The code shows exactly what exists
- **Reversible**: Roll back to previous versions easily

### What is Pulumi?

**Simple Explanation**: Pulumi is our IaC tool. We write TypeScript code describing our infrastructure (services, networks, volumes), and Pulumi makes it happen.

**Example**:
```typescript
// This code creates a Redis service
new docker.Service("redis", {
  image: "redis:6-alpine",
  replicas: 1,
  networks: [ingressNetwork.id],
  ports: [{ targetPort: 6379 }]
});
```

Pulumi reads this, compares it to what currently exists, and creates/updates/deletes resources to match.

**Why Pulumi vs. Others?**: We chose Pulumi over alternatives like Terraform because it lets us use a real programming language (TypeScript) instead of a domain-specific language. This means better IDE support, type checking, and ability to use familiar programming patterns.

### What Are Layers?

**Simple Explanation**: We organize our infrastructure into three layers, where each layer depends on the previous one, like floors in a building:

```
┌─────────────────────────────┐
│  Platform (Floor 3)          │ ← Applications (web, API, bot)
│  Depends on: Layer 2, Layer 1│
├─────────────────────────────┤
│  Layer 2 (Floor 2)           │ ← Data services (Redis, databases)
│  Depends on: Layer 1         │
├─────────────────────────────┤
│  Layer 1 (Foundation)        │ ← Core infrastructure (networking, secrets)
│  Depends on: nothing         │
└─────────────────────────────┘
```

**Why Layers?**:
1. **Dependency Management**: Layer 2 can't work without Layer 1, so we deploy Layer 1 first
2. **Independent Updates**: Can update Layer 2 without touching Layer 1
3. **Logical Organization**: Related services grouped together
4. **Easier Troubleshooting**: If something breaks, check the layer it's in and the layer below

**Real Example**: When the web app needs to cache data:
1. Web app (Platform layer) talks to Redis (Layer 2)
2. Redis talks to Vault (Layer 1) to get its password
3. All traffic goes through Traefik (Layer 1) to reach the web app

The layers create clear boundaries: Platform knows about Layer 2 services, but Layer 2 doesn't know about Platform services.

### What Are Networks?

**Simple Explanation**: In Docker Swarm, networks are like virtual LANs. Services on the same network can talk to each other; services on different networks are isolated.

**Key Concept**: Services connect by name, not IP address.
```
# From inside the API container, you can do:
curl http://redis:6379  # "redis" is the service name
```

Docker's DNS automatically resolves "redis" to the right IP.

**Our Networks**:
- **traefik-ingress**: Public-facing services (anything users access via browser)
- **platform-network**: Internal app communication (API ↔ microservices)
- **vault-network**: Secret distribution (most services ↔ Vault)
- **monitoring-network**: Metrics collection (services → InfluxDB/Grafana)
- **socket-proxy**: Highly restricted (only Traefik ↔ Docker API)

**Why Multiple Networks?**: Security and organization. The matchmaking service doesn't need access to Vault's network, so it doesn't get it. If the matchmaking service is compromised, attackers can't reach Vault.

### What is a Reverse Proxy?

**Simple Explanation**: A reverse proxy sits in front of your application servers and forwards requests to them. Users talk to the proxy, the proxy talks to your apps.

```
User Request:
  https://sprocket.mlesports.gg
    ↓
  Traefik (reverse proxy)
    ↓
  Decides where to send it based on URL
    ↓
  Forwards to: Sprocket Web service (port 3000)
    ↓
  Returns response to user
```

**Why Use One?**:
1. **TLS Termination**: Traefik handles HTTPS encryption/decryption. Your apps just deal with plain HTTP.
2. **Routing**: One IP address, many applications. Traefik routes based on domain/path.
3. **Load Balancing**: If you have 3 copies of the web app, Traefik distributes traffic across them.
4. **Let's Encrypt**: Traefik automatically gets and renews TLS certificates.

**Our Reverse Proxy**: Traefik handles ALL incoming HTTP/HTTPS traffic and routes to the appropriate service.

### What is Secrets Management?

**The Problem**: Applications need sensitive information (passwords, API keys, certificates). Where do you store them?

**Bad Solutions** (that we DON'T use):
- ❌ Hard-code in source code → Anyone with code access sees secrets
- ❌ Environment variables in deployment files → Secrets in version control
- ❌ Shared document → No access control, no audit trail

**Our Solution**: Hierarchical secrets management:

```
Doppler (Source of Truth)
  ↓ Manual bootstrap script
Vault (Runtime Distribution)
  ↓ Pulumi reads at deploy time
Docker Secrets (Secure Container Delivery)
  ↓ Mounted as read-only files
Application (Reads from /app/secret/)
```

**Why This Flow?**:
- **Doppler**: Team members can update secrets without touching infrastructure
- **Vault**: Centralized, encrypted, auditable secret distribution
- **Docker Secrets**: Encrypted in transit and at rest, mounted securely
- **Application**: Reads from filesystem, never from environment variables (more secure)

### What Are Managed Services?

**Simple Explanation**: Instead of running your own database server, you pay a cloud provider to run it for you. They handle updates, backups, scaling, monitoring - you just use it.

**Example - PostgreSQL**:

**Self-Hosted** (what we used to do):
```
We manage:
- Installing PostgreSQL in a container
- Configuring backups
- Monitoring disk space
- Handling crashes
- Security patches
- Performance tuning
- Disaster recovery

Cost: ~$0-5/month in storage
Effort: 10-15 hours/month
```

**Managed** (what we do now):
```
Digital Ocean manages:
- Installation and updates
- Daily automated backups
- Monitoring and alerts
- Automatic failover
- Security patches
- Performance optimization
- Point-in-time recovery

Cost: $15/month
Effort: ~0 hours/month
```

**ROI**: Even at minimum wage, 10 hours/month costs more than $15. For skilled engineers, it's a no-brainer.

**Our Managed Services**:
- **PostgreSQL** (Digital Ocean): $15/month - database
- **Spaces/S3** (Digital Ocean/AWS): $5/month - file storage

**Still Self-Hosted**:
- Application services (our custom code)
- Redis, RabbitMQ (standard services we configure)
- Monitoring stack (Grafana, InfluxDB, Loki)

**Why Not Everything Managed?**: Cost vs. complexity trade-off. Managing Redis in a container is easy. Managing a production database is hard. We use managed services where the operational complexity is high.

---

## Architecture Principles

### 1. Infrastructure as Code
**All infrastructure is defined in code using Pulumi (TypeScript).**

**Benefits**:
- Version controlled (git)
- Repeatable deployments
- Easy rollbacks
- Self-documenting infrastructure

**Implementation**:
```
sprocket-infra/
├── layer_1/     # Infrastructure layer (Traefik, Vault)
├── layer_2/     # Data services layer
├── platform/    # Application layer
└── global/      # Shared code and service definitions
```

### 2. Layered Deployment
**Infrastructure is deployed in three distinct layers, each depending on the previous.**

**Layer 1** → **Layer 2** → **Platform**

**Benefits**:
- Clear dependency management
- Independent layer updates
- Easier troubleshooting
- Logical organization

### 3. Managed Services for Critical Components
**Don't self-host what you can buy as a service.**

**Managed**:
- PostgreSQL (Digital Ocean Managed Database)
- S3 Storage (Digital Ocean Spaces + AWS S3)

**Self-Hosted**:
- Application services (our code)
- Observability stack (Grafana, Loki, InfluxDB)
- Message queues and caches (Redis, RabbitMQ)

**Rationale**: Time is valuable. Let professionals manage infrastructure.

### 4. Security by Default
**Security is not optional.**

- All secrets in Vault, never in code
- TLS for all public-facing services
- Minimal exposed ports (80, 443 only)
- Secret rotation capability
- Audit trails (Vault, Doppler)

### 5. Observability First
**If you can't monitor it, you can't trust it.**

- Metrics (InfluxDB, Grafana)
- Logs (Loki, centralized)
- Service health (Gatus)
- Distributed tracing (Telegraf)

---

## Three-Layer Architecture

### Layer 1: Infrastructure Foundation

**Purpose**: Core infrastructure services that everything else depends on.

**Services**:
1. **Traefik** - Reverse proxy and ingress controller
2. **Vault** - Secrets management
3. **Socket Proxy** - Secure Docker API access for Traefik

**Deployment**: `layer_1/`

**Key Characteristics**:
- Must be deployed first
- Provides networking foundation (ingress network)
- Handles TLS termination
- Manages all secrets

**Configuration** (`layer_1/Pulumi.layer_1.yaml`):
```yaml
hostname: sprocket.mlesports.gg
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
postgres-port: "25060"
vault-s3-bucket: vault-secrets
vault-s3-endpoint: https://nyc3.digitaloceanspaces.com
```

**Architecture Diagram**:
```
┌─────────────────────────────────────────────────────────┐
│                       Layer 1                            │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Traefik Service                     │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Entrypoints:                            │   │   │
│  │  │  - web (80) → redirect to websecure      │   │   │
│  │  │  - websecure (443) → TLS termination     │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  Let's Encrypt: Automatic certificate mgmt       │   │
│  │  Routing: Host-based rules                       │   │
│  │  Service Discovery: Docker provider              │   │
│  └───────────────┬───────────────────────────────────┘   │
│                  │                                       │
│                  │ Communicates via                      │
│                  │ Socket Proxy                          │
│                  │                                       │
│  ┌───────────────▼───────────────┐                      │
│  │     Socket Proxy Service      │                      │
│  │  (Secure Docker API Access)   │                      │
│  └───────────────────────────────┘                      │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Vault Service                       │   │
│  │                                                   │   │
│  │  Storage Backend: Digital Ocean Spaces (S3)      │   │
│  │  Auto-Initialize: Yes (via script)               │   │
│  │  Auto-Unseal: Via bind-mounted unseal keys       │   │
│  │  Auth Methods:                                    │   │
│  │  - GitHub OAuth (primary)                        │   │
│  │  - Token (for services)                          │   │
│  │                                                   │   │
│  │  Mount Points:                                    │   │
│  │  - infrastructure/ (infra secrets)               │   │
│  │  - platform/ (app secrets)                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  Networks:                                               │
│  - traefik-ingress (overlay)  ← Exposed to Layer 2/Platform
│  - vault-network (overlay)                               │
│  - socket-proxy (overlay)                                │
└─────────────────────────────────────────────────────────┘
```

**Network Exports**:
- `IngressNetwork`: Used by all public-facing services
- `VaultAddress`: Used by Layer 2 and Platform for secret retrieval

---

### Layer 2: Data Services

**Purpose**: Shared data infrastructure used by multiple applications.

**Services**:
1. **Redis** - Caching and pub/sub
2. **RabbitMQ** - Message queue (AMQP)
3. **InfluxDB** - Time-series metrics database
4. **Grafana** - Metrics visualization
5. **N8n** - Workflow automation
6. **Neo4j** - Graph database
7. **Gatus** - Service health monitoring
8. **Loki** - Log aggregation
9. **Telegraf** - Metrics collection

**Deployment**: `layer_2/`

**Key Characteristics**:
- Depends on Layer 1 (Vault, Ingress network)
- Provides shared infrastructure for Platform
- Each service has dedicated persistent volumes
- Connected to ingress network for web UIs

**Configuration** (`layer_2/Pulumi.layer_2.yaml`):
```yaml
hostname: sprocket.mlesports.gg
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
s3-endpoint: nyc3.digitaloceanspaces.com
```

**Architecture Diagram**:
```
┌─────────────────────────────────────────────────────────────────────┐
│                            Layer 2                                   │
│                                                                       │
│  Data Services (Shared Infrastructure)                               │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │     Redis      │  │   RabbitMQ     │  │    InfluxDB    │        │
│  │                │  │                │  │                │        │
│  │  Port: 6379    │  │  Port: 5672    │  │  Port: 8086    │        │
│  │  Auth: Vault   │  │  AMQP protocol │  │  Org: sprocket │        │
│  │  Persistence:  │  │  Virtual hosts │  │  Bucket: per   │        │
│  │    Volume      │  │  Vault creds   │  │    environment │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │    Grafana     │  │      N8n       │  │     Neo4j      │        │
│  │                │  │                │  │                │        │
│  │  Dashboards    │  │  Workflows     │  │  Graph DB      │        │
│  │  Metrics viz   │  │  Automation    │  │  Bolt: 7687    │        │
│  │  Data sources: │  │  External DB   │  │  HTTP: 7474    │        │
│  │  - InfluxDB    │  │  S3 storage    │  │                │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │     Gatus      │  │      Loki      │  │   Telegraf     │        │
│  │                │  │                │  │                │        │
│  │  Health checks │  │  Log storage   │  │  Metrics       │        │
│  │  Uptime mon.   │  │  Aggregation   │  │  collection    │        │
│  │  Alerting      │  │  Querying      │  │  → InfluxDB    │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  Networks:                                                           │
│  - traefik-ingress (from Layer 1)                                   │
│  - monitoring-network (overlay)  ← Exported to Platform             │
│  - chatwoot-network (overlay)                                       │
│                                                                       │
│  Secrets:                                                            │
│  All services retrieve credentials from Vault                        │
│                                                                       │
│  Exports:                                                            │
│  - InfrastructureVaultToken (for Platform)                          │
│  - PlatformVaultToken (for Platform)                                │
│  - PostgresHostname, PostgresPort                                   │
│  - MonitoringNetworkId                                               │
│  - MinioUrl (S3 endpoint)                                            │
└─────────────────────────────────────────────────────────────────────┘
```

**Network Exports**:
- `MonitoringNetworkId`: For services that need to push metrics
- `InfrastructureVaultToken`: For infrastructure-level secret access
- `PlatformVaultToken`: For application-level secret access

---

### Platform: Application Services

**Purpose**: The Sprocket application itself and its microservices.

**Core Services**:
1. **Sprocket Web** - Next.js web UI
2. **Sprocket API** - GraphQL API (NestJS)
3. **Discord Bot** - Main Discord integration

**Client Services**:
4. **Image Generation Frontend** - Image generation UI

**Microservices**:
5. **Image Generation Service** - Image creation backend
6. **Notification Service** - User notifications
7. **Analytics Service** - Server analytics
8. **Matchmaking Service** - Game matchmaking
9. **Replay Parse Service** - Rocket League replay parsing
10. **ELO Service** - Player rating calculations
11. **Submission Service** - Match submissions

**Legacy**:
12. **Legacy Bot** - Backward compatibility

**Deployment**: `platform/`

**Key Characteristics**:
- Depends on Layer 1 and Layer 2
- All services share configuration structure
- Services communicate via RabbitMQ
- All data in managed PostgreSQL
- All files in cloud S3

**Configuration** (`platform/Pulumi.prod.yaml`):
```yaml
hostname: sprocket.mlesports.gg
subdomain: "main"
image-tag: main
postgres-host: sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com
```

**Architecture Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Platform Layer                                  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        Core Services                                   │ │
│  │                                                                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │ │
│  │  │  Sprocket Web    │  │  Sprocket API    │  │  Discord Bot      │   │ │
│  │  │  (Next.js)       │  │  (NestJS/GraphQL)│  │                   │   │ │
│  │  │                  │  │                  │  │  Listens to       │   │ │
│  │  │  Port: 3000      │  │  Port: 3001      │  │  Discord events   │   │ │
│  │  │  Route:          │  │  Route:          │  │  Sends commands   │   │ │
│  │  │  sprocket.mles*  │  │  api.sprocket*   │  │  Uses RabbitMQ    │   │ │
│  │  │                  │  │                  │  │                   │   │ │
│  │  │  Auth: OAuth     │  │  Auth: JWT       │  │  Bot Token: Vault │   │ │
│  │  │  - Google        │  │  Database: All   │  │                   │   │ │
│  │  │  - Discord       │  │    queries       │  │                   │   │ │
│  │  │  - Epic          │  │  Cache: Redis    │  │                   │   │ │
│  │  │  - Steam         │  │  Queue: RabbitMQ │  │                   │   │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      Microservices                                     │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │ │
│  │  │ Image Gen Svc   │  │ Notification    │  │  Analytics      │      │ │
│  │  │                 │  │  Service        │  │  Service        │      │ │
│  │  │ Creates images  │  │                 │  │                 │      │ │
│  │  │ Stores in S3    │  │ Sends Discord   │  │ Tracks metrics  │      │ │
│  │  │ Queue: RabbitMQ │  │   notifications │  │ Stores: InfluxDB│      │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │ │
│  │  │ Matchmaking     │  │ Replay Parse    │  │  ELO Service    │      │ │
│  │  │  Service        │  │  Service        │  │                 │      │ │
│  │  │                 │  │                 │  │ Calculates      │      │ │
│  │  │ Creates matches │  │ Parses RL       │  │  ratings        │      │ │
│  │  │ Uses Redis      │  │   replays       │  │ Updates on      │      │ │
│  │  │ Queue: RabbitMQ │  │ Ballchasing API │  │  match end      │      │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐                                                   │ │
│  │  │  Submission     │                                                   │ │
│  │  │   Service       │                                                   │ │
│  │  │                 │                                                   │ │
│  │  │ Match submissions│                                                  │ │
│  │  │ S3 storage      │                                                   │ │
│  │  │ Queue: RabbitMQ │                                                   │ │
│  │  └─────────────────┘                                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Service Communication:                                                     │
│  - HTTP/GraphQL: Direct service-to-service                                  │
│  - RabbitMQ: Async messaging between services                              │
│  - Redis: Shared cache and pub/sub                                         │
│                                                                               │
│  Data Storage:                                                              │
│  - PostgreSQL: All relational data                                          │
│  - S3: All file storage (images, replays, backups)                          │
│  - Redis: Cache and sessions                                                │
│  - InfluxDB: Time-series metrics                                            │
│  - Neo4j: Graph data (relationships)                                        │
│                                                                               │
│  Networks:                                                                  │
│  - traefik-ingress (from Layer 1)                                          │
│  - platform-network (overlay, internal)                                    │
│  - monitoring-network (from Layer 2)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Network Topology

### Docker Swarm Overlay Networks

```
┌────────────────────────────────────────────────────────────────────┐
│                       Network Topology                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  traefik-ingress (overlay network)                          │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - Traefik (Layer 1)                                         │  │
│  │  - All public-facing services (Layer 2 & Platform)          │  │
│  │  - Vault (for web UI access)                                 │  │
│  │                                                               │  │
│  │  Purpose: All HTTP/HTTPS traffic flows through this network │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  vault-network (overlay network)                            │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - Vault                                                      │  │
│  │  - Services that need Vault access (most services)          │  │
│  │                                                               │  │
│  │  Purpose: Secret retrieval                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  socket-proxy (overlay network)                             │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - Traefik                                                    │  │
│  │  - Socket Proxy                                              │  │
│  │                                                               │  │
│  │  Purpose: Secure Docker API access for service discovery    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  platform-network (overlay network)                         │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - All Platform services                                     │  │
│  │  - Redis, RabbitMQ (from Layer 2)                           │  │
│  │                                                               │  │
│  │  Purpose: Internal platform communication                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  monitoring-network (overlay network)                       │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - InfluxDB, Grafana, Loki, Telegraf                        │  │
│  │  - Services that push metrics (Platform services)           │  │
│  │                                                               │  │
│  │  Purpose: Metrics and logging                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  chatwoot-network (overlay network)                         │  │
│  │                                                               │  │
│  │  Connected Services:                                         │  │
│  │  - Chatwoot (if deployed)                                    │  │
│  │  - Redis (shared with Platform)                             │  │
│  │                                                               │  │
│  │  Purpose: Chatwoot service isolation                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Network Isolation Strategy

**Public-Facing** (traefik-ingress):
- All services with web UIs
- All API endpoints
- Traefik routes traffic based on Host header

**Internal** (platform-network):
- Service-to-service communication
- Not exposed externally
- RabbitMQ, Redis connections

**Monitoring** (monitoring-network):
- Metrics and logging infrastructure
- Separated for security and performance

**Socket Access** (socket-proxy):
- Highly restricted
- Only Traefik can access Docker API
- Prevents unauthorized service discovery

---

## Service Catalog

### Layer 1 Services

#### Traefik
**Purpose**: Reverse proxy, ingress controller, TLS termination

**Image**: `traefik:v2.6.1`

**Configuration**:
- Static config: `/layer_1/src/config/traefik/static.yaml`
- Dynamic config: Service labels
- Certificate storage: Persistent volume (`/data`)

**Key Features**:
- Automatic service discovery via Docker provider
- Let's Encrypt integration (HTTP-01 challenge)
- Host-based routing
- TLS termination
- Forward authentication support

**Routing Example**:
```yaml
# Service labels
traefik.enable: "true"
traefik.http.routers.sprocket-web.rule: "Host(`sprocket.mlesports.gg`)"
traefik.http.routers.sprocket-web.entrypoints: "websecure"
traefik.http.routers.sprocket-web.tls.certresolver: "lets-encrypt-tls"
traefik.http.services.sprocket-web.loadbalancer.server.port: "3000"
```

**Exposed Ports**:
- 80 (HTTP) - Redirects to HTTPS
- 443 (HTTPS) - Primary traffic

**Monitoring**:
- Dashboard: https://traefik.sprocket.mlesports.gg
- Metrics: Available via Prometheus endpoint

---

#### Vault
**Purpose**: Secrets management, dynamic credentials, encryption

**Image**: `vault:1.10.0`

**Configuration**:
- Server config: `/layer_1/src/config/vault/vault.hcl`
- Storage backend: S3-compatible (Digital Ocean Spaces)
- Auth methods: GitHub OAuth, Token

**Key Features**:
- Auto-initialization on first run
- Auto-unseal via bind-mounted keys
- S3 backend for state persistence
- KV v2 secrets engine
- Dynamic PostgreSQL credentials
- GitHub team-based access control

**Mount Points**:
```
/infrastructure     - Infrastructure secrets (DB creds, S3 keys)
/platform          - Application secrets (OAuth, API tokens)
```

**Initialization Script**: `/global/services/vault/scripts/auto-initialize.sh`

**Access**:
- Web UI: https://vault.sprocket.mlesports.gg
- API: https://vault.sprocket.mlesports.gg/v1/

**Unseal Keys**: Stored in `/global/services/vault/unseal-tokens/`

---

#### Socket Proxy
**Purpose**: Secure Docker API access for Traefik

**Image**: `tecnativa/docker-socket-proxy`

**Configuration**:
- Read-only Docker socket access
- Filtered API endpoints
- Only allows service discovery

**Security**:
- No write access to Docker API
- Only Traefik can connect
- Separate network (socket-proxy)

---

### Layer 2 Services

#### Redis
**Purpose**: Caching, session storage, pub/sub messaging

**Why We Use Redis**:

Without Redis, every user request would hit the PostgreSQL database directly. This creates problems:
- **Slow response times**: Database queries take 10-50ms. Redis queries take <1ms.
- **Database overload**: 100 users making requests = 100+ database queries per second
- **Scaling bottleneck**: Database becomes the constraint for all traffic

**With Redis**:
```
User requests player profile:
1. Check Redis cache → Found! (1ms) → Return data

User requests again:
2. Check Redis cache → Found! (1ms) → Return data
   (Database wasn't even queried!)

Cache expires after 5 minutes:
3. Check Redis → Miss → Query database (20ms) → Cache result → Return data
4. Next 1000 requests served from cache in 1ms each
```

**Real Impact**: Redis reduces database load by 80-90% and improves response times from 50ms to 1ms for cached data.

**Image**: `redis:6-alpine`

**Configuration**:
- Config file: `/layer_2/src/config/redis/redis.conf`
- Password: Retrieved from Vault
- Persistence: RDB + AOF (survives restarts)

**Used By**:
- All Platform services (caching frequently-accessed data)
- Matchmaking service (queue state management)
- ELO service (leaderboards and rankings)
- API (session storage for logged-in users)

**Port**: 6379

---

#### RabbitMQ
**Purpose**: Message queue for async service communication

**Why We Use RabbitMQ**:

Problem without message queues:
```
User submits match → API needs to:
1. Save to database
2. Send Discord notification
3. Update player stats
4. Recalculate ELO
5. Update leaderboards
6. Generate match image

Total time: 5-10 seconds (user waits!)
If notification service is down: entire request fails
```

**With RabbitMQ**:
```
User submits match:
1. API saves to database (50ms)
2. API publishes message to RabbitMQ (5ms)
3. API responds to user: "Match saved!" (55ms total)

In background (asynchronous):
- Notification service reads queue → sends Discord message
- Analytics service reads queue → updates stats
- ELO service reads queue → recalculates ratings
- Image service reads queue → generates image

User sees instant response.
Services process independently.
If one service is down, others continue working.
Failed tasks can retry automatically.
```

**Real Impact**: API response time reduced from 5-10 seconds to 50-100ms. Services can fail and retry independently without affecting user experience.

**Image**: `rabbitmq:3-management-alpine`

**Configuration**:
- Credentials: Generated and stored in Vault
- Virtual hosts: Per environment
- Management UI: Enabled

**Used By**:
- All microservices (task queues)
- Core API (event publishing)
- Discord bot (command processing)

**Queues**:
```
{environment}-core          - Core API tasks
{environment}-bot           - Discord bot tasks
{environment}-matchmaking   - Matchmaking tasks
{environment}-analytics     - Analytics tasks
{environment}-events        - Event streaming
{environment}-ig            - Image generation tasks
{environment}-submissions   - Match submissions
{environment}-notifications - User notifications
```

**Ports**:
- 5672 (AMQP)
- 15672 (Management UI)

---

#### InfluxDB
**Purpose**: Time-series metrics storage

**Why We Use InfluxDB**:

Regular databases like PostgreSQL are designed for transactional data (users, matches, teams). But tracking metrics over time creates problems:

```
Storing 1 metric per second in PostgreSQL:
- 60 metrics/minute
- 3,600 metrics/hour
- 86,400 metrics/day
- 31,536,000 metrics/year per metric type

With 50 different metrics = 1.5 BILLION rows per year!

Queries like "Show me CPU usage over the last 24 hours" require:
- Scanning millions of rows
- Complex aggregations
- Slow (5-30 seconds)
- Database locks and performance issues
```

**With InfluxDB** (purpose-built for time-series data):
```
Same 50 metrics at 1/second:
- Optimized storage format (compressed by 10-100x)
- Built-in time-based aggregation
- Query "last 24 hours" returns in <100ms
- Automatic downsampling (1-second → 1-minute after 7 days)
- Automatic retention (deletes old data)
```

**Real Impact**:
- Storage: 10GB vs. 100GB+ for same data
- Query speed: 100ms vs. 5-30 seconds
- Can track hundreds of metrics without performance degradation

**What We Track**:
- Player activity (logins, match participation)
- Match statistics (completion rates, duration)
- API response times
- Error rates
- Custom business metrics

**Image**: `influxdb:2.7`

**Configuration**:
- Organization: `sprocket`
- Bucket: `sprocket_{environment}`
- Token: Stored in Vault

**Used By**:
- Analytics service (writes metrics)
- Grafana (reads for visualization)
- Telegraf (collects system metrics)

**Port**: 8086

**Retention**: 30 days (configurable)

---

#### Grafana (Unified Observability Interface)
**Purpose**: Unified metrics visualization, log querying, and observability dashboards

**Why We Use Grafana**:

Grafana serves as our **single pane of glass** for observability, consolidating metrics and logs:

**Without Unified Interface**:
```
Investigating an incident:
1. Query InfluxDB for metrics → See error spike at 3pm
2. SSH into server → grep logs for errors
3. Manually correlate timestamps between metrics and logs
4. Switch between tools (CLI, metrics UI, log files)
→ Time: 20-30 minutes to correlate data
```

**With Grafana Unified Interface**:
```
Open Grafana:
→ Dashboard shows error spike at 3pm
→ Click time range on graph
→ Switch to Explore → Query logs: {service="prod-sprocket-core"} |= "ERROR"
→ Logs show: "Database connection pool exhausted"
→ Click related metrics → See DB connections maxed out
→ Time: 2-3 minutes, no SSH needed
```

**Real Impact**:
- **10-20x faster** issue identification
- **No SSH required** for log analysis (query via Grafana UI)
- **Correlation built-in**: Metrics and logs time-synced in one view
- **Team collaboration**: Share live dashboards vs. pasting log snippets
- **Historical analysis**: What happened during last deployment?
- **Proactive alerts**: Email/Slack when error rate > threshold

**Unified Features**:
- **Metrics Dashboards**: Real-time visualization (InfluxDB/Telegraf data)
- **Log Querying**: LogQL queries against Loki (no SSH to server)
- **Time Correlation**: Sync time ranges between metrics and logs
- **Split View**: Compare metrics and logs side-by-side
- **Alerting**: Unified alerts for metrics or log patterns

**Our Dashboards**:
- System health (CPU, memory, disk, network)
- Service metrics (response times, error rates, request rates)
- Business metrics (active players, matches created, completion rates)
- Database performance (query times, connection pool usage)
- Log explorer (centralized log search across all services)

**Common Workflows**:
```bash
# 1. Metrics-First Investigation
Dashboard → See CPU spike → Explore logs for that time → Find cause

# 2. Logs-First Investigation
Explore → Query logs for errors → See timestamp → Check metrics dashboard

# 3. Correlation
Split view → Metrics on left → Logs on right → Synchronized time range
```

**Image**: `grafana/grafana:latest`

**Data Sources**:
- **InfluxDB**: System and application metrics
- **Loki**: Centralized logs from all Docker services
- **PostgreSQL**: Direct database queries (optional)

**Access**: https://grafana.sprocket.mlesports.gg

**Authentication**: admin / <password from Vault>

**How to Use**:
1. **Dashboards** → Pre-built metric visualizations
2. **Explore** → Ad-hoc log queries (LogQL) or metric queries
3. **Alerts** → Configure notifications based on thresholds
4. **Correlate** → Click metric spike → View logs for same time

---

#### N8n
**Purpose**: Workflow automation

**Image**: `n8nio/n8n:latest`

**Configuration**:
- Database: Managed PostgreSQL
- Storage: S3 for file uploads

**Use Cases**:
- Automated data exports
- Integration workflows
- Scheduled tasks

**Access**: https://n8n.sprocket.mlesports.gg

---

#### Neo4j
**Purpose**: Graph database for relationship data

**Image**: `neo4j:latest`

**Configuration**:
- Bolt protocol: 7687
- HTTP: 7474
- Auth: Username/password in Vault

**Use Cases**:
- Player relationships
- Team hierarchies
- Social graphs

---

#### Gatus
**Purpose**: Service health monitoring and uptime tracking

**Image**: `twinproduction/gatus:latest`

**Configuration**:
- Config file: `/layer_2/src/config/gatus/config.yml`
- Check interval: 30 seconds

**Monitored Services**:
- All public endpoints
- Database connectivity
- External APIs

**Access**: https://gatus.sprocket.mlesports.gg

---

#### Loki
**Purpose**: Log aggregation and querying

**Image**: `grafana/loki:latest`

**Configuration**:
- Storage: Local filesystem (future: S3)
- Retention: 7 days

**Log Sources**:
- Docker log driver (all services)
- Manual pushes from applications

**Access**: Queried via Grafana

---

#### Telegraf
**Purpose**: Metrics collection and forwarding

**Image**: `telegraf:latest`

**Configuration**:
- Inputs: Docker, system, custom
- Output: InfluxDB

**Collected Metrics**:
- CPU, memory, disk, network
- Docker container stats
- Custom application metrics

---

### Platform Services

#### Sprocket Web
**Purpose**: Main web UI for users

**Why Next.js**:

**Framework Options**:
- **Plain React**: Client-side only, slow first load, bad SEO
- **Create React App**: Simple setup, but no server-side rendering
- **Next.js**: Server-side rendering, excellent SEO, fast initial load, image optimization, API routes

**What Next.js Provides**:
1. **Server-Side Rendering (SSR)**: Pages load with content already rendered (not blank until JavaScript loads)
2. **Static Generation**: Build pages at deploy time for instant loads
3. **Image Optimization**: Automatic image resizing/WebP conversion
4. **Code Splitting**: Only load JavaScript needed for current page
5. **Built-in Routing**: No need for React Router

**Impact on User Experience**:
```
Without SSR (plain React):
1. User visits page
2. Browser downloads blank HTML
3. Browser downloads 500KB JavaScript
4. React renders page (1-2 seconds)
5. Page fetches data from API
6. Page shows content (2-4 seconds total)

With Next.js SSR:
1. User visits page
2. Server renders page with data
3. Browser receives complete HTML (300ms)
4. Page is interactive immediately
5. Background JavaScript loads for navigation
(0.5-1 second total)
```

**Image**: `asaxplayinghorse/sprocket-web:{tag}`

**Framework**: Next.js (React)

**Features**:
- User authentication (OAuth)
- Player profiles
- Match browsing
- Team management
- Statistics and leaderboards

**Configuration**:
- Config file: `/platform/src/config/services/web.json`
- Environment: Production
- Port: 3000

**Route**: https://sprocket.mlesports.gg

**Secrets**:
- Chatwoot HMAC key

---

#### Sprocket API
**Purpose**: GraphQL API backend

**Why GraphQL (vs REST)**:

**REST API Problem** (what we used to have):
```
To show a player profile page, we need:
1. GET /api/players/123 → Player info
2. GET /api/players/123/stats → Player stats
3. GET /api/players/123/matches → Recent matches
4. GET /api/players/123/teams → Team memberships

4 HTTP requests = 4 round-trips = 200-400ms
Over-fetching: Each endpoint returns fields we don't need
Under-fetching: Need multiple requests to get complete data
```

**GraphQL Solution** (what we use now):
```graphql
query PlayerProfile($id: ID!) {
  player(id: $id) {
    name
    stats { wins losses winRate }
    recentMatches(limit: 5) { id date opponent score }
    teams { id name role }
  }
}

1 HTTP request = 1 round-trip = 50-100ms
Exact data: Client specifies exactly what fields it needs
Complete: All related data in one request
```

**Why NestJS**:
- **Enterprise Framework**: Structured, opinionated, scales well
- **TypeScript**: Type safety reduces bugs by ~30%
- **Dependency Injection**: Clean, testable code architecture
- **Built-in GraphQL**: First-class support for GraphQL APIs
- **Middleware**: Authentication, logging, error handling built-in

**Real Impact**:
- API response time: 50-100ms (was 200-400ms with REST)
- Frontend code: 50% less boilerplate for data fetching
- Type safety: Catch bugs at compile time instead of runtime
- Development speed: 30-40% faster feature development

**Image**: `asaxplayinghorse/sprocket-core:{tag}`

**Framework**: NestJS (Node.js)

**Features**:
- GraphQL API
- Authentication/Authorization
- Database operations
- Business logic
- RabbitMQ message handling

**Configuration**:
- Port: 3001
- Database: All queries
- Cache: Redis
- Queue: RabbitMQ

**Route**: https://api.sprocket.mlesports.gg

**Secrets**:
- JWT secret
- OAuth credentials (Google, Discord, Epic, Steam)
- Database password
- Redis password
- S3 credentials

---

#### Discord Bot
**Purpose**: Discord integration

**Why a Dedicated Bot Service**:

**The Problem**:
Our community lives on Discord. Users don't want to leave Discord to:
- Check match schedules
- Submit match results
- View team rosters
- Register for tournaments

**Solution**: Bring functionality to Discord via bot commands.

**Why Separate Service** (vs. integrating into API):
```
Integrated into API:
- API must handle HTTP requests AND Discord events
- Discord.js library loaded in API (memory overhead)
- Discord connection issues could affect API stability
- Harder to scale (bot uses WebSocket, API uses HTTP)

Dedicated Bot Service:
- Single responsibility: Discord interactions
- Independent scaling (bot needs 1 replica, API might need 3)
- Discord issues don't affect API
- Can restart bot without affecting API
- Bot can use RabbitMQ to trigger backend operations
```

**Architecture Pattern**:
```
User sends Discord command: "/match-schedule"
    ↓
Discord Bot receives command
    ↓
Bot publishes message to RabbitMQ: "fetch-match-schedule"
    ↓
API consumes message, fetches from database
    ↓
API publishes response to RabbitMQ: "schedule-data"
    ↓
Bot consumes response, formats for Discord
    ↓
Bot sends Discord message with schedule
```

**Benefits**:
- **User Convenience**: Stay in Discord workflow
- **Engagement**: Notifications for matches, results, signups
- **Automation**: Bot can send reminders, announcements
- **Accessibility**: No need to remember website URL

**Real Impact**:
- 70% of user interactions happen via Discord bot (vs. website)
- Notification open rate: 85% (Discord) vs. 20% (email)
- User feedback: "I never have to leave Discord" = positive UX

**Image**: `asaxplayinghorse/sprocket-discord-bot:{tag}`

**Features**:
- Slash commands
- Event notifications
- Match scheduling
- User registration

**Configuration**:
- Bot token: Vault
- Command prefix: `s.` (main) or `{env}.` (others)
- Uses RabbitMQ for command queue

**Secrets**:
- Discord bot token
- S3 credentials (for image uploads)

---

#### Image Generation Service
**Purpose**: Generate match images, player cards, etc.

**Image**: `asaxplayinghorse/sprocket-image-generation-service:{tag}`

**Features**:
- Dynamic image creation
- Template rendering
- S3 upload
- Queue-based processing

**Configuration**:
- Queue: RabbitMQ `{env}-ig`
- Storage: S3 bucket

**Secrets**:
- S3 credentials
- Database password

---

#### Other Microservices

**Notification Service**:
- Sends Discord/email notifications
- Queue-based

**Analytics Service**:
- Tracks player/match metrics
- Writes to InfluxDB

**Matchmaking Service**:
- Creates balanced matches
- Uses Redis for state

**Replay Parse Service**:
- Parses Rocket League replays
- Integrates with Ballchasing API

**ELO Service**:
- Calculates player ratings
- Updates on match completion

**Submission Service**:
- Handles match submissions
- S3 storage for files

---

## Data Flow

### Data Flow Overview

![Data Flow Diagram](./data-flow.png)

The diagram above illustrates three main data flows in the Sprocket platform:
- **Player Authentication Flow** (Blue): Player login via OAuth (Discord/Google), user verification in PostgreSQL, and JWT token issuance
- **Match Scheduling Flow** (Green): League admin schedules match via Discord bot, matchmaking service processes request, teams are notified
- **Match Completion Flow** (Orange): Player submits result and replay file, replay is parsed via Ballchasing API, ELO ratings updated, stats recorded, match card image generated, and Discord notifications sent

### Request Flow

```
User Browser
    │
    │ HTTPS Request
    │ Host: sprocket.mlesports.gg
    │
    ▼
┌─────────────────────┐
│     Traefik         │
│  (Layer 1)          │
│                     │
│  1. TLS termination │
│  2. Route matching  │
│  3. Load balancing  │
└──────┬──────────────┘
       │
       │ HTTP (internal)
       │
       ▼
┌─────────────────────┐
│  Sprocket Web       │
│  (Platform)         │
│                     │
│  1. Render page     │
│  2. API calls       │
└──────┬──────────────┘
       │
       │ GraphQL Query
       │
       ▼
┌─────────────────────┐
│  Sprocket API       │
│  (Platform)         │
│                     │
│  1. Auth check      │
│  2. Business logic  │
│  3. DB queries      │
└──────┬──────────────┘
       │
       │
       ├─── PostgreSQL ───┐
       │                  │
       ├─── Redis ────────┤
       │                  │
       ├─── RabbitMQ ─────┤
       │                  │
       └─── S3 ───────────┘
```

### Secret Retrieval Flow

```
Doppler (Source of Truth)
    │
    │ Bootstrap Script
    │ (manual, one-time)
    │
    ▼
Vault
    │
    │ Pulumi reads secrets at deploy time
    │
    ▼
Docker Secrets
    │
    │ Mounted into containers
    │
    ▼
Application Services
```

### Async Processing Flow

```
User Action (e.g., "Create Match")
    │
    ▼
Sprocket API
    │
    │ Publishes message
    │
    ▼
RabbitMQ Queue
    │
    ▼
Matchmaking Service (consumer)
    │
    │ 1. Process matchmaking
    │ 2. Write to DB
    │ 3. Publish result event
    │
    ▼
RabbitMQ Events Queue
    │
    ├─── Notification Service ───> Send Discord notification
    │
    ├─── Analytics Service ──────> Record metrics
    │
    └─── Discord Bot ────────────> Update Discord channels
```

---

## Security Architecture

### Secret Management Hierarchy

```
┌────────────────────────────────────────────────────────────┐
│                     Doppler (Source of Truth)              │
│  - OAuth credentials                                        │
│  - API tokens                                              │
│  - Application secrets                                      │
│  - Team access control                                     │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Manual bootstrap
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                     Vault (Runtime Distribution)           │
│  - Receives secrets from Doppler (via script)              │
│  - Distributes to services at runtime                      │
│  - GitHub team-based access control                        │
│  - Audit logging                                           │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Pulumi reads at deploy time
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                     Docker Secrets                         │
│  - Created by Pulumi from Vault values                     │
│  - Mounted into containers as files                        │
│  - Readable only by specific services                      │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Read from filesystem
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                     Application Services                   │
│  - Read secrets from /app/secret/*.txt                     │
│  - Never log secret values                                 │
│  - Rotate as needed                                        │
└────────────────────────────────────────────────────────────┘
```

### Authentication & Authorization

#### Vault Access Control

**GitHub OAuth Integration**:
```hcl
auth "github" {
  organization = "SprocketBot"

  team_mappings = {
    "github-admin" = "admins"
    "github-readonly" = "readonly"
  }
}
```

**Policies**:
- `admins`: Full access to all secrets
- `readonly`: Read-only access to secrets
- `developers`: Access to application secrets only
- `ops`: Access to infrastructure secrets only

#### Application Authentication

**OAuth Providers**:
- Google
- Discord
- Epic Games
- Steam

**Flow**:
1. User clicks "Login with Google"
2. Redirects to OAuth provider
3. Provider callback with authorization code
4. API exchanges code for user info
5. API creates JWT token
6. Frontend stores JWT
7. Subsequent requests include JWT

**JWT Structure**:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Network Security

**Firewall Rules**:
```
Inbound:
  Port 80 (HTTP) - Allow (redirects to HTTPS)
  Port 443 (HTTPS) - Allow
  Port 22 (SSH) - Allow (restrict to admin IPs)
  All others - Deny

Outbound:
  Port 443 (HTTPS) - Allow (for external APIs)
  Port 80 (HTTP) - Allow (for package managers)
  Port 25060 (PostgreSQL) - Allow (Digital Ocean DB)
  Port 5432 (PostgreSQL) - Allow (Digital Ocean DB)
  All others - Allow (for now, should be restricted)
```

**TLS Configuration**:
- Minimum version: TLS 1.2
- Cipher suites: Modern, secure ciphers only
- HSTS: Enabled (Strict-Transport-Security header)
- Certificate provider: Let's Encrypt
- Auto-renewal: Yes

### Data Security

**At Rest**:
- PostgreSQL: Encrypted by Digital Ocean
- S3: Encrypted by cloud provider
- Vault state: Encrypted in S3
- Docker volumes: Not encrypted (future improvement)

**In Transit**:
- External traffic: TLS 1.2+ (via Traefik)
- Internal traffic: Unencrypted (within Docker overlay networks)
- Database connections: SSL required (managed PostgreSQL)

**Secrets**:
- Never in git (even encrypted)
- Never in logs
- Never in error messages
- Rotated regularly (manual process, should be automated)

---

## Scalability Considerations

### Current Limitations (Single Node)

**Bottlenecks**:
1. **Single point of failure**: If node goes down, everything goes down
2. **Resource constraints**: All services share node resources
3. **No horizontal scaling**: Can't add more nodes for capacity
4. **Persistent volumes**: Tied to single node

**Current Node Requirements**:
- CPU: 4+ cores
- RAM: 8GB+ (16GB recommended)
- Disk: 100GB+ SSD
- Network: 1Gbps+

### Scaling Strategies

#### Vertical Scaling (Current)
**Approach**: Upgrade node resources

**Pros**:
- Simple (no architecture changes)
- Works well for moderate growth

**Cons**:
- Limited by hardware maximums
- Expensive at high end
- Still single point of failure

**When to do**:
- Current node at >70% CPU/memory
- Performance degradation observed
- Before major traffic events

#### Horizontal Scaling (Future)
**Approach**: Add more nodes to Docker Swarm

**Changes Required**:
1. **Vault**: Migrate to cloud KMS auto-unseal
2. **Volumes**: Use NFS or cloud volumes (not local)
3. **Traefik**: Multiple replicas with shared cert storage
4. **Database**: Already using managed PostgreSQL (good!)
5. **Load Balancer**: Add external LB in front of Swarm

**Pros**:
- True redundancy
- Can scale to traffic
- No single point of failure

**Cons**:
- More complex
- Higher costs
- Requires refactoring

**When to do**:
- Consistently high traffic (>1000 concurrent users)
- Need high availability (99.9%+ uptime)
- Budget allows (~3x current costs)

#### Service-Level Scaling
**Approach**: Scale individual services

**Already Scalable**:
- All Platform microservices (stateless)
- Can run multiple replicas

**Needs Work**:
- Redis (would need Redis Cluster)
- RabbitMQ (would need cluster)
- Vault (would need HA setup)

**How to Scale a Service**:
```bash
# Increase replicas for a service
docker service scale sprocket-web=3

# Or via Pulumi
mode: {
  replicated: {
    replicas: 3
  }
}
```

### Performance Optimization

**Current Optimizations**:
- Redis caching (reduces DB load)
- CDN for static assets (not yet implemented)
- Database connection pooling
- Gzip compression (Traefik)
- HTTP/2 (Traefik)

**Future Optimizations**:
- CDN integration (Cloudflare)
- Image optimization (WebP, lazy loading)
- Database query optimization (indexes)
- RabbitMQ prefetch tuning
- Service-specific resource limits

---

## Future Architectural Improvements

### High Priority

1. **Disaster Recovery Testing**
   - Document full recovery procedure
   - Test from-scratch rebuild
   - Test database restore
   - Test Vault recovery

2. **Monitoring & Alerting**
   - Set up PagerDuty
   - Configure critical alerts
   - Create runbooks for common issues

3. **Security Hardening**
   - Enable Docker secrets encryption
   - Implement WAF (Cloudflare)
   - Add rate limiting
   - Security audit

### Medium Priority

4. **Multi-Environment Setup**
   - Staging environment
   - Development environment
   - Proper environment isolation

5. **CI/CD Pipeline**
   - Automated testing
   - Automated deployments
   - Rollback capability

6. **Backup Automation**
   - Automated database backups
   - Automated volume backups
   - Off-site backup storage

### Low Priority

7. **Multi-Node Setup**
   - 3-node Docker Swarm
   - External load balancer
   - Shared volume storage

8. **Service Mesh**
   - Consider Istio or Linkerd
   - Mutual TLS between services
   - Advanced traffic management

---

## Conclusion

The Sprocket infrastructure is built on solid foundations with clear separation of concerns, managed services for critical components, and comprehensive observability. The three-layer architecture provides good organization and deployment control.

**Strengths**:
- Infrastructure as Code (repeatable)
- Managed services (reliable)
- Comprehensive secret management
- Good observability
- TLS everywhere

**Areas for Improvement**:
- Single node (no HA)
- Manual disaster recovery
- No CI/CD pipeline
- Security hardening needed
- Monitoring alerts needed

**Suitable For**:
- Current scale (<1000 concurrent users)
- Small to medium teams
- Moderate budget constraints

**Will Need Upgrade When**:
- Traffic exceeds single node capacity
- High availability required (99.9%+)
- Team size increases significantly

This architecture document should serve as a reference for understanding the current infrastructure and planning future improvements.

---

**Document Version**: 1.0
**Last Updated**: November 8, 2025
**Next Review**: February 2026
