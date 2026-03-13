# Sprocket Platform Restoration: Detailed Technical Report
## Complete Documentation of the Infrastructure Crisis and Recovery

---

## Executive Summary

This document provides comprehensive details about the Sprocket platform outage that occurred in mid-2025, the emergency recovery effort, and the path forward. This serves as a detailed reference companion to the town hall presentation.

---

## 1. The Crisis: What Happened

### Timeline of the Outage
- **Mid-2025**: Sprocket platform went completely offline
- **Duration**: Platform remained down for several months
- **Impact**: Complete loss of gaming platform services including web interface, API, Discord bot, league play infrastructure, player stats, and rankings

### Scope of the Outage
The platform outage affected:
- Complete platform outage (web, API, Discord bot)
- All league play and scrim infrastructure  
- Player stats and rankings system
- 22 different services offline simultaneously

### Root Cause Analysis
The crisis exposed fundamental organizational weaknesses:
- No infrastructure team in place
- No backup plans or recovery procedures
- No clear ownership of critical systems
- No budget allocation for infrastructure maintenance
- No succession planning for critical knowledge

---

## 2. The Recovery Effort

### Emergency Response Statistics
- **Duration**: 8 weeks of intensive work (56 days total)
- **Timeline**: September 14 - November 8, 2025
- **Commits**: 20+ major infrastructure commits
- **Breakthroughs**: 5 critical technical breakthroughs solving systemic problems
- **Effort**: Hundreds of hours of volunteer time
- **Cost**: Zero dollars (entirely volunteer effort)

### Recovery Team
The recovery was accomplished through an emergency volunteer effort led by available community members with the necessary technical expertise.

---

## 3. Technical Architecture Overview

### System Complexity
The Sprocket platform is not a simple website but a **22-service distributed system** organized in three layers:

#### Infrastructure Layer (Layer 1) - 3 services
- **Traefik reverse proxy** with automatic HTTPS
- **Vault secrets management** with S3 backend
- **Docker Socket Proxy** for security

#### Data Services Layer (Layer 2) - 9 services
- **PostgreSQL database** (now managed externally)
- **Redis caching** system
- **RabbitMQ message queue**
- **InfluxDB** time-series database
- **Grafana** monitoring dashboard
- **Neo4j graph database**
- **N8n workflow automation**
- **Gatus service monitoring**
- **Loki log aggregation**
- **Telegraf metrics collection**

#### Application Layer (Platform) - 10 services
- **Web UI** (Next.js frontend)
- **Backend API** service
- **Discord bot integration**
- **Image generation service**
- **6+ microservices** for various platform functions

### Why This Complexity is Necessary
This architecture is not overengineering but required for a modern gaming platform:

**Essential Components:**
- Database for player data, match results, and rankings
- Cache layer for fast page loads and performance
- Message queues for Discord integration and async processing
- Time-series database for performance metrics and monitoring
- Graph database for player/team relationship mapping
- Workflow automation for tournament management
- Comprehensive monitoring to detect failures
- Log aggregation for debugging and troubleshooting
- Metrics collection for performance analysis

**Critical Point**: Each service exists for a specific reason. Removing any component would break essential platform features.

---

## 4. The Five Major Technical Challenges

### Challenge 1: Vault Unsealing Automation
**Problem**: HashiCorp Vault (secrets manager) requires manual unsealing after every restart, creating a chicken-and-egg automation problem.

**Solution Journey**: 5 different approaches attempted over 3 days before finding a working solution.

**Final Solution**: Custom auto-initialization script with local bind mount for unseal keys, enabling automated Vault management.

### Challenge 2: Database Reliability
**Problem**: Self-hosted PostgreSQL in Docker with no backups, no high availability, and data persistence concerns.

**Decision**: Migrate to managed database service (Digital Ocean Managed PostgreSQL).

**Impact**:
- Automated daily backups with point-in-time recovery
- Professional-grade reliability and uptime
- Reduced operational overhead
- One less critical service to manage directly

