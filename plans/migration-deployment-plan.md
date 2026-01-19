# Cross-Franchise Ratification Migration & Deployment Plan

## Executive Summary

This document outlines the complete migration and deployment strategy for implementing cross-franchise ratification validation across the Sprocket system. The plan ensures zero downtime, maintains backward compatibility, and provides rollback capabilities while enhancing the ratification system to prevent both votes from coming from the same franchise.

## Current System Analysis

### Existing Architecture
- **Data Storage**: Redis JSON with [`ratifiers: number[]`](common/src/service-connectors/submission/types/replay-submission.ts:30)
- **Validation Logic**: [`canRatifySubmission()`](microservices/submission-service/src/replay-submission/replay-submission-util.service.ts:111) - basic eligibility only
- **Submission Types**: Match, Scrim, LFS with varying validation rules
- **Required Ratifications**: Configurable per organization, typically 2

### Pain Points
- No franchise-based validation beyond basic membership check
- Both ratifications can come from same franchise
- Limited error context for validation failures
- No tracking of which franchise each ratifier represents

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)

#### Objectives
- Deploy new data structures without breaking existing functionality
- Establish dual-write pattern for backward compatibility
- Create feature flags for controlled rollout
- Set up monitoring and alerting infrastructure

#### Technical Implementation

**1. Database Schema Evolution**
```typescript
// Migration 1: Add enhanced fields to Redis schema
interface SubmissionMigrationV1 {
    // Existing fields remain unchanged
    ratifiers: number[]; // Legacy field - maintained for compatibility
    
    // New enhanced fields
    enhancedRatifiers: RatifierInfo[];
    franchiseValidation: {
        homeFranchiseId?: number;
        awayFranchiseId?: number;
        requiredFranchises: number;
        currentFranchiseCount: number;
        franchiseIds: number[];
        enabled: boolean; // Feature flag
    };
}
```

**2. Feature Flag Configuration**
```typescript
// Organization-level configuration
interface CrossFranchiseValidationConfig {
    enabled: boolean;
    strictMode: boolean; // Enforce cross-franchise for all matches
    allowOverride: boolean; // Admin override capability
    errorOnDuplicate: boolean; // Fail or warn on duplicate franchise
    supportedSubmissionTypes: ReplaySubmissionType[];
}
```

**3. Dual-Write Implementation**
```typescript
// Enhanced CRUD service with dual-write pattern
class EnhancedSubmissionCrudService {
    
    async addRatifier(submissionId: string, playerId: number): Promise<void> {
        // Legacy write - maintains backward compatibility
        await this.legacyAddRatifier(submissionId, playerId);
        
        // Enhanced write - only if feature enabled
        const config = await this.getOrganizationConfig(submissionId);
        if (config.crossFranchiseValidation.enabled) {
            await this.enhancedAddRatifier(submissionId, playerId);
        }
    }
    
    private async enhancedAddRatifier(submissionId: string, playerId: number): Promise<void> {
        const franchiseInfo = await this.getPlayerFranchiseInfo(playerId, submissionId);
        const ratifierInfo: RatifierInfo = {
            playerId,
            franchiseId: franchiseInfo.id,
            franchiseName: franchiseInfo.name,
            ratifiedAt: new Date().toISOString()
        };
        
        await this.redisService.appendToJsonArray(
            getSubmissionKey(submissionId), 
            "enhancedRatifiers", 
            ratifierInfo
        );
        
        await this.updateFranchiseValidationContext(submissionId);
    }
}
```

#### Deployment Steps
1. **Week 1 Day 1-2**: Deploy new type definitions and schemas
2. **Week 1 Day 3-4**: Implement dual-write CRUD operations
3. **Week 1 Day 5**: Deploy feature flag system
4. **Week 2 Day 1-3**: Test dual-write pattern in staging
5. **Week 2 Day 4-5**: Production deployment with feature flags disabled

#### Success Criteria
- No breaking changes to existing API contracts
- All existing submissions continue to function
- New fields are optional in GraphQL schemas
- Redis performance remains within 5% of baseline

