# Sprocket Infrastructure Documentation Package

**Created**: November 8, 2025
**Status**: Complete and Ready for Use
**Purpose**: Comprehensive documentation for the Sprocket infrastructure project

---

## 📦 What's in This Package

This documentation package contains everything needed to understand, deploy, operate, and maintain the Sprocket infrastructure. It was created as the culmination of an 8-week infrastructure rebuild project.

---

## 🎮 What is Sprocket?

**For Those New to the Project**

Sprocket is a comprehensive platform for competitive Rocket League esports leagues. It provides the infrastructure and tools to run organized competitive gaming leagues similar to traditional sports leagues.

### What Sprocket Does

**For Players**:
- **Register and Create Profiles**: Link gaming accounts (Epic Games, Steam, Xbox, PlayStation)
- **Join Leagues and Teams**: Find teams, join competitive leagues, track player stats
- **Compete in Matches**: Scheduled matches with proper matchmaking and rankings
- **Track Performance**: View statistics, ELO ratings, match history, and leaderboards
- **Integrate with Discord**: Receive notifications, submit scores, check schedules without leaving Discord

**For League Administrators**:
- **Manage Leagues**: Create seasons, configure rules, set match schedules
- **Matchmaking**: Automated team matching based on skill ratings
- **Results Processing**: Parse Rocket League replay files automatically, verify match results
- **Analytics**: Track league health, player engagement, match completion rates
- **Communication**: Automated Discord notifications for matches, results, and announcements

**For Spectators**:
- **Browse Matches**: View upcoming and past matches
- **Player Stats**: Research players and team performance
- **Leaderboards**: See top-ranked players and teams
- **Match Replays**: Download and watch competitive match replays

### The Business Value

**Problem Sprocket Solves**:
Before Sprocket, running a Rocket League league required:
- Manual player registration and team management (spreadsheets)
- Manual match scheduling and coordination (Discord messages)
- Manual result verification (watching replays, checking screenshots)
- Manual stat tracking (spreadsheets and databases)
- Fragmented tools (different systems for each task)

**Sprocket's Solution**:
- **All-in-one Platform**: Single integrated system for everything
- **Automation**: Replay parsing, matchmaking, notifications handled automatically
- **Discord Integration**: 70% of interactions happen via Discord bot (where players already are)
- **Scalability**: Support hundreds of players across multiple leagues simultaneously
- **Data-Driven**: Analytics and insights for league administrators

### The Tech Stack (Simplified)

**Frontend** (What users see):
- Web application built with Next.js (React)
- Discord bot for in-Discord interactions
- GraphQL API for data access

**Backend** (What makes it work):
- Microservices architecture (small, specialized services)
- PostgreSQL database (player data, matches, teams, stats)
- Redis cache (fast data access, reduce database load)
- RabbitMQ message queue (asynchronous processing)
- S3 storage (replay files, generated images)

**Infrastructure** (What this documentation is about):
- Docker Swarm (container orchestration)
- Traefik (reverse proxy, routing, HTTPS)
- Vault (secrets management)
- Grafana/InfluxDB (monitoring and metrics)
- Digital Ocean (hosting provider)

### Current Scale

As of November 2025:
- **Users**: Hundreds of active players
- **Concurrent Users**: <1,000 (current capacity)
- **Matches**: Thousands of matches recorded
- **Uptime**: 99.9%+ (less than 9 hours downtime per year)
- **Response Time**: <500ms for most requests
- **Cost**: $131/month infrastructure

### Who Uses Sprocket?

**Primary Audience**:
- Competitive Rocket League players looking for organized leagues
- League administrators running community tournaments
- Team captains managing rosters and schedules

**Geographic Distribution**:
- Primarily North American players
- Some European players
- Global community via Discord

### Why This Documentation Exists

**The Context**:
In September 2025, the Sprocket infrastructure was in a fragile state:
- Manual deployment processes
- Frequent downtime
- Difficult to maintain
- Missing critical services
- No disaster recovery plan

**The Solution**:
Over 8 weeks (September 14 - November 8, 2025), we:
1. Completely rebuilt the infrastructure from scratch
2. Adopted Infrastructure as Code (Pulumi)
3. Implemented proper secrets management (Vault)
4. Set up comprehensive monitoring (Grafana, InfluxDB)
5. Documented everything (this package)

**The Result**:
- 99.9%+ uptime
- ~6 hour recovery time (vs. days/weeks before)
- Repeatable deployments
- Comprehensive documentation
- Team can confidently operate and maintain the platform

This documentation package is that knowledge captured - everything needed to understand, deploy, operate, and maintain Sprocket's infrastructure.

