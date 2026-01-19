# Cross-Franchise Ratification Implementation Specifications

## Technical Implementation Plan

### Phase 1: Data Structure Enhancement (Week 1)

#### 1.1 Enhanced Type Definitions
```typescript
// File: common/src/service-connectors/submission/types/ratifier-info.ts
export interface RatifierInfo {
    playerId: number;
    franchiseId: number;
    franchiseName: string;
    ratifiedAt: string;
}

export interface FranchiseValidationContext {
    homeFranchiseId?: number;
    awayFranchiseId?: number;
    requiredFranchises: number;
    currentFranchiseCount: number;
    franchiseIds: number[]; // Track unique franchise IDs
}

export interface EnhancedBaseReplaySubmission {
    id: string;
    creatorId: number;
    status: ReplaySubmissionStatus;
    taskIds: string[];
    items: ReplaySubmissionItem[];
    validated: boolean;
    stats?: ReplaySubmissionStats;
    ratifiers: RatifierInfo[]; // Enhanced from number[]
    requiredRatifications: number;
    rejections: ReplaySubmissionRejection[];
    franchiseValidation: FranchiseValidationContext;
}
```

#### 1.2 Schema Updates
```typescript
// File: common/src/service-connectors/submission/schemas/RatifierInfo.schema.ts
export const RatifierInfoSchema = z.object({
    playerId: z.number(),
    franchiseId: z.number(),
    franchiseName: z.string(),
    ratifiedAt: z.string(),
});

export const FranchiseValidationContextSchema = z.object({
    homeFranchiseId: z.number().optional(),
    awayFranchiseId: z.number().optional(),
    requiredFranchises: z.number().default(2),
    currentFranchiseCount: z.number().default(0),
    franchiseIds: z.array(z.number()).default([]),
});

// Update BaseSubmission schema
export const EnhancedBaseSubmissionSchema = BaseSubmission.extend({
    ratifiers: RatifierInfoSchema.array(),
    franchiseValidation: FranchiseValidationContextSchema,
});
```

### Phase 2: Validation Service Implementation (Week 2)

