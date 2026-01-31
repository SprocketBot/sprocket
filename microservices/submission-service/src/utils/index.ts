import {REDIS_PREFIX} from "../submission.constants";

export function getSubmissionKey(submissionId: string): string {
    return `${REDIS_PREFIX}:${submissionId}`;
}

export function submissionIsScrim(submissionId: string): boolean {
    return submissionId.startsWith("scrim");
}

export function submissionIsLFS(submissionId: string): boolean {
    return submissionId.startsWith("lfs");
}

export function submissionIsMatch(submissionId: string): boolean {
    return submissionId.startsWith("match");
}