### Phase 2: Validation Logic Enhancement (Weeks 3-4)

#### Objectives
- Implement cross-franchise validation logic
- Deploy enhanced error handling
- Enable feature flags for pilot organizations
- Monitor validation success rates

#### Technical Implementation

**1. Enhanced Validation Service**
```typescript
// Gradual rollout with organization-based feature flags
class CrossFranchiseValidationService {
    
    async validateCrossFranchiseRatification(
        submissionId: string,
        playerId: number,
        memberId: number
    ): Promise<CrossFranchiseValidationResult> {
        
        // Check if feature is enabled for this organization
        const config = await this.getOrganizationConfig(submissionId);
        if (!config.crossFranchiseValidation.enabled) {
            return { valid: true }; // Bypass validation if disabled
        }
        
        // Check for admin override
        if (await this.hasAdminOverride(memberId)) {
            return { valid: true, override: true };
        }
        
        // Perform enhanced validation
        return await this.performCrossFranchiseValidation(submissionId, playerId, memberId);
    }
    
    private async performCrossFranchiseValidation(
        submissionId: string,
        playerId: number,
        memberId: number
    ): Promise<CrossFranchiseValidationResult> {
        
        const submission = await this.getSubmission(submissionId);
        const playerFranchises = await this.getPlayerFranchises(memberId);
        
        // Determine submission context
        const context = await this.getSubmissionFranchiseContext(submissionId);
        
        // Check franchise eligibility
        const eligibleFranchise = this.getEligibleFranchise(playerFranchises, context);
        if (!eligibleFranchise) {
            return {
                valid: false,
                reason: this.getFranchiseIneligibilityMessage(context),
                errorCode: "NOT_ON_FRANCHISE"
            };
        }
        
        // Check for duplicate franchise ratification
        const existingFranchises = this.getExistingFranchiseIds(submission);
        if (existingFranchises.has(eligibleFranchise.id)) {
            return {
                valid: false,
                reason: `Your franchise (${eligibleFranchise.name}) has already ratified this submission`,
                errorCode: "FRANCHISE_ALREADY_RATIFIED",
                context: {
                    existingRatifiers: this.getExistingRatifiersForFranchise(submission, eligibleFranchise.id),
                    franchiseName: eligibleFranchise.name
                }
            };
        }
        
        return {
            valid: true,
            franchise: eligibleFranchise,
            context: {
                uniqueFranchises: existingFranchises.size + 1,
                requiredFranchises: context.requiredFranchises
            }
        };
    }
}
```

**2. Enhanced Error Handling**
```typescript
// User-friendly error messages with actionable guidance
const CROSS_FRANCHISE_ERROR_MESSAGES = {
    NOT_ON_FRANCHISE: (homeTeam: string, awayTeam: string) => ({
        message: `You must be a member of either ${homeTeam} or ${awayTeam} to ratify this match.`,
        guidance: `If you believe this is an error, please contact your franchise administrator to verify your team membership.`,
        action: "CONTACT_ADMIN"
    }),
    
    FRANCHISE_ALREADY_RATIFIED: (franchiseName: string) => ({
        message: `Your franchise (${franchiseName}) has already ratified this submission.`,
        guidance: `Please wait for a player from the opposing franchise to ratify, or contact an administrator if urgent.`,
        action: "WAIT_FOR_OPPOSITION"
    }),
    
    INSUFFICIENT_FRANCHISE_DIVERSITY: (current: number, required: number) => ({
        message: `This submission requires ratification from ${required} different franchises. Currently ${current} have ratified.`,
        guidance: `Please coordinate with players from the opposing franchise to complete ratification.`,
        action: "COORDINATE_OPPOSITION"
    })
};
```

#### Deployment Steps
1. **Week 3 Day 1-2**: Deploy enhanced validation service
2. **Week 3 Day 3-4**: Update error handling and user messages
3. **Week 3 Day 5**: Enable feature flags for pilot organizations (10%)
4. **Week 4 Day 1-3**: Monitor and collect feedback
5. **Week 4 Day 4-5**: Expand to 25% of organizations