### Challenge 3: Storage Migration (MinIO → S3)
**Problem**: Self-hosted S3-compatible storage (MinIO) was resource-intensive and unreliable.

**Migration**: Phased approach over 8 days to move all data to AWS S3.

**Benefit**: Professional-grade storage with 99.999999999% durability and reduced maintenance burden.

### Challenge 4: Multi-Environment Routing
**Problem**: Platform needed to work in 4 different access patterns:
1. Local development (localhost)
2. LAN access (direct IP)
3. VPN access (Tailscale)
4. Public internet (real domain)

**Complexity**: Different routing rules, certificates, and DNS requirements for each pattern.

### Challenge 5: Secret Management Architecture
**Problem**: Secrets scattered across multiple systems (Doppler, Vault, Pulumi, Docker).

**Solution**: Hierarchical secret management system:
- **Doppler** = Source of Truth for all secrets
- **Vault** = Runtime Distribution to applications
- **Docker Secrets** = Container Mounting for services
- **Pulumi** = Infrastructure Secrets for deployment

**Reality**: Managing OAuth credentials for Google, Discord, Epic, Steam plus API tokens, database credentials, and SMTP settings across 22 services.

---

## 5. Detailed Recovery Timeline

### Week 1 (September 14-19, 2025): Foundation Rebuild
- Layer 1 infrastructure restored to working condition
- Rusty system brought back to operational status
- Vault initialization challenges began
- Basic networking and service discovery established

### Week 2 (September 19-23, 2025): The Vault Struggles
- 5 different attempts to automate Vault unsealing
- Each failure provided valuable learning opportunities
- Breakthrough on September 19: "vault actually unseals!"
- Automated secrets management achieved

### Week 3-4 (September 30 - October 8, 2025): Storage Migration
- Phased migration from MinIO to AWS S3
- 8 days of careful data migration and validation
- One less complex service to maintain
- Improved storage reliability and performance

### Week 5 (October 26, 2025): Platform Resurrection
- After months offline: "Sprocket is alive!"
- All 22 services successfully deployed and operational
- Web UI, API, Discord bot all responding to requests
- Core platform functionality restored

### Week 6 (October 26-27, 2025): Routing Hell
- Multi-environment routing problems identified and solved
- IP-based vs hostname-based access patterns resolved
- Certificate management challenges addressed
- All access methods working properly

### Week 7-8 (November 4-8, 2025): The Final Push
- Database migrated to managed service
- Production domain configured with Let's Encrypt
- Full HTTPS with automatic certificates implemented
- **November 8, 2025: PRODUCTION COMPLETE**

---

## 6. What Was Accomplished

### Production Infrastructure (Now Live)
**3-Layer Architecture Successfully Deployed:**
- Layer 1: Infrastructure (3 services)
- Layer 2: Data Services (9 services)  
- Platform: Applications (10 services)

**External Services Integrated:**
- Digital Ocean Managed PostgreSQL
- AWS S3 / Digital Ocean Spaces storage
- Doppler secrets management
- Let's Encrypt certificates
- GitHub OAuth for access control

**Modern DevOps Practices Implemented:**
- Infrastructure as Code (Pulumi)
- Automated secret provisioning
- Service monitoring and alerting
- Log aggregation and metrics collection
- Automated HTTPS certificates
- Health checks and verification systems

---

## 7. Infrastructure Scale and Complexity

### Infrastructure Statistics
- **22 services** deployed and running
- **5 Docker networks** for service isolation
- **15+ persistent volumes** for data storage
- **20+ Vault secret paths** for credential management
- **6 external dependencies** integrated
- **~5,000 lines** of Infrastructure as Code

### Deployment Complexity
- **3 Pulumi stacks** (layer_1, layer_2, prod)
- **50+ configuration files** (JSON/YAML formats)
- **Multiple environments** supported (local, LAN, VPN, cloud)
- **4 different routing patterns** implemented and tested

### Development Effort Summary
- **56 days** of concentrated work (Sept 14 - Nov 8, 2025)
- **20+ commits** in the rebuild phase
- **5 major technical breakthroughs** solving systemic problems
- **Countless hours** spent debugging, testing, and documenting