#### 2.1 Cross-Franchise Validation Service
```typescript
// File: microservices/submission-service/src/validation/cross-franchise-validation.service.ts

@Injectable()
export class CrossFranchiseValidationService {
    constructor(
        private readonly coreService: CoreService,
        private readonly matchmakingService: MatchmakingService,
        private readonly submissionCrudService: ReplaySubmissionCrudService,
        private readonly logger: Logger,
    ) {}

    async validateCrossFranchiseRatification(
        submissionId: string,
        playerId: number,
        memberId: number
    ): Promise<CrossFranchiseValidationResult> {
        try {
            const submission = await this.submissionCrudService.getSubmission(submissionId);
            if (!submission) {
                return { valid: false, reason: "Submission not found" };
            }

            // Get player franchise information
            const playerFranchises = await this.getPlayerFranchises(memberId);
            if (!playerFranchises.length) {
                return { valid: false, reason: "No franchise information available" };
            }

            // Validate based on submission type
            switch (submission.type) {
                case ReplaySubmissionType.MATCH:
                    return await this.validateMatchCrossFranchise(submission, playerFranchises);
                case ReplaySubmissionType.SCRIM:
                    return await this.validateScrimCrossFranchise(submission, playerFranchises, playerId);
                case ReplaySubmissionType.LFS:
                    return await this.validateLFSCrossFranchise(submission, playerFranchises, playerId);
                default:
                    return { valid: false, reason: "Unsupported submission type" };
            }
        } catch (error) {
            this.logger.error(`Cross-franchise validation error for submission ${submissionId}:`, error);
            return { valid: false, reason: "Validation system error" };
        }
    }

    private async validateMatchCrossFranchise(
        submission: MatchReplaySubmission,
        playerFranchises: Franchise[]
    ): Promise<CrossFranchiseValidationResult> {
        // Get match details
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchBySubmissionId, {
            submissionId: submission.id
        });

        if (matchResult.status === ResponseStatus.ERROR || !matchResult.data) {
            return { valid: false, reason: "Unable to retrieve match information" };
        }

        const { homeFranchise, awayFranchise } = matchResult.data;
        if (!homeFranchise || !awayFranchise) {
            return { valid: false, reason: "Match franchise information incomplete" };
        }

        // Check if player is on either franchise
        const eligibleFranchise = playerFranchises.find(f => 
            f.id === homeFranchise.id || f.id === awayFranchise.id
        );

        if (!eligibleFranchise) {
            return {
                valid: false,
                reason: `You must be a member of either ${homeFranchise.name} or ${awayFranchise.name} to ratify this match`,
                errorCode: "NOT_ON_FRANCHISE"
            };
        }

        // Check for existing ratification from same franchise
        const existingFranchiseIds = new Set(submission.ratifiers.map(r => r.franchiseId));
        if (existingFranchiseIds.has(eligibleFranchise.id)) {
            const existingRatifier = submission.ratifiers.find(r => r.franchiseId === eligibleFranchise.id);
            return {
                valid: false,
                reason: `Your franchise (${eligibleFranchise.name}) has already ratified this submission`,
                errorCode: "FRANCHISE_ALREADY_RATIFIED",
                context: {
                    existingRatifier: existingRatifier?.playerId,
                    franchiseName: eligibleFranchise.name
                }
            };
        }

        return {
            valid: true,
            franchise: eligibleFranchise,
            context: {
                homeFranchise,
                awayFranchise,
                existingFranchises: Array.from(existingFranchiseIds)
            }
        };
    }

    private async validateScrimCrossFranchise(
        submission: ScrimReplaySubmission,
        playerFranchises: Franchise[],
        playerId: number
    ): Promise<CrossFranchiseValidationResult> {
        // Get scrim details
        const scrimResult = await this.matchmakingService.send(MatchmakingEndpoint.GetScrimBySubmissionId, submission.id);
        
        if (scrimResult.status === ResponseStatus.ERROR || !scrimResult.data) {
            return { valid: false, reason: "Unable to retrieve scrim information" };
        }

        const scrim = scrimResult.data;
        
        // Check if player participated in scrim
        const participated = scrim.players.some(p => p.id === playerId);
        if (!participated) {
            return { valid: false, reason: "You did not participate in this scrim" };
        }

        // For scrims, we need to determine team divisions
        if (scrim.settings.mode === ScrimMode.TEAMS) {
            return this.validateTeamScrimCrossFranchise(submission, playerFranchises, scrim);
        }

        // For round-robin, allow any participant to ratify
        return { valid: true };
    }

    private async getPlayerFranchises(memberId: number): Promise<Franchise[]> {
        const result = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, { memberId });
        if (result.status === ResponseStatus.ERROR) {
            throw new Error(`Failed to get player franchises: ${result.error}`);
        }
        return result.data;
    }
}

interface CrossFranchiseValidationResult {
    valid: boolean;
    reason?: string;
    errorCode?: string;
    franchise?: Franchise;
    context?: any;
}
```

### Phase 3: Enhanced Util Service Integration (Week 3)

#### 3.1 Updated CanRatifySubmission Method
```typescript
// File: microservices/submission-service/src/replay-submission/replay-submission-util.service.ts

async canRatifySubmission(
    submissionId: string,
    memberId: number,
    userId: number
): Promise<CanRatifySubmissionResponse> {
    const submission = await this.submissionCrudService.getSubmission(submissionId);
    
    if (!submission) {
        return { canRatify: false, reason: "The submission does not exist" };
    }

    if (!submission.validated) {
        return { canRatify: false, reason: "The submission has not been validated" };
    }

    // NEW: Cross-franchise validation
    const crossFranchiseResult = await this.crossFranchiseValidationService.validateCrossFranchiseRatification(
        submissionId,
        userId,
        memberId
    );

    if (!crossFranchiseResult.valid) {
        return {
            canRatify: false,
            reason: crossFranchiseResult.reason!,
            errorCode: crossFranchiseResult.errorCode
        };
    }

    // Continue with existing validation logic
    if (submissionIsScrim(submissionId)) {
        return await this.validateScrimRatification(submission, userId);
    } else if (submissionIsMatch(submissionId)) {
        return await this.validateMatchRatification(submission, memberId);
    }

    return { canRatify: true };
}
```

### Phase 4: Ratification Service Enhancement (Week 4)