#### Success Criteria
- Validation accuracy > 99%
- User error resolution rate > 80%
- No increase in support tickets
- Performance impact < 10% latency increase

### Phase 3: Full Feature Rollout (Weeks 5-6)

#### Objectives
- Enable cross-franchise validation for all organizations
- Complete data migration for existing submissions
- Remove backward compatibility code
- Establish new baseline performance

#### Technical Implementation

**1. Data Migration Service**
```typescript
// Automated migration for existing submissions
class RatificationDataMigrationService {
    
    async migrateOrganizationSubmissions(organizationId: number): Promise<MigrationResult> {
        const submissions = await this.getOrganizationSubmissions(organizationId);
        const results: MigrationResult = {
            total: submissions.length,
            successful: 0,
            failed: 0,
            skipped: 0
        };
        
        for (const submission of submissions) {
            try {
                const migrationResult = await this.migrateSubmission(submission);
                
                if (migrationResult.status === "success") {
                    results.successful++;
                } else if (migrationResult.status === "skipped") {
                    results.skipped++;
                } else {
                    results.failed++;
                    this.logger.error(`Failed to migrate submission ${submission.id}:`, migrationResult.error);
                }
                
            } catch (error) {
                results.failed++;
                this.logger.error(`Unexpected error migrating submission ${submission.id}:`, error);
            }
        }
        
        return results;
    }
    
    private async migrateSubmission(submission: ReplaySubmission): Promise<SubmissionMigrationResult> {
        
        // Skip if already migrated
        if (this.isAlreadyMigrated(submission)) {
            return { status: "skipped" };
        }
        
        // Get franchise context for the submission
        const franchiseContext = await this.getSubmissionFranchiseContext(submission);
        
        // Enhance existing ratifiers with franchise information
        const enhancedRatifiers: RatifierInfo[] = [];
        
        for (const playerId of submission.ratifiers) {
            try {
                const franchiseInfo = await this.getPlayerFranchiseInfo(playerId, submission);
                if (franchiseInfo) {
                    enhancedRatifiers.push({
                        playerId,
                        franchiseId: franchiseInfo.id,
                        franchiseName: franchiseInfo.name,
                        ratifiedAt: this.estimateRatificationTimestamp(submission, playerId)
                    });
                }
            } catch (error) {
                this.logger.warn(`Could not determine franchise for player ${playerId} in submission ${submission.id}`);
                // Use placeholder information
                enhancedRatifiers.push({
                    playerId,
                    franchiseId: -1,
                    franchiseName: "Unknown",
                    ratifiedAt: new Date().toISOString()
                });
            }
        }
        
        // Update submission with enhanced data
        await this.updateSubmissionWithEnhancedData(submission.id, {
            enhancedRatifiers,
            franchiseValidation: {
                homeFranchiseId: franchiseContext.homeFranchiseId,
                awayFranchiseId: franchiseContext.awayFranchiseId,
                requiredFranchises: franchiseContext.requiredFranchises,
                currentFranchiseCount: this.getUniqueFranchiseCount(enhancedRatifiers),
                franchiseIds: this.getUniqueFranchiseIds(enhancedRatifiers)
            }
        });
        
        return { status: "success" };
    }
    
    private estimateRatificationTimestamp(submission: ReplaySubmission, playerId: number): string {
        // Estimate based on submission timeline and existing data
        const baseDate = new Date(submission.createdAt || Date.now());
        const playerIndex = submission.ratifiers.indexOf(playerId);
        const estimatedDelay = playerIndex * 5 * 60 * 1000; // 5 minutes between ratifications
        
        return new Date(baseDate.getTime() + estimatedDelay).toISOString();
    }
}
```

**2. Cleanup and Optimization**
```typescript
// Remove backward compatibility code
class CleanupService {
    
    async removeLegacyFields(): Promise<void> {
        // Remove legacy ratifiers array after successful migration
        const submissions = await this.getMigratedSubmissions();
        
        for (const submission of submissions) {
            await this.redisService.deleteJsonField(
                getSubmissionKey(submission.id),
                "ratifiers" // Legacy field
            );
        }
    }
    
    async optimizeRedisStorage(): Promise<void> {
        // Compact Redis storage after migration
        await this.redisService.sendCommand("MEMORY PURGE");
        
        // Update TTL for enhanced data
        await this.updateEnhancedDataTTL();
    }
}
```

