# Changelog — elo-service (April 13–26, 2026)

## Summary

No changes were merged to elo-service `main` during this period. The most recent change to `main` was **Switch image publishing to GHCR** (PR #88, merged March 29).

Active development continues on the `dev` branch. The following work is in progress but not yet released:

### In Progress (on `dev` branch)
- **Dockerfile updates** — Updated Dockerfile configuration
- **Increased heap size** — package.json updated to use a larger Node.js heap size for salary calculations

### Recent Releases (for context)
- **GHCR image publishing** (PR #88, Mar 29) — Switched Docker image publishing from Docker Hub to GitHub Container Registry
- **GHCR branch tag sanitization** (PR #89, Mar 29) — Sanitized image tags for branch names to comply with GHCR naming requirements