#### 4.1 Enhanced Ratification Service
```typescript
// File: microservices/submission-service/src/replay-submission/replay-submission-ratification/replay-submission-ratification.service.ts

async ratifyScrim(playerId: number, submissionId: string): Promise<Boolean> {
    const submission = await this.crudService.getSubmission(submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== ReplaySubmissionStatus.RATIFYING) throw new Error("Submission is not ready for ratifications");

    // Get franchise information for the ratifier
    const memberResult = await this.coreService.send(CoreEndpoint.GetMember, { userId: playerId });
    if (memberResult.status === ResponseStatus.ERROR) throw memberResult.error;
    
    const memberId = memberResult.data.id;
    const playerFranchises = await this.getPlayerFranchises(memberId);
    
    // Determine which franchise is ratifying
    const ratifyingFranchise = await this.determineRatifyingFranchise(submission, playerFranchises);
    
    // Create enhanced ratifier info
    const ratifierInfo: RatifierInfo = {
        playerId,
        franchiseId: ratifyingFranchise.id,
        franchiseName: ratifyingFranchise.name,
        ratifiedAt: new Date().toISOString()
    };

    // Add enhanced ratifier to submission
    await this.crudService.addEnhancedRatifier(submissionId, ratifierInfo);
    submission.ratifiers.push(ratifierInfo);

    // Update franchise validation context
    await this.updateFranchiseValidationContext(submissionId, submission);

    // Check if ratification requirements are met
    if (submission.ratifiers.length >= submission.requiredRatifications) {
        // Additional check for cross-franchise validation
        const hasCrossFranchiseValidation = await this.validateCrossFranchiseRequirement(submission);
        
        if (!hasCrossFranchiseValidation) {
            // If we don't have cross-franchise validation, we might need to wait
            // or allow override for edge cases
            const canProceed = await this.checkEdgeCaseOverride(submission);
            if (!canProceed) {
                return false;
            }
        }

        await this.crudService.updateStatus(submissionId, ReplaySubmissionStatus.RATIFIED);
        await this.eventService.publish(EventTopic.SubmissionRatified, {
            submissionId: submissionId,
            redisKey: getSubmissionKey(submissionId),
        });
        return true;
    }

    await this.eventService.publish(EventTopic.SubmissionRatificationAdded, {
        currentRatifications: submission.ratifiers.length,
        requiredRatifications: submission.requiredRatifications,
        submissionId: submissionId,
        redisKey: getSubmissionKey(submissionId),
        franchiseInfo: {
            ratifyingFranchise: ratifyingFranchise.name,
            uniqueFranchises: this.getUniqueFranchiseCount(submission.ratifiers)
        }
    });
    return false;
}

private async validateCrossFranchiseRequirement(submission: ReplaySubmission): Promise<boolean> {
    if (submission.type !== ReplaySubmissionType.MATCH) return true; // Only enforce for matches
    
    const uniqueFranchises = this.getUniqueFranchiseCount(submission.ratifiers);
    return uniqueFranchises >= 2;
}

private getUniqueFranchiseCount(ratifiers: RatifierInfo[]): number {
    return new Set(ratifiers.map(r => r.franchiseId)).size;
}
```

### Phase 5: CRUD Service Enhancement (Week 5)

#### 5.1 Enhanced CRUD Operations
```typescript
// File: microservices/submission-service/src/replay-submission/replay-submission-crud/replay-submission-crud.service.ts

// Enhanced submission creation with franchise context
async getOrCreateSubmission(submissionId: string, playerId: number): Promise<ReplaySubmission> {
    // Existing logic...
    
    const commonFields: EnhancedBaseReplaySubmission = {
        id: submissionId,
        creatorId: playerId,
        status: ReplaySubmissionStatus.PROCESSING,
        taskIds: [],
        items: [],
        validated: false,
        ratifiers: [], // Enhanced structure
        rejections: [],
        stats: undefined,
        requiredRatifications: 2,
        franchiseValidation: {
            requiredFranchises: 2,
            currentFranchiseCount: 0,
            franchiseIds: []
        }
    };

    // Enhanced submission creation...
}

// New method for enhanced ratifier addition
async addEnhancedRatifier(submissionId: string, ratifierInfo: RatifierInfo): Promise<void> {
    const key = getSubmissionKey(submissionId);
    const existingRatifiers = await this.getSubmissionRatifiers(submissionId) as RatifierInfo[];
    
    // Check for duplicate player ratification
    if (existingRatifiers.some(r => r.playerId === ratifierInfo.playerId)) return;
    
    // Add new ratifier
    await this.redisService.appendToJsonArray(key, "ratifiers", ratifierInfo);
    
    // Update franchise validation context
    await this.updateFranchiseValidationContext(submissionId);
}

async updateFranchiseValidationContext(submissionId: string): Promise<void> {
    const key = getSubmissionKey(submissionId);
    const ratifiers = await this.getSubmissionRatifiers(submissionId) as RatifierInfo[];
    
    const uniqueFranchiseIds = [...new Set(ratifiers.map(r => r.franchiseId))];
    
    await this.redisService.setJsonField(key, "franchiseValidation.currentFranchiseCount", uniqueFranchiseIds.length);
    await this.redisService.setJsonField(key, "franchiseValidation.franchiseIds", uniqueFranchiseIds);
}
```