---

## 8. Organizational Lessons Learned

### The Real Problem: Organizational Failure
This wasn't just a technical failure - it was an organizational one that revealed serious structural issues:

1. **No Infrastructure Team**: Nobody was responsible for maintaining production systems
2. **No Knowledge Transfer**: Critical system knowledge lived in one person's head
3. **No Backup Plans**: When things broke, there were no procedures for recovery
4. **No Budget Allocation**: The organization wasn't investing in the foundation that powers everything else
5. **No Succession Planning**: Assumed volunteers would always be available and willing

**Critical Realization**: The organization got lucky. One person happened to have the skills and availability to fix this. Next time, they might not be so fortunate.

---

## 9. Complexity Analysis

### Why This System Is So Hard to Work With

**1. Distributed Systems Are Hard**
- 22 services that must work together perfectly
- Complex networking and service dependencies
- Each service has its own quirks and requirements

**2. Security Is Hard**
- Secret management across multiple systems and services
- OAuth integration with 4 different providers (Google, Discord, Epic, Steam)
- Vault policies and access control configuration
- HTTPS certificates for multiple domains and environments

**3. Multi-Environment Support Is Hard**
- Local development vs production environment differences
- Different routing requirements for different access methods
- Certificate management varies by environment and use case

**4. DevOps Is Hard**
- Infrastructure as Code requires deep technical knowledge
- Docker Swarm orchestration is complex and finicky
- Monitoring and debugging distributed systems is challenging
- No simple "restart the server" solutions available

---

## 10. The Over-Engineering Reality Check

### How We Got Here
The current Sprocket platform was designed for a scale that never materialized:

**Designed for**: Tens to hundreds of thousands of users across dozens of organizations
**Reality**: Much smaller scale, single organization focus
**Cost**: Massive complexity overhead that made everything harder

### Price of Over-Engineering
- **22 services** to maintain instead of 5-6
- Complex multi-tenancy architecture that nobody needed
- Infrastructure complexity that required specialist knowledge
- Longer development cycles due to system complexity
- Higher barrier to entry for new volunteers
- Increased operational overhead and maintenance burden

---

## 11. New Direction: Simplified by Design

### Fundamental Architecture Change

**Old Model**: One master deployment for all organizations simultaneously
- Massive centralized infrastructure
- Complex multi-tenancy requirements
- Scale that never materialized
- One-size-fits-all architecture

**New Model**: One simplified deployment per organization
- Tailored infrastructure for actual needs
- Simple, focused architecture
- Each organization scales independently
- Vastly reduced complexity and maintenance overhead

---

## 12. Sprocket v2: A Simpler Future

### Infrastructure Simplification
- From 22+ services to ~6 core services
- Single-organization focus eliminates multi-tenancy overhead
- Standard deployment patterns that are easy to understand
- Reduced dependency on complex orchestration systems

### Code Simplification
- Remove unused scaling features designed for theoretical load
- Focus on actual user needs, not theoretical scale requirements
- Simpler deployment and maintenance procedures
- Lower barrier to entry for contributors and maintainers

### Open Source Transformation
**ELO and Matchmaking Systems**: Currently closed source/proprietary - proposing to completely open these systems

**Unified Architecture**: Single, transparent matchmaking system instead of multiple competing implementations

**Community Ownership**: Full visibility into how rankings and matches work, enabling community contributions and audits

**Simplified Integration**: One open system that any organization can use, modify, and improve

### Implementation Timeline
- **2025**: Continue stabilizing current platform while building v2
- **2026**: Early tests of Sprocket v2 with simplified architecture
- **Future**: Gradual migration to the new, sustainable model

