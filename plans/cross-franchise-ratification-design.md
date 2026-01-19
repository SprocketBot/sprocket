# Cross-Franchise Ratification Validation Design

## Problem Analysis

### Current System Issues
- **No franchise validation**: The system only checks if a player is on home/away franchise, not which specific franchise they represent
- **Duplicate franchise ratification**: Both ratification votes can come from the same franchise
- **Limited tracking**: Current [`ratifiers`](common/src/service-connectors/submission/types/replay-submission.ts:30) array only stores player IDs without franchise context

### Current Data Flow
1. Player submits replays → [`canSubmitReplays()`](microservices/submission-service/src/replay-submission/replay-submission-util.service.ts:35) validates franchise membership
2. Submission processed → moves to [`RATIFYING`](common/src/service-connectors/submission/types/replay-submission.ts:13) status
3. Players ratify → [`canRatifySubmission()`](microservices/submission-service/src/replay-submission/replay-submission-util.service.ts:111) validates basic eligibility
4. System accepts ratifications → [`ratifiers`](common/src/service-connectors/submission/types/replay-submission.ts:30) array grows
5. When [`requiredRatifications`](common/src/service-connectors/submission/types/replay-submission.ts:31) met → submission approved

## Enhanced Validation Architecture

### 1. Data Structure Changes

#### Enhanced Ratifier Information
```typescript
// New ratifier structure with franchise tracking
interface RatifierInfo {
    playerId: number;
    franchiseId: number;
    franchiseName: string;
    ratifiedAt: string;
}

// Enhanced submission interface
interface EnhancedBaseReplaySubmission {
    // ... existing fields
    ratifiers: RatifierInfo[];  // Replace number[] with enhanced structure
    franchiseValidation: {
        homeFranchiseId?: number;
        awayFranchiseId?: number;
        requiredFranchises: number;  // Usually 2 for matches
        currentFranchiseCount: number;
    };
}
```

#### Redis Storage Schema
```json
{
  "id": "submission-123",
  "ratifiers": [
    {
      "playerId": 456,
      "franchiseId": 789,
      "franchiseName": "Team Alpha",
      "ratifiedAt": "2024-01-19T17:46:00Z"
    }
  ],
  "franchiseValidation": {
    "homeFranchiseId": 789,
    "awayFranchiseId": 790,
    "requiredFranchises": 2,
    "currentFranchiseCount": 1
  }
}
```

### 2. Enhanced Validation Logic

#### Core Validation Service
```typescript
@Injectable()
export class CrossFranchiseValidationService {
    
    async validateFranchiseEligibility(
        submissionId: string,
        playerId: number,
        memberId: number
    ): Promise<FranchiseValidationResult> {
        
        const submission = await this.getSubmission(submissionId);
        const playerFranchises = await this.getPlayerFranchises(memberId);
        
        // Determine submission context
        const context = await this.getSubmissionContext(submissionId);
        
        // Validate based on submission type
        switch (submission.type) {
            case ReplaySubmissionType.MATCH:
                return this.validateMatchFranchise(submission, playerFranchises, context);
            case ReplaySubmissionType.SCRIM:
                return this.validateScrimFranchise(submission, playerFranchises, context);
            case ReplaySubmissionType.LFS:
                return this.validateLFSFranchise(submission, playerFranchises, context);
        }
    }
    
    private async validateMatchFranchise(
        submission: MatchReplaySubmission,
        playerFranchises: Franchise[],
        context: SubmissionContext
    ): Promise<FranchiseValidationResult> {
        
        // Get match franchises
        const matchResult = await this.coreService.send(
            CoreEndpoint.GetMatchBySubmissionId, 
            { submissionId: submission.id }
        );
        
        const { homeFranchise, awayFranchise } = matchResult.data;
        
        // Check if player is on either franchise
        const eligibleFranchise = playerFranchises.find(f => 
            f.id === homeFranchise?.id || f.id === awayFranchise?.id
        );
        
        if (!eligibleFranchise) {
            return {
                valid: false,
                reason: "You are not on either competing franchise"
            };
        }
        
        // Check for cross-franchise validation
        const existingRatifiers = submission.ratifiers;
        const existingFranchises = new Set(existingRatifiers.map(r => r.franchiseId));
        
        // If this franchise already ratified, reject
        if (existingFranchises.has(eligibleFranchise.id)) {
            return {
                valid: false,
                reason: `Your franchise (${eligibleFranchise.name}) has already ratified this submission`
            };
        }
        
        return {
            valid: true,
            franchise: eligibleFranchise
        };
    }
}
```

### 3. Validation Rules by Submission Type

#### Match Submissions
- **Requirement**: Ratifications must come from different franchises (home vs away)
- **Validation**: Check player is on either home or away franchise
- **Cross-validation**: Ensure no duplicate franchise ratification
- **Edge Cases**: 
  - If only one franchise has eligible ratifiers, allow single ratification
  - Handle matches where franchises might be the same (exhibitions)

#### Scrim Submissions  
- **Requirement**: Cross-team validation when teams are from different organizations
- **Validation**: Check player participated in the scrim
- **Cross-validation**: If scrim has clear team divisions, enforce cross-team ratification
- **Edge Cases**:
  - Mixed scrims with players from same organization
  - Round-robin scrims without clear team divisions

#### LFS (Looking For Scrims) Submissions
- **Requirement**: Similar to scrims but with more flexible validation
- **Validation**: Check player participation and team affiliation
- **Cross-validation**: Enforce cross-team when applicable

### 4. Enhanced Error Handling

