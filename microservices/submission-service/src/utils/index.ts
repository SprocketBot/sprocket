export function submissionIsScrim(submissionId: string): boolean {
    return submissionId.startsWith("scrim");
}

export function submissionIsLFS(submissionId: string): boolean {
    return submissionId.startsWith("lfs");
}

export function submissionIsMatch(submissionId: string): boolean {
    return submissionId.startsWith("match");
}
