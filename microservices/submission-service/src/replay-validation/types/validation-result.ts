export interface ValidationError {
    error: string;
    game?: number;
}

export interface ValidationSuccess {
    valid: true;
}
export interface ValidationFailure {
    valid: false;
    errors: ValidationError[];
}

export type ValidationResult = ValidationFailure | ValidationSuccess;