### Phase 6: Error Handling and User Experience (Week 6)

#### 6.1 Enhanced Error Messages
```typescript
// File: microservices/submission-service/src/validation/validation-error-messages.ts

export const CROSS_FRANCHISE_VALIDATION_ERRORS = {
    NOT_ON_FRANCHISE: (homeFranchise: string, awayFranchise: string) => 
        `You must be a member of either ${homeFranchise} or ${awayFranchise} to ratify this match.`,
    
    FRANCHISE_ALREADY_RATIFIED: (franchiseName: string) => 
        `Your franchise (${franchiseName}) has already ratified this submission. Please wait for a player from the opposing franchise to ratify.`,
    
    INSUFFICIENT_FRANCHISE_DIVERSITY: (current: number, required: number) => 
        `This submission requires ratification from both competing franchises. Currently only ${current} of ${required} franchises have ratified.`,
    
    NO_OPPOSING_FRANCHISE_RATIFIERS: 
        "No players from the opposing franchise are available to ratify. Please contact an administrator.",
    
    FRANCHISE_INFO_UNAVAILABLE: 
        "Unable to retrieve franchise information. Please try again later.",
    
    SUBMISSION_TYPE_UNSUPPORTED: 
        "Cross-franchise validation is not supported for this submission type."
};
```

#### 6.2 Frontend Integration
```typescript
// Enhanced GraphQL resolver for better error handling
@Resolver(() => ReplaySubmission)
export class ReplaySubmissionResolver {
    
    @Mutation(() => Boolean)
    async ratifySubmission(
        @Args("submissionId") submissionId: string,
        @CurrentUser() user: UserPayload
    ): Promise<boolean> {
        try {
            const result = await this.replayParseService.ratifySubmission(submissionId, user.userId, user.organizationId);
            return result;
        } catch (error) {
            // Enhanced error handling with user-friendly messages
            if (error.message.includes("FRANCHISE_ALREADY_RATIFIED")) {
                throw new GraphQLError(
                    "Your franchise has already ratified this submission. Please wait for the opposing team to ratify.",
                    {
                        extensions: {
                            code: "FRANCHISE_ALREADY_RATIFIED",
                            submissionId,
                            userId: user.userId
                        }
                    }
                );
            }
            throw error;
        }
    }
}
```

## Testing Strategy

### Unit Tests
- Cross-franchise validation service
- Enhanced CRUD operations
- Error handling scenarios
- Edge case validation

### Integration Tests
- End-to-end ratification flow
- Multi-franchise scenarios
- Redis data consistency
- Service integration points

### Performance Tests
- Redis operation performance
- Validation response times
- Concurrent ratification attempts
- Migration performance

## Deployment Strategy

### Staged Rollout
1. **Development**: Full feature testing
2. **Staging**: Production-like testing with sample data
3. **Production 10%**: Limited rollout with monitoring
4. **Production 50%**: Expanded rollout with feedback collection
5. **Production 100%**: Full deployment with support team ready

### Monitoring and Alerting
- Validation success/failure rates
- Error message effectiveness
- User experience metrics
- System performance impact
- Migration progress tracking

This implementation plan provides a comprehensive, phased approach to deploying cross-franchise ratification validation while maintaining system stability and user experience.