#### User-Friendly Error Messages
```typescript
const FRANCHISE_VALIDATION_ERRORS = {
    NOT_ON_FRANCHISE: "You must be a member of one of the competing franchises to ratify this match.",
    FRANCHISE_ALREADY_RATIFIED: "Your franchise ({franchiseName}) has already ratified this submission. Please wait for a player from the opposing franchise to ratify.",
    INSUFFICIENT_FRANCHISE_DIVERSITY: "This submission requires ratification from both competing franchises. Currently only {currentFranchises} of {requiredFranchises} franchises have ratified.",
    NO_OPPOSING_FRANCHISE_RATIFIERS: "No players from the opposing franchise are available to ratify. Please contact an administrator.",
    SUBMISSION_TYPE_UNSUPPORTED: "Cross-franchise validation is not supported for this submission type.",
    FRANCHISE_INFO_UNAVAILABLE: "Unable to retrieve franchise information. Please try again later."
};
```

#### Error Context and Logging
```typescript
interface ValidationErrorContext {
    submissionId: string;
    playerId: number;
    memberId: number;
    submissionType: ReplaySubmissionType;
    existingRatifiers: RatifierInfo[];
    playerFranchises: Franchise[];
    requiredFranchises: string[];
    errorCode: string;
}

// Enhanced logging for debugging
this.logger.warn(`Cross-franchise validation failed`, {
    context: errorContext,
    timestamp: new Date().toISOString()
});
```

### 5. Migration Strategy

#### Phase 1: Backward Compatibility (Week 1-2)
- Deploy new data structures alongside existing ones
- Maintain dual-write pattern for ratifier data
- Add feature flag for cross-franchise validation
- Monitor and validate data consistency

#### Phase 2: Gradual Rollout (Week 3-4)
- Enable cross-franchise validation for new submissions only
- Provide admin override capabilities
- Collect metrics on validation success/failure rates
- Address edge cases and feedback

#### Phase 3: Full Migration (Week 5-6)
- Migrate existing submissions to new format
- Remove backward compatibility code
- Update all dependent services
- Archive old validation logic

#### Migration Scripts
```typescript
// Data migration service
@Injectable()
export class RatificationMigrationService {
    
    async migrateSubmission(submissionId: string): Promise<void> {
        const submission = await this.getLegacySubmission(submissionId);
        
        // Enhance existing ratifiers with franchise info
        const enhancedRatifiers = await Promise.all(
            submission.ratifiers.map(async (playerId) => {
                const franchiseInfo = await this.getPlayerFranchiseInfo(playerId, submission);
                return {
                    playerId,
                    franchiseId: franchiseInfo?.id,
                    franchiseName: franchiseInfo?.name,
                    ratifiedAt: new Date().toISOString() // Approximate timestamp
                };
            })
        );
        
        // Update submission with enhanced data
        await this.updateSubmissionWithEnhancedData(submissionId, {
            ratifiers: enhancedRatifiers,
            franchiseValidation: await this.buildFranchiseValidationContext(submission)
        });
    }
}
```

### 6. Redis Storage Considerations

#### Storage Optimization
- Use Redis JSON paths for efficient updates
- Implement TTL for temporary validation data
- Consider Redis streams for validation event tracking
- Plan for data expiration and cleanup

#### Performance Optimization
```typescript
// Cache franchise information
@Injectable()
export class FranchiseCacheService {
    private readonly franchiseCache = new Map<number, Franchise>();
    private readonly playerFranchiseCache = new Map<number, Franchise[]>();
    
    async getCachedPlayerFranchises(memberId: number): Promise<Franchise[]> {
        const cached = this.playerFranchiseCache.get(memberId);
        if (cached) return cached;
        
        const franchises = await this.coreService.send(
            CoreEndpoint.GetPlayerFranchises, 
            { memberId }
        );
        
        this.playerFranchiseCache.set(memberId, franchises.data);
        return franchises.data;
    }
}
```

### 7. Integration Points

#### Service Integration
- **Submission Service**: Enhanced validation in [`canRatifySubmission()`](microservices/submission-service/src/replay-submission/replay-submission-util.service.ts:111)
- **Core Service**: Franchise information retrieval
- **Matchmaking Service**: Scrim context for validation
- **Notification Service**: Enhanced error messaging

#### API Changes
```typescript
// Enhanced CanRatifySubmission response
interface EnhancedCanRatifySubmissionResponse {
    canRatify: boolean;
    reason?: string;
    franchiseInfo?: {
        eligibleFranchise: Franchise;
        existingFranchises: Franchise[];
        requiredFranchises: number;
    };
}
```

### 8. Monitoring and Analytics

#### Key Metrics
- Cross-franchise validation success rate
- Franchise diversity in ratifications
- Validation failure reasons
- Migration progress tracking
- Performance impact on submission processing

#### Alerting
- High validation failure rates
- Data migration issues
- Performance degradation
- System integration failures

## Implementation Benefits

1. **Fair Representation**: Ensures both franchises have voice in match validation
2. **Reduced Bias**: Prevents single-franchise domination of ratification process
3. **Enhanced Integrity**: Improves overall submission validation quality
4. **Better User Experience**: Clear error messages guide users to correct actions
5. **Scalable Design**: Supports future enhancements and submission types

## Risk Mitigation

1. **Backward Compatibility**: Gradual rollout prevents breaking existing functionality
2. **Admin Override**: Emergency override capabilities for edge cases
3. **Feature Flags**: Enable/disable validation rules as needed
4. **Comprehensive Testing**: Extensive testing across all submission types
5. **Rollback Plan**: Ability to revert to previous validation logic

This design provides a robust, scalable solution for cross-franchise ratification validation while maintaining system integrity and user experience.