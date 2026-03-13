# Sprocket Infrastructure Glossary

**Version**: 1.0
**Last Updated**: November 8, 2025
**Audience**: Everyone - from non-technical managers to junior engineers

---

## How to Use This Glossary

This glossary defines all technical terms used throughout the Sprocket infrastructure documentation. Terms are organized alphabetically within categories for easy reference.

**For Non-Technical Readers**: Start with "Core Concepts" to understand the basics.
**For Junior Engineers**: Read through "Infrastructure Concepts" and "Deployment Tools" sections.
**For Everyone**: Use Ctrl+F / Cmd+F to search for specific terms.

---

## Core Concepts

### Infrastructure
The collection of hardware (computers, servers) and software (databases, web servers) needed to run an application. Think of it like the foundation, plumbing, and electrical systems of a building - users don't see it, but nothing works without it.

### Cloud Computing
Renting computer resources (servers, storage, databases) from companies like Digital Ocean or AWS instead of buying and maintaining your own physical servers. Like renting an apartment instead of buying a house.

### Production
The "real" environment where actual users interact with the application. As opposed to "development" (where engineers test) or "staging" (where you test before going live). When something is "in production," it means real users depend on it.

### Deployment
The process of taking application code and making it run on servers so users can access it. Like publishing a book - writing it is development, but deployment is printing and distributing it to readers.

### High Availability (HA)
A system designed to keep running even if individual parts fail. Like having backup generators in a hospital - if main power fails, backups take over automatically.

### Scalability
The ability to handle more users or traffic by adding more resources. Two types:
- **Vertical Scaling**: Making a single server bigger (more CPU, more RAM) - like adding more floors to a building
- **Horizontal Scaling**: Adding more servers - like building more buildings

---

## Infrastructure Concepts

### Docker
Software that packages applications and all their dependencies into "containers" - standardized units that run the same way everywhere. Think of it like shipping containers: whether you're shipping toys or electronics, the container format is the same, making transport easier.

**Real-world analogy**: Instead of saying "this app needs Python 3.9, library X version 2.1, library Y version 3.0..." you package everything together. The container runs the same on your laptop and on the production server.

### Docker Swarm
Docker's built-in tool for managing containers across multiple servers. It handles:
- Running multiple copies of an application for reliability
- Distributing containers across servers
- Restarting containers if they crash
- Load balancing traffic between copies

**Why we use it**: Provides redundancy and easier management than running containers manually on each server.

### Container
A running instance of a Docker image. It's isolated from other containers - has its own filesystem, network, and processes. Like apartments in a building - each has its own space but they share the building's infrastructure.

### Service (Docker Service)
In Docker Swarm, a service is a definition of how to run containers:
- Which image to use
- How many copies (replicas) to run
- What ports to expose
- What networks to connect to

**Example**: The "Sprocket Web" service says "run 1 copy of the sprocket-web image, expose port 3000, connect to the ingress network."

### Replica
A copy of a container. If a service has 3 replicas, it means 3 identical containers are running, usually for redundancy and load balancing.

**Why multiple replicas?** If one crashes, the others keep serving users. Also spreads traffic across multiple containers for better performance.

### Image (Docker Image)
A template for creating containers. Contains the application code plus everything needed to run it. Like a blueprint for a house - you can build multiple houses (containers) from one blueprint (image).

**Example**: `asaxplayinghorse/sprocket-web:main` is an image stored in Docker Hub that contains the Sprocket web application.

### Volume (Docker Volume)
Persistent storage for containers. Containers are temporary - when they stop, their data disappears. Volumes persist data even when containers are destroyed.

**Real-world analogy**: Like an external hard drive that survives even if you replace your computer.

### Network (Overlay Network)
In Docker Swarm, overlay networks connect containers even across different physical servers. Containers on the same network can communicate using service names instead of IP addresses.

**Example**: A container can connect to Redis by using the hostname "redis" instead of needing to know the IP address.

