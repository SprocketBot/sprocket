export interface FranchiseValidationContext {
  homeFranchiseId?: number;
  awayFranchiseId?: number;
  requiredFranchises: number;
  currentFranchiseCount: number;
}

export interface FranchiseInfo {
  id: number;
  name: string;
}

export interface FranchiseValidationResult {
  valid: boolean;
  reason?: string;
  franchise?: FranchiseInfo;
}

export interface CrossFranchiseValidationError {
  code: string;
  message: string;
  context?: {
    submissionId: string;
    playerId: number;
    memberId?: number;
    submissionType?: string;
    existingFranchises?: number[];
    playerFranchises?: FranchiseInfo[];
    requiredFranchises?: number;
  };
}

export interface EnhancedCanRatifySubmissionResponse {
  canRatify: boolean;
  reason?: string;
  franchiseInfo?: {
    eligibleFranchise: FranchiseInfo;
    existingFranchises: FranchiseInfo[];
    requiredFranchises: number;
  };
}
