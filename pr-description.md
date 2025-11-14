# PR Title: Migrate Matchmaking Service to Core Application

## Description

This PR migrates the matchmaking service functionality from a standalone microservice into the core application, consolidating the queue management and scrim handling systems.

### Key Changes

**Service Migration:**
- Moved matchmaking service from `services/matchmaking/` to `core/src/matchmaking/`
- Migrated queue management, scrim handling, and timeout services into core
- Integrated database entities for scrim, scrim_queue, and scrim_timeout

**Queue System Implementation:**
- Added comprehensive queue API with GraphQL resolvers
- Implemented queue service with performance and integration tests
- Created queue worker for handling queue operations
- Added queue module with proper dependency injection

**Database & API:**
- Created database migrations for scrim queue and timeout tables
- Added GraphQL queue resolver with full test coverage
- Updated scrim service to work with new queue integration
- Enhanced scrim resolver with queue functionality

**Testing & Documentation:**
- Added extensive test suites for queue operations (performance, integration, unit)
- Created comprehensive queue manual testing documentation
- Added migration guide documentation

### Technical Summary
- **Files Changed:** 76 files
- **Insertions:** 8,725 lines
- **Deletions:** 4,469 lines
- **Net Change:** +4,256 lines

This migration consolidates matchmaking functionality into the core application while maintaining all existing queue and scrim management capabilities.