### Bind Mount
A way to share a directory from the host server directly into a container. Changes made in the container show up on the host and vice versa.

**When we use it**: Vault unseal keys are stored on the host server and bind-mounted into the Vault container so it can read them.

### Node
In Docker Swarm, a node is a server that runs containers. Can be:
- **Manager Node**: Orchestrates the swarm, assigns containers to workers
- **Worker Node**: Runs containers as assigned by manager

**Current setup**: We have 1 manager node (our single Droplet) running everything.

---

## Networking & Security Concepts

### DNS (Domain Name System)
The system that translates human-readable domain names (like `sprocket.mlesports.gg`) into IP addresses (like `192.168.4.39`) that computers use to find each other.

**Real-world analogy**: Like a phone book - you look up "Pizza Place" and get the phone number.

### HTTPS / HTTP
- **HTTP**: HyperText Transfer Protocol - how web browsers communicate with web servers
- **HTTPS**: HTTP Secure - encrypted version so data can't be intercepted

**Why it matters**: Without HTTPS, passwords and data travel in plain text. Anyone on the network can read them.

### TLS (Transport Layer Security)
The encryption technology that makes HTTPS secure. Formerly called SSL (Secure Sockets Layer) - you'll still hear "SSL certificate" but it really means TLS.

### Certificate (TLS/SSL Certificate)
A digital file that proves a website is who it claims to be and enables HTTPS encryption. Issued by trusted authorities like Let's Encrypt.

**Real-world analogy**: Like a passport that proves your identity and is issued by a trusted government.

### Let's Encrypt
A free, automated certificate authority that issues TLS certificates. We use it to get certificates for `sprocket.mlesports.gg` so users see the padlock icon in their browser.

### Port
A numbered endpoint on a computer where network connections are made. Common ports:
- **80**: HTTP (web traffic, unencrypted)
- **443**: HTTPS (web traffic, encrypted)
- **22**: SSH (remote server access)
- **5432/25060**: PostgreSQL (database)

**Real-world analogy**: Like apartment numbers in a building - the building has one address (IP), but different apartments (ports) serve different purposes.

### Firewall
Security system that controls what network traffic is allowed in/out of a server. Like a security guard at a building entrance - only lets in authorized visitors.

**Our firewall**: Allows ports 80 (HTTP), 443 (HTTPS), 22 (SSH for admins only). Blocks everything else.

### Reverse Proxy
A server that sits in front of your application servers and forwards requests to them. Provides benefits like:
- TLS termination (handles HTTPS encryption/decryption)
- Load balancing (distributes traffic across multiple servers)
- Routing (sends requests to the right application based on URL)

**Our reverse proxy**: Traefik handles all incoming traffic and routes it to the correct service.

### Load Balancer
Distributes incoming network traffic across multiple servers to prevent any one server from becoming overloaded.

**Example**: If you have 3 web servers, the load balancer sends some users to server 1, some to server 2, some to server 3.

### Ingress Controller
In container environments, the component that handles incoming traffic from outside the cluster and routes it to the appropriate services. Traefik is our ingress controller.

### OAuth
An authentication method that lets users log in using their Google, Discord, Steam, or Epic Games accounts instead of creating a new username/password.

**User experience**: "Sign in with Google" button.

### JWT (JSON Web Token)
A secure way to transmit user authentication information between client and server. After logging in, the user gets a JWT that proves they're authenticated for future requests.

**Real-world analogy**: Like a wristband at a concert - you show your ID once to get in, then the wristband proves you're allowed inside.

---

## Storage & Data Concepts

### Database
Software that stores and organizes data so applications can create, read, update, and delete information efficiently.

**Our database**: PostgreSQL, which stores all Sprocket data (users, matches, teams, etc.)

### PostgreSQL (Postgres)
A powerful, reliable, open-source relational database. Organizes data into tables (like spreadsheets) with rows and columns.

