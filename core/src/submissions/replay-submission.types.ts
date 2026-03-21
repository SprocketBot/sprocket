export interface SubmissionValidationError {
  error: string;
  code?: string;
  context?: Record<string, any>;
}

export interface SubmissionValidationResult {
  valid: boolean;
  errors: SubmissionValidationError[];
}