---

## 📚 Documentation Files

### 1. POSTMORTEM.md (41 KB)
**The complete project story from start to finish**

**What's Inside**:
- Executive summary of the 8-week rebuild
- Detailed timeline (September 14 - November 8, 2025)
- Six major phases of the project
- Deep dives into the 7 biggest technical challenges
- Architecture evolution (before/after)
- Key decisions and their rationale
- What went well and what could be better
- Lessons learned for future projects
- 20+ recommendations

**Best For**:
- Understanding the "why" behind architectural decisions
- Learning from mistakes and successes
- New team members getting up to speed
- Planning similar infrastructure projects

**Time to Read**: 45-60 minutes

**Key Takeaways**:
- Use managed services for critical infrastructure
- Design for production first, add dev overrides later
- Automate secret provisioning to reduce human error
- Document decisions when making them, not after
- Git history is invaluable for understanding evolution

---

### 2. ARCHITECTURE.md (52 KB)
**Complete architecture reference and design documentation**

**What's Inside**:
- High-level architecture overview with diagrams
- Three-layer architecture detailed breakdown
  - Layer 1: Infrastructure (Traefik, Vault, Socket Proxy)
  - Layer 2: Data Services (Redis, RabbitMQ, InfluxDB, etc.)
  - Platform: Application Services (Web, API, Bot, Microservices)
- Network topology (5 overlay networks)
- Complete service catalog (22 services)
- Data flow diagrams
- Security architecture
- Scalability considerations
- Future architectural improvements

**Best For**:
- Understanding how everything fits together
- Troubleshooting connectivity issues
- Planning infrastructure changes
- Onboarding new developers
- Architecture reviews

**Time to Read**: 60-90 minutes

**Contains**:
- 7 ASCII diagrams
- 22 service descriptions
- Network topology maps
- Security architecture details
- Scaling strategies

---

### 3. DEPLOYMENT_GUIDE.md (64 KB)
**Step-by-step guide to deploy from scratch**

**What's Inside**:
- Complete prerequisites checklist
- Pre-deployment configuration (all 6 external dependencies)
- Layer-by-layer deployment instructions
  - Layer 1: Traefik, Vault, Socket Proxy
  - Secret provisioning via Vault
  - Layer 2: All data services
  - Platform: All application services
- Verification procedures (automated + manual)
- Comprehensive troubleshooting section
- Rollback procedures

**Best For**:
- First-time deployment
- Disaster recovery
- Setting up staging environment
- Understanding deployment flow
- Training new ops team members

---

### 4. CICD_STRATEGY.md
**How to stop deploying by cloning the repo onto the production node**

**What's Inside**:
- Analysis of the current manual deployment process
- Recommended CI/CD target architecture
- Comparison of hosted runner, self-hosted runner, and dedicated deploy runner approaches
- Phased migration plan from manual deploys to approved automated applies
- Guidance on secrets, approvals, and first implementation milestone

**Best For**:
- Planning infrastructure automation work
- Deciding how to connect GitHub Actions to Pulumi and Docker Swarm
- Reducing deployment risk without rewriting the platform

**Time to Read**: 15-20 minutes

**Time to Complete**: 4-6 hours (first time), 2-3 hours (experienced)

**Includes**:
- 15+ code examples
- Expected outputs for each step
- 6 common issue resolutions
- Emergency rollback procedures

---

### 4. OPERATIONS_RUNBOOK.md (48 KB)
**Day-to-day operations manual**

**What's Inside**:
- Daily operations (morning health check)
- Weekly review procedures
- Service management (start, stop, restart, update, rollback)
- Monitoring & alerting setup
- Backup & recovery procedures
  - Database backups (automated + manual)
  - Vault backups
  - Pulumi state backups
  - Disaster recovery testing
- Scaling operations (vertical + horizontal)
- Security operations (secret rotation, access review)
- Incident response (P0-P3 severity levels)
- Maintenance procedures
- Common tasks reference

**Best For**:
- Daily operations
- On-call engineers
- Incident response
- Maintenance planning
- Training new ops team members

**Time to Read**: 90-120 minutes (reference document, read sections as needed)

**Contains**:
- Daily checklist (10 minutes)
- Weekly review checklist (30 minutes)
- 20+ operational procedures
- Incident response playbook
- Emergency contacts template

---

### 5. CONTEXT_SUMMARY.md (10 KB)
**Quick reference for current state**

**What's Inside**:
- Current deployment status
- Architecture overview
- Key infrastructure decisions
- Critical external dependencies
- Configuration reference
- Major service listing
- Known issues and gotchas