**Why we chose it**: Industry standard, handles complex queries, supports millions of records, excellent reliability.

### Managed Database
A database service run by a cloud provider (like Digital Ocean) where they handle:
- Automatic backups
- Updates and security patches
- Hardware maintenance
- Scaling and performance tuning

**vs. Self-Hosted**: We used to run our own PostgreSQL in a container. Now Digital Ocean manages it for us.

**Trade-off**: Costs $15/month but saves many hours of maintenance work.

### Redis
An in-memory data store used for caching and fast data access. Extremely fast because it stores data in RAM instead of on disk.

**Use cases in Sprocket**:
- Session storage (keep users logged in)
- Caching (store frequently-accessed data to avoid database queries)
- Pub/sub messaging (real-time updates)

**Real-world analogy**: Like keeping frequently-used files on your desk instead of filing them away - faster access.

### S3 (Simple Storage Service)
Amazon's object storage service for files. Digital Ocean Spaces is S3-compatible (same API, different company).

**Use cases in Sprocket**:
- Storing replay files
- Storing generated images
- Storing backups
- Storing Vault's encrypted data

**Why S3?**: Industry standard, extremely durable (99.999999999% - "eleven 9s"), cheap, scalable.

### Object Storage
Storage for files (objects) accessed via HTTP API instead of mounting as a filesystem. Each file has a unique URL.

**vs. File Storage**: Instead of `/var/www/images/photo.jpg`, you access `https://s3.amazonaws.com/bucket/photo.jpg`

### Bucket
In object storage, a container for files. Like a folder, but at the top level.

**Our buckets**:
- `vault-secrets`: Stores Vault's encrypted backend data
- `sprocket-storage`: Stores application files (images, replays)

### Backup
A copy of data stored separately so you can restore it if the original is lost or corrupted.

**Our backups**:
- Database: Automatic daily backups by Digital Ocean (7-day retention)
- Vault: Manual backups of unseal keys and S3 data
- Pulumi state: Manual exports

### Retention
How long backups are kept before being deleted.

**Example**: 7-day retention means you can restore from backups up to 7 days old, but older backups are deleted.

---

## Application Architecture Concepts

### Microservices
An architectural pattern where an application is split into small, independent services that each handle one specific function.

**Example**: Instead of one big "Sprocket" application, we have separate services for:
- Web UI
- API
- Discord bot
- Image generation
- Matchmaking
- Notifications

**Benefits**: Each service can be updated independently. If one fails, others keep working.

### API (Application Programming Interface)
A way for applications to communicate with each other programmatically. Our GraphQL API lets the web UI, Discord bot, and other services request data.

**Real-world analogy**: Like a waiter at a restaurant - you tell them what you want, they bring it from the kitchen. You don't need to know how the kitchen works.

### GraphQL
A query language for APIs. Instead of having dozens of different endpoints, clients can request exactly the data they need in a single query.

**Example**: One request can get user info, their recent matches, and team details, rather than making 3 separate requests.

### Message Queue
A system for asynchronous communication between services. One service puts a message in the queue, another service processes it later.

**Our message queue**: RabbitMQ

**Use case**: When a match finishes, the API puts a message in the queue. The notification service reads it and sends Discord notifications. The analytics service reads it and records stats.

**Why queues?**: Services don't have to wait for each other. API can return immediately while background tasks process.

### RabbitMQ
A popular open-source message queue system using the AMQP protocol.

**Real-world analogy**: Like a mailbox - sender drops a letter in, recipient picks it up when ready.

### Pub/Sub (Publish/Subscribe)
A messaging pattern where:
- **Publishers** send messages to topics
- **Subscribers** listen to topics they're interested in

**Example**: Match results are "published" to a topic. Notification service, analytics service, and ELO service all "subscribe" to get the results.

---

## Deployment & Operations Tools

### Infrastructure as Code (IaC)
Defining infrastructure (servers, networks, databases) using code files instead of clicking through web interfaces.