**Full Proposal Available**: [Sprocket v2 Unified Matchmaking Proposal](https://minor-league-esports.github.io/knowledgeBase/departments/development/features-and-designs/sprocket-v2-unified-matchmaking-proposal/)

---

## 13. Active Simplification Efforts (Current Platform)

While building the replacement system, efforts are underway to make the current system more manageable:

### 1. Better Documentation
- Comprehensive architecture documentation
- Step-by-step deployment guides
- Troubleshooting runbooks and playbooks
- Detailed postmortem with lessons learned

### 2. Managed Services Adoption
- Moved database to managed PostgreSQL service
- Using cloud S3 instead of self-hosted MinIO
- Let external experts handle infrastructure components
- Reduced operational burden on volunteers

### 3. Automation Improvements
- Automated Vault unsealing process
- Scripted secret provisioning procedures
- Health check scripts for monitoring
- Deployment verification automation

### 4. Service Reduction Where Possible
- Removed MinIO (one less service to maintain)
- Consolidated configuration management
- Simplified routing where feasible
- Reduced complexity in manageable areas

**Important Note**: Some complexity is unavoidable in the current system architecture. This is why Sprocket v2 is being built - to eliminate this complexity at the architectural level rather than trying to simplify an inherently complex system.

---

## 14. Sustainability and Risk Management

### The Reality Check: This Cannot Happen Again
Relying on emergency volunteer efforts is not sustainable for critical infrastructure.

**Risk Scenarios**:
- Next crisis hits during a busy period when experts are unavailable
- People with critical knowledge leave the organization
- Problem arises that nobody knows how to solve
- Key contributor gets burned out from carrying too much responsibility

**Consequence**: Without systemic changes, the organization risks everything falling apart again, possibly permanently.

---

## 15. Building a Sustainable Infrastructure Team

### Transition from Crisis Response to Sustainable Operations
The organization needs to move from heroic emergency efforts to structured, sustainable operations with proper team support.

### Volunteer Opportunities
**Specific Needs**: People who can help maintain infrastructure, debug production issues, improve documentation, assist with deployments, and learn the system alongside existing team members.

**Requirements**: 
- Willingness to learn and contribute
- Ability to commit some time regularly
- Interest in keeping the community alive
- Not afraid of technical challenges
- No expert-level knowledge required

---

## 16. Different Ways to Contribute

### Infrastructure & DevOps
- Learn Pulumi and Infrastructure as Code practices
- Help with deployments and system updates
- Improve monitoring and alerting systems
- Optimize performance and reliability

### Documentation
- Improve technical documentation
- Create video tutorials and guides
- Write troubleshooting guides and runbooks
- Document new features and procedures

### Testing & QA
- Test new deployments and changes
- Verify service health and functionality
- Report issues clearly and thoroughly
- Help reproduce bugs for debugging

### On-Call Support
- Be available for production incidents
- Help debug urgent issues when they arise
- Coordinate with team on fixes and solutions

### Even Small Contributions Help
- Review pull requests and provide feedback
- Update documentation as things change
- Improve scripts and automation
- Test changes locally before deployment

---

## 17. Career Development Opportunities

### Marketable Skills Learned
Working on this infrastructure provides valuable experience with technologies that companies pay six-figure salaries for:

**Core Infrastructure Skills**:
- Infrastructure as Code (Pulumi/Terraform)
- Container Orchestration (Docker Swarm/Kubernetes)
- Secrets Management (Vault, Doppler)
- Reverse Proxy & Load Balancing (Traefik)
- Database Administration (PostgreSQL, Redis, Neo4j)
- Message Queues (RabbitMQ)
- Monitoring & Observability (Grafana, Loki, InfluxDB)
- DevOps Best Practices
- Production System Debugging
- Distributed Systems Architecture

**Career Value**: These skills are highly marketable and form the foundation of modern DevOps and infrastructure engineering roles.

---

## 18. Path Forward: Next Steps

### Short Term (Next 3 Months)
1. Stabilize current production deployment
2. Set up proper monitoring and alerting systems
3. Create on-call rotation (need volunteers!)
4. Document common issues and solutions

### Medium Term (Next 6 Months)
1. Build infrastructure team (ongoing effort)
2. Train new volunteers on the system
3. Improve automation and tooling
4. Reduce dependency on single individuals

### Long Term (Next Year)
1. Consider managed service alternatives
2. Evaluate if Kubernetes simplifies operations
3. Build a sustainable operations team
4. Ensure no single point of failure (human or technical)

---

## 19. How to Get Involved

### Contact Information
- Talk to team members after sessions and meetings
- Join #infrastructure channel on Discord
- Attend weekly infrastructure meetings
- Review documentation and ask questions

### What We're Looking For
- Curiosity and willingness to learn new technologies
- Time commitment (even just a few hours per month helps)
- Interest in DevOps and infrastructure topics
- Team players who communicate well and collaborate effectively

### What You'll Get
- Valuable hands-on experience with production systems
- Mentorship from experienced engineers
- Resume-worthy projects and achievements
- The satisfaction of keeping the community alive and thriving

---

## 20. Common Questions and Answers

**Q: Why is it so complicated?**
A: Modern gaming platforms require this distributed architecture. We're running at scale with thousands of users and complex integration requirements.

**Q: Why did it take so long to recover?**
A: Because we had no team, no process, and no budget for infrastructure. When everything broke, we had to start from scratch without proper preparation.

**Q: What happens if the people with knowledge leave?**
A: That's exactly why we're building a team. No single person should be critical infrastructure. We need distributed knowledge and redundancy.

**Q: How much time commitment are we talking about?**
A: Flexible commitment. Even 2-4 hours a month helps significantly. More is better, but something is better than nothing.

**Q: I don't know Docker/Kubernetes/Pulumi - can I still help?**
A: Yes! We need documentation, testing, and QA work too. And we can teach you the technical stuff as you get more involved.

---

## 21. Key Takeaways

### What You Need to Remember
1. **Your platform was dead.** We recovered it through an emergency volunteer effort that revealed serious organizational gaps and vulnerabilities.

2. **This system is complex** because running a modern gaming platform at scale IS complex. We're simplifying where we can, but some complexity is inherent.

3. **We need to build sustainable processes.** Volunteers are essential, but we need structure and processes, not heroic emergency efforts.

4. **This is an opportunity** to learn valuable skills while helping your community build something that lasts and grows.

5. **Without systemic changes**, we risk repeating this cycle when the next crisis inevitably hits.

---

## 22. Resources and Documentation

### Technical Documentation
Most documentation is available in the [MLE Staff Knowledge Base](https://minor-league-esports.github.io/knowledgeBase/):
- Architecture guide and system overview
- Deployment guide with step-by-step instructions
- Operations runbook for common tasks
- Troubleshooting guide for issue resolution
- Postmortem with full timeline and lessons learned

### Code Repository
- GitHub: `github.com/SprocketBot/sprocket-infra` (infrastructure code)
- All Infrastructure as Code is open for review and contribution

### Communication Channels
- Discord: #infrastructure channel for discussions
- Weekly meetings: [Time/Day to be determined]
- GitHub Issues: For bug reports and feature requests

### Getting Started Guide
1. Read the available documentation
2. Join the development server (message mailbox for invite)
3. Attend a department meeting to meet the team
4. Pick a starter task to begin contributing
5. Ask questions constantly and learn by doing

---

## Conclusion

The Sprocket platform restoration represents both a significant technical achievement and a wake-up call for organizational preparedness. The emergency recovery effort demonstrated the dedication and capability of the community, but also highlighted the need for sustainable infrastructure practices and team building.

The path forward involves both stabilizing the current complex system and building a simpler, more maintainable future platform. Success requires transitioning from crisis response to sustainable operations, building a knowledgeable team, and creating proper processes and documentation.

The opportunity exists for community members to learn valuable skills while contributing to something meaningful. The infrastructure team needs volunteers at all skill levels, and the experience provides excellent career development opportunities in modern DevOps and infrastructure engineering.

Most importantly, this experience must serve as a catalyst for change to ensure that such a crisis never happens again. Building sustainable, maintainable infrastructure with proper team support and knowledge distribution is essential for the long-term survival and growth of the platform and community.

---

*This document serves as a comprehensive reference for the town hall presentation and provides detailed information for community members who want to understand the full scope of the infrastructure crisis, recovery effort, and path forward.*