#### Deployment Steps
1. **Week 5 Day 1-2**: Deploy data migration service
2. **Week 5 Day 3-4**: Migrate existing submissions (50% organizations)
3. **Week 5 Day 5**: Complete migration for all organizations
4. **Week 6 Day 1-3**: Remove backward compatibility code
5. **Week 6 Day 4-5**: Performance optimization and cleanup

#### Success Criteria
- Data migration completion > 99%
- Zero data loss during migration
- Performance returns to baseline levels
- All organizations successfully using enhanced validation

## Risk Mitigation Strategy

### Technical Risks

#### Risk 1: Performance Degradation
**Mitigation**:
- Implement Redis connection pooling
- Use Redis pipelining for bulk operations
- Add caching layer for franchise information
- Monitor response times with alerting

#### Risk 2: Data Migration Failures
**Mitigation**:
- Implement rollback mechanism for failed migrations
- Create backup of all data before migration
- Use idempotent migration operations
- Provide manual migration tools

#### Risk 3: Breaking Existing Functionality
**Mitigation**:
- Comprehensive regression testing
- Feature flags for instant rollback
- Canary deployments with monitoring
- Maintain backward compatibility during transition

### Operational Risks

#### Risk 1: User Confusion
**Mitigation**:
- Clear error messages with actionable guidance
- In-app notifications about new validation rules
- Updated documentation and help content
- Training materials for administrators

#### Risk 2: Support Ticket Increase
**Mitigation**:
- Proactive communication about changes
- FAQ section for common issues
- Enhanced admin override capabilities
- Support team training on new validation

#### Risk 3: Edge Case Failures
**Mitigation**:
- Comprehensive edge case testing
- Admin override for exceptional situations
- Fallback to legacy validation if needed
- Continuous monitoring and adjustment

## Monitoring and Alerting

### Key Performance Indicators (KPIs)

#### System Performance
- **Validation Response Time**: < 500ms average
- **Redis Operation Latency**: < 50ms p99
- **API Success Rate**: > 99.9%
- **Migration Progress**: > 99% completion

#### User Experience
- **Validation Success Rate**: > 95%
- **Error Resolution Rate**: > 80%
- **User Satisfaction**: > 4.0/5.0
- **Support Ticket Volume**: < 5% increase

#### Business Metrics
- **Cross-Franchise Validation**: > 90% compliance
- **Fair Representation**: Both franchises represented in > 95% of matches
- **System Integrity**: Zero validation bypasses

### Alerting Thresholds

#### Critical Alerts
- Validation service unavailable
- Redis connection failures
- Migration service errors
- Data consistency violations

#### Warning Alerts
- Validation success rate < 90%
- Response time > 1000ms
- Error rate > 5%
- Support ticket increase > 10%

## Communication Plan

### Internal Communication
- **Development Team**: Technical specifications and progress updates
- **Operations Team**: Deployment procedures and monitoring requirements
- **Support Team**: Common issues and resolution procedures
- **Management**: Progress reports and risk assessments

### External Communication
- **Organization Administrators**: Feature announcements and training
- **End Users**: In-app notifications about new validation rules
- **Community**: Release notes and feature documentation

## Post-Deployment Review

### Success Metrics Review
- Analyze KPI achievement against targets
- Review user feedback and satisfaction scores
- Assess system performance and stability
- Evaluate risk mitigation effectiveness

### Lessons Learned
- Document technical challenges and solutions
- Capture user experience insights
- Identify process improvements
- Update best practices documentation

### Future Enhancements
- Machine learning for fraud detection
- Enhanced analytics and reporting
- Mobile app integration
- Advanced override capabilities

This comprehensive migration and deployment plan ensures a smooth transition to cross-franchise ratification validation while maintaining system reliability and user satisfaction.