**Benefits**:
- Version controlled (track changes in git)
- Repeatable (deploy the same way every time)
- Self-documenting (code shows what exists)
- Easy rollback (restore previous version)

**Our IaC tool**: Pulumi

### Pulumi
An Infrastructure as Code tool that lets you define infrastructure using real programming languages (we use TypeScript).

**What it manages**:
- Docker services
- Networks
- Volumes
- Secrets
- Configurations

**How it works**: You write code describing what you want. Pulumi compares it to what currently exists and makes the necessary changes.

### Stack (Pulumi Stack)
An instance of your infrastructure. We have 3 stacks:
- `layer_1`: Core infrastructure (Traefik, Vault)
- `layer_2`: Data services (Redis, databases, monitoring)
- `prod`: Application services (Sprocket web, API, bot)

### Terraform
Another popular Infrastructure as Code tool (competitor to Pulumi). We don't use it, but you might see it mentioned in industry documentation.

### CI/CD (Continuous Integration / Continuous Deployment)
Automated processes for testing and deploying code:
- **CI**: Automatically test code when developers commit changes
- **CD**: Automatically deploy tested code to production

**Current state**: We don't have CI/CD yet (manual deployments via Pulumi). Future improvement.

### Git
Version control system that tracks changes to code over time. Like "track changes" in Word, but much more powerful.

**Our git repository**: `sprocket-infra` on GitHub

### GitHub
A website that hosts git repositories and provides collaboration tools. Our infrastructure code lives here.

---

## Monitoring & Observability

### Metrics
Numerical data about system performance collected over time:
- CPU usage: 45%
- Memory usage: 3.2GB
- Request rate: 150 requests/minute
- Error rate: 0.3%

**Why it matters**: Helps identify problems before users notice. "CPU is at 90%" warns you to add resources.

### Logs
Text records of events that happen in applications. Each log entry typically has:
- Timestamp
- Severity (INFO, WARN, ERROR)
- Message describing what happened

**Example**: `2025-11-08 10:30:15 ERROR: Failed to connect to database`

### Monitoring
Continuously collecting metrics and logs to understand system health.

**Our monitoring stack**:
- **InfluxDB**: Stores time-series metrics
- **Grafana**: Visualizes metrics in dashboards
- **Loki**: Aggregates logs from all services
- **Gatus**: Monitors service health/uptime

### Dashboard
A visual display of key metrics, usually showing graphs and charts in real-time.

**Example**: Our Grafana dashboard shows CPU usage, memory usage, request rate, error rate, database connections - all updating live.

### Alert
An automated notification when metrics exceed thresholds.

**Examples**:
- "CPU > 85% for 10 minutes" → Send Slack message
- "Error rate > 5%" → Page on-call engineer
- "Service down for 2 minutes" → Send PagerDuty alert

**Current state**: Monitoring tools installed, but alerts not fully configured yet.

### Uptime
Percentage of time a service is available and working correctly.

**Industry targets**:
- 99% uptime = ~3.65 days downtime per year
- 99.9% uptime = ~8.76 hours downtime per year
- 99.99% uptime = ~52 minutes downtime per year

**Our target**: 99.9%+ (aiming for "three 9s")

### SLA (Service Level Agreement)
A commitment about service availability and performance. Defines what level of service users should expect.

**Example SLA**: "The service will be available 99.9% of the time, with response times under 500ms for 95% of requests."

---

## Security & Secrets Management

### Secrets
Sensitive information like passwords, API keys, and certificates that must be kept secure.

**Examples**:
- Database passwords
- OAuth client secrets
- API tokens
- Encryption keys

### Vault (HashiCorp Vault)
A tool for securely storing and managing secrets. Provides:
- Encrypted storage
- Access control (who can read which secrets)
- Audit logging (track who accessed what)
- Secret rotation capabilities

**Why we use it**: Better than storing secrets in code or environment variables. Centralized, secure, auditable.