**Best For**:
- Quick orientation
- Reference during troubleshooting
- Understanding current state

**Time to Read**: 15-20 minutes

---

### 6. TECHNICAL_CHALLENGES.md (17 KB)
**Detailed problem/solution analysis**

**What's Inside**:
- 7 major technical challenges with detailed analysis
- Evolution of solutions through commits
- Patterns and best practices discovered
- "What we'd do differently" section
- Critical success factors

**Best For**:
- Learning from past issues
- Troubleshooting similar problems
- Understanding why things are done a certain way

**Time to Read**: 30-45 minutes

---

### 7. GIT_HISTORY_ANALYSIS.md (12 KB)
**Commit-by-commit journey**

**What's Inside**:
- Complete timeline from Sept 14 to Nov 8, 2025
- Commit-by-commit breakdown by phase
- Key patterns in commit history
- Commit message quality analysis
- Timeline visualization
- Git best practices learned

**Best For**:
- Understanding project evolution
- Learning from iteration
- Seeing what was tried and failed

**Time to Read**: 20-30 minutes

---

### 8. EXTERNALITIES_AND_DEPENDENCIES.md (16 KB)
**External systems documentation**

**What's Inside**:
- 6 critical external dependencies
  - Doppler (secrets management)
  - GitHub Organization (Vault auth)
  - Digital Ocean (database, storage)
  - DNS Provider (Let's Encrypt)
  - Pulumi Backend (state management)
  - Docker Hub (private images)
- Required CLI tools
- Network requirements
- Complete access checklist
- Dependency graph
- Cost considerations
- Security considerations
- Disaster recovery for external dependencies

**Best For**:
- Setting up new deployment
- Understanding prerequisites
- Cost planning
- Access provisioning

**Time to Read**: 25-35 minutes

---

## 🗺️ How to Use This Documentation

### For New Team Members
**Recommended Reading Order**:
1. **START HERE** ← You are here!
2. `CONTEXT_SUMMARY.md` (15 min) - Get oriented
3. `ARCHITECTURE.md` (60 min) - Understand the system
4. `POSTMORTEM.md` (45 min) - Learn the history
5. `DEPLOYMENT_GUIDE.md` (skim) - Know how to deploy
6. `OPERATIONS_RUNBOOK.md` (skim) - Know where to look for ops tasks

**Total Time**: ~2-3 hours of focused reading

### For Deployment
**Reading Order**:
1. `EXTERNALITIES_AND_DEPENDENCIES.md` - Verify prerequisites
2. `DEPLOYMENT_GUIDE.md` - Follow step-by-step
3. `OPERATIONS_RUNBOOK.md` - Post-deployment verification

**Total Time**: 4-6 hours (includes deployment)

### For Operations
**Daily Reference**:
1. `OPERATIONS_RUNBOOK.md` - Daily checklist and procedures
2. `TECHNICAL_CHALLENGES.md` - When troubleshooting
3. `ARCHITECTURE.md` - When understanding connectivity

### For Planning/Decision Making
**Reading Order**:
1. `POSTMORTEM.md` - Learn from past decisions
2. `ARCHITECTURE.md` - Understand current state
3. `EXTERNALITIES_AND_DEPENDENCIES.md` - Understand constraints

### For Troubleshooting
**Quick Reference**:
1. `OPERATIONS_RUNBOOK.md` → Incident Response section
2. `TECHNICAL_CHALLENGES.md` → Similar issues
3. `DEPLOYMENT_GUIDE.md` → Troubleshooting section
4. `ARCHITECTURE.md` → Service catalog

---

## 📊 Documentation Statistics

**Total Documentation**: ~250 KB, 1,800+ lines
**Total Pages**: ~150 pages (if printed)
**Total Diagrams**: 12 ASCII diagrams
**Code Examples**: 100+ code blocks
**Time to Create**: ~8 hours of focused work
**Based On**:
- 20+ commits analyzed
- 8 weeks of project history
- 70+ files in codebase
- 22 deployed services

---

## 🎯 Documentation Goals Achieved

- ✅ **Comprehensive Postmortem**: Complete project story with lessons learned
- ✅ **Architecture Documentation**: Detailed system design and rationale
- ✅ **Deployment Guide**: Step-by-step instructions for rebuild
- ✅ **Operations Runbook**: Day-to-day operational procedures
- ✅ **All diagrams in text**: ASCII diagrams work in all editors
- ✅ **Self-contained**: No external dependencies
- ✅ **Ready for MkDocs**: Can be imported into documentation site

---

## 📝 What's NOT in This Package

**Intentionally Excluded**:
- Actual secrets or credentials (see Doppler/Vault)
- Proprietary business logic
- Application code documentation (separate repo)
- Automated runbooks/scripts (see main repo)
- Screenshots (text-based documentation only)

**Future Additions** (recommended):
- MkDocs site with search
- Interactive architecture diagrams
- Video walkthroughs
- Automated runbook scripts
- Prometheus/Grafana dashboard configs

---

## 🔄 How to Keep This Updated

### When to Update

**Update Documentation When**:
- Major architecture changes
- New services added
- External dependencies change
- Lessons learned from incidents
- Deployment procedures change
- New operational procedures

### How to Update

1. **Edit Markdown Files**: All docs are standard Markdown
2. **Keep Diagrams Simple**: Use ASCII art for diagrams
3. **Update Version Numbers**: Update "Last Updated" dates
4. **Test Procedures**: Verify accuracy before publishing
5. **Commit Changes**: Use git for version control

### Document Ownership

| Document | Owner | Review Cycle |
|----------|-------|--------------|
| POSTMORTEM.md | Team Lead | After major milestones |
| ARCHITECTURE.md | Architect | Quarterly |
| DEPLOYMENT_GUIDE.md | Ops Lead | After any deployment changes |
| OPERATIONS_RUNBOOK.md | Ops Team | Monthly |
| Other docs | Team Lead | Quarterly |

---

## 🚀 Next Steps

### Immediate (Within 1 Week)
1. ✅ Review all documentation
2. ✅ Share with team
3. ✅ Add to team wiki/knowledge base
4. ✅ Create MkDocs site (optional)

### Short-term (Within 1 Month)
5. 📝 Add screenshots/diagrams to MkDocs
6. 📝 Create video walkthrough of deployment
7. 📝 Test deployment guide with new team member
8. 📝 Create quick reference card

### Long-term (Within 3 Months)
9. 📝 Automate documentation updates
10. 📝 Add interactive elements
11. 📝 Create disaster recovery playbook
12. 📝 Document advanced troubleshooting

---

## 💡 How to Import into MkDocs

```bash
# 1. Create MkDocs project
pip install mkdocs mkdocs-material
mkdocs new sprocket-docs
cd sprocket-docs

# 2. Copy documentation
mkdir -p docs/postmortem docs/architecture docs/deployment docs/operations docs/reference
cp ../sprocket-infra/docs-output/POSTMORTEM.md docs/postmortem/index.md
cp ../sprocket-infra/docs-output/ARCHITECTURE.md docs/architecture/index.md
cp ../sprocket-infra/docs-output/DEPLOYMENT_GUIDE.md docs/deployment/index.md
cp ../sprocket-infra/docs-output/OPERATIONS_RUNBOOK.md docs/operations/index.md
cp ../sprocket-infra/docs-output/TECHNICAL_CHALLENGES.md docs/reference/challenges.md
cp ../sprocket-infra/docs-output/GIT_HISTORY_ANALYSIS.md docs/reference/history.md
cp ../sprocket-infra/docs-output/EXTERNALITIES_AND_DEPENDENCIES.md docs/reference/dependencies.md
cp ../sprocket-infra/docs-output/CONTEXT_SUMMARY.md docs/index.md

# 3. Configure mkdocs.yml (see TRANSFER_INSTRUCTIONS.md)

# 4. Serve locally
mkdocs serve

# 5. Build for deployment
mkdocs build

# 6. Deploy to GitHub Pages or hosting
mkdocs gh-deploy
```

---

## 📞 Questions or Issues?

If you have questions about this documentation:

1. **Check the specific document** - Each has detailed sections
2. **Review TECHNICAL_CHALLENGES.md** - Common issues documented
3. **Ask the team** - #infrastructure Slack channel
4. **Update the docs** - Found something missing? Add it!

---

## 🎉 Acknowledgments

This documentation package represents:
- **8 weeks** of infrastructure work
- **20+ commits** analyzed
- **Months** of learning and iteration
- **Countless hours** of debugging and problem-solving

Special thanks to the entire team for their persistence and dedication to getting this infrastructure to production.

---

## 📄 License & Usage

This documentation is for internal use by the Sprocket team and authorized personnel.

**Do Not Share**:
- Connection strings
- Credentials
- API tokens
- Internal IPs
- Proprietary architecture details

**OK to Share**:
- General architecture patterns
- Lessons learned
- Best practices
- Problem-solving approaches

---

**Documentation Package Version**: 1.0
**Created**: November 8, 2025
**Status**: ✅ Complete and Production-Ready
**Next Review**: February 2026

---

*Happy deploying! 🚀*