### Unseal / Seal (Vault)
Vault starts in a "sealed" state where it can't decrypt any secrets. Unsealing requires providing multiple "unseal keys" (like needing multiple keys to open a bank vault).

**Sealed**: Vault is running but all data is encrypted and inaccessible
**Unsealed**: Vault can decrypt and serve secrets

**Why this security model?**: Even if someone steals the Vault server, they can't read secrets without unseal keys.

### Doppler
A cloud-based secrets management service we use as our "source of truth" for secrets. Team members can update secrets here, then they're synced to Vault.

**Workflow**: Doppler (team edits) → Bootstrap script → Vault (runtime use)

### Environment Variable
A variable set outside your application code that the application can read. Common way to configure applications without hardcoding values.

**Example**: `DATABASE_URL=postgresql://...` tells the app where to find the database.

### Docker Secret
A secure way to make secrets available to containers in Docker Swarm. Secrets are encrypted in transit and at rest, mounted as read-only files inside containers.

**How it works**: Pulumi creates Docker secrets from Vault values. Containers read secrets from `/app/secret/` directory.

---

## Sprocket-Specific Terms

### Sprocket
The gaming platform this infrastructure supports. Provides competitive gaming leagues, match tracking, player statistics, and team management for Rocket League esports.

### MLE (Minor League Esports)
The organization that runs Sprocket. Provides competitive Rocket League leagues at various skill levels.

### Ballchasing
An external service that stores and analyzes Rocket League replay files. Sprocket integrates with their API to fetch replay data.

### Replay
A recording of a Rocket League match that can be analyzed for statistics. Stored as `.replay` files, uploaded to Ballchasing or our S3 storage.

### ELO
A rating system for ranking player skill. Named after Arpad Elo who developed it for chess. Used in Sprocket to match players of similar skill.

### Matchmaking
The process of creating balanced matches by grouping players of similar skill levels.

---

## Service-Specific Terms

### Traefik
A modern reverse proxy and load balancer. Acts as the entry point for all HTTP/HTTPS traffic to our infrastructure.

**What it does**:
- Routes `sprocket.mlesports.gg` to the web service
- Routes `api.sprocket.mlesports.gg` to the API service
- Handles TLS certificate automation with Let's Encrypt
- Terminates HTTPS connections

### Ingress / Egress
- **Ingress**: Traffic coming INTO the system (user requests)
- **Egress**: Traffic going OUT of the system (API calls to external services)

**Traefik Ingress Network**: The Docker network where all public-facing services connect to receive incoming traffic.

### InfluxDB
A time-series database optimized for storing metrics that change over time (CPU usage, request rates, temperatures, etc.)

**vs. PostgreSQL**: PostgreSQL stores records (users, matches). InfluxDB stores measurements over time (server CPU at 10:00, 10:01, 10:02...).

### Grafana
An open-source platform for visualizing metrics. Creates dashboards with graphs, charts, and alerts.

**Connects to**: InfluxDB (for metrics), Loki (for logs)

### Loki
A log aggregation system developed by Grafana Labs. Collects logs from all services and makes them searchable.

**Query example**: "Show me all ERROR logs from sprocket-core service in the last hour"

### Gatus
A health monitoring tool that periodically checks if services are up and responding correctly.

**What it monitors**:
- HTTP endpoints (is the website accessible?)
- Database connectivity
- External API availability
- Response times

### N8n
A workflow automation tool (like Zapier but self-hosted). Used for scheduled tasks and integrations.

**Use cases**: Automated data exports, scheduled reports, webhook integrations

### Neo4j
A graph database - stores data as nodes (entities) and relationships between them. Better than traditional databases for highly connected data.

**Use case in Sprocket**: Player relationships, team hierarchies, social connections

### Telegraf
A metrics collection agent that gathers system stats and forwards them to InfluxDB.

**What it collects**: CPU, memory, disk usage, network I/O, Docker container stats

---

## Technology Stack

### Node.js
JavaScript runtime that lets you run JavaScript on servers (not just in browsers). Many of our services are built with Node.js.

### Next.js
A React framework for building web applications. Powers our Sprocket Web UI.

**Why Next.js**: Server-side rendering for better performance and SEO.

### NestJS
A Node.js framework for building scalable server applications. Powers our Sprocket API.

**Why NestJS**: Great TypeScript support, modular architecture, built-in GraphQL support.

### TypeScript
A programming language that adds types to JavaScript. Makes code more reliable by catching errors before runtime.

**Our infrastructure code**: Written in TypeScript (Pulumi definitions)

---

## Acronyms Quick Reference

| Acronym | Full Term | Simple Definition |
|---------|-----------|-------------------|
| API | Application Programming Interface | How applications talk to each other |
| CDN | Content Delivery Network | Serves files from servers close to users for speed |
| CI/CD | Continuous Integration/Deployment | Automated testing and deployment |
| CLI | Command Line Interface | Text-based way to interact with software |
| DNS | Domain Name System | Translates domain names to IP addresses |
| HA | High Availability | System designed to stay running if parts fail |
| HTTP(S) | HyperText Transfer Protocol (Secure) | How web browsers and servers communicate |
| IaC | Infrastructure as Code | Defining infrastructure using code |
| JWT | JSON Web Token | Token proving a user is authenticated |
| OAuth | Open Authorization | "Sign in with Google/Discord" authentication |
| S3 | Simple Storage Service | Amazon's (and compatible) object storage |
| SLA | Service Level Agreement | Promise about service availability |
| SSH | Secure Shell | Encrypted way to access servers remotely |
| SSL/TLS | Secure Sockets Layer / Transport Layer Security | Encryption for web traffic |
| UI | User Interface | What users see and interact with |
| URL | Uniform Resource Locator | Web address (e.g., https://sprocket.mlesports.gg) |
| VM | Virtual Machine | Software-based computer running inside another computer |

---

## Common Units & Measurements

### Storage
- **KB** (Kilobyte) = 1,024 bytes
- **MB** (Megabyte) = 1,024 KB
- **GB** (Gigabyte) = 1,024 MB (~1 billion bytes)
- **TB** (Terabyte) = 1,024 GB (~1 trillion bytes)

**Context**: Our database is ~10GB. Our S3 storage costs $5/month for 100GB+.

### Computing
- **CPU** (Central Processing Unit): The "brain" that executes instructions
- **Core**: Modern CPUs have multiple cores (can do multiple things simultaneously)
- **RAM** (Random Access Memory): Fast temporary storage for running programs
- **vCPU**: Virtual CPU - a portion of a physical CPU allocated to a virtual machine

**Our server**: 4 vCPUs, 8GB RAM

### Network
- **Mbps** (Megabits per second): Network speed measurement
- **Latency**: Time for data to travel from source to destination (measured in milliseconds)
- **Bandwidth**: Maximum data transfer rate
- **Throughput**: Actual data transfer rate achieved

### Time
- **ms** (millisecond) = 0.001 seconds
- **Response Time**: How long it takes a server to respond to a request

**Our target**: <500ms response time for 95% of requests (p95)

---

## Related Resources

**For deeper learning**:
- Docker documentation: https://docs.docker.com/
- Pulumi documentation: https://www.pulumi.com/docs/
- Traefik documentation: https://doc.traefik.io/traefik/

**Sprocket-specific**:
- Main repository: https://github.com/SprocketBot/
- Infrastructure repository: https://github.com/SprocketBot/sprocket-infra

---

**Glossary Version**: 1.0
**Last Updated**: November 8, 2025
**Maintained By**: Infrastructure Team

**Feedback**: If you encounter an undefined term, please add it to this glossary or request clarification in #infrastructure.

---

*This glossary is a living document. Please update it when new terms are introduced or when definitions need clarification.*
