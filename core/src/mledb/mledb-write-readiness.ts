import {
    getMledbWriteClassification,
    getMledbWritesBlockedFromGating,
    MLEDB_WRITE_CLASSIFICATIONS,
    MledbWriteClassification,
    MledbWriteReplacementReadiness,
} from "./mledb-write-classification";

export enum MledbWriteEvidenceKind {
    UnitTest = "unit_test",
    ComparisonReport = "comparison_report",
    StaffAcceptance = "staff_acceptance",
    RuntimeSmoke = "runtime_smoke",
    ApiParity = "api_parity",
}

export interface MledbWriteReadinessEvidence {
    readonly kind: MledbWriteEvidenceKind;
    readonly description: string;
    readonly reference: string;
}

export interface MledbWriteReadinessRecord {
    readonly key: string;
    readonly evidence: readonly MledbWriteReadinessEvidence[];
}

export interface MledbWriteReadinessResult {
    readonly classification: MledbWriteClassification;
    readonly evidence: readonly MledbWriteReadinessEvidence[];
    readonly readyToGate: boolean;
    readonly missingVerification: readonly string[];
}

export interface MledbWriteReadinessSummary {
    readonly totalClassifications: number;
    readonly blockedFromGating: readonly string[];
    readonly readyToGate: readonly string[];
    readonly notReadyToGate: readonly string[];
    readonly results: readonly MledbWriteReadinessResult[];
}

const REQUIRED_REPLACEMENT_FIRST_EVIDENCE_KINDS: readonly MledbWriteEvidenceKind[] = [
    MledbWriteEvidenceKind.UnitTest,
    MledbWriteEvidenceKind.ComparisonReport,
    MledbWriteEvidenceKind.StaffAcceptance,
];

export function evaluateMledbWriteReadiness(
    classification: MledbWriteClassification,
    evidence: readonly MledbWriteReadinessEvidence[] = [],
): MledbWriteReadinessResult {
    if (classification.readiness === MledbWriteReplacementReadiness.NoRuntimeGateNeeded) {
        return {
            classification,
            evidence,
            readyToGate: true,
            missingVerification: [],
        };
    }

    if (classification.readiness === MledbWriteReplacementReadiness.ReplacementReady) {
        return {
            classification,
            evidence,
            readyToGate: true,
            missingVerification: [],
        };
    }

    const requiredEvidenceKinds = classification.replacementFirst
        ? REQUIRED_REPLACEMENT_FIRST_EVIDENCE_KINDS
        : [];
    const presentEvidenceKinds = new Set(evidence.map((item) => item.kind));
    const missingVerification = requiredEvidenceKinds
        .filter((kind) => !presentEvidenceKinds.has(kind))
        .map((kind) => `Missing ${kind} evidence for ${classification.key}`);

    return {
        classification,
        evidence,
        readyToGate: missingVerification.length === 0,
        missingVerification,
    };
}

export function evaluateMledbWriteReadinessByKey(
    key: string,
    evidence: readonly MledbWriteReadinessEvidence[] = [],
): MledbWriteReadinessResult {
    const classification = getMledbWriteClassification(key);

    if (classification === undefined) {
        throw new Error(`Unknown MLEDB write classification: ${key}`);
    }

    return evaluateMledbWriteReadiness(classification, evidence);
}

export function summarizeMledbWriteReadiness(
    records: readonly MledbWriteReadinessRecord[] = [],
): MledbWriteReadinessSummary {
    const evidenceByKey = new Map(records.map((record) => [record.key, record.evidence]));
    const results = MLEDB_WRITE_CLASSIFICATIONS.map((classification) => evaluateMledbWriteReadiness(
        classification,
        evidenceByKey.get(classification.key) ?? [],
    ));
    const blockedFromGating = getMledbWritesBlockedFromGating().map((classification) => classification.key);

    return {
        totalClassifications: MLEDB_WRITE_CLASSIFICATIONS.length,
        blockedFromGating,
        readyToGate: results
            .filter((result) => result.readyToGate)
            .map((result) => result.classification.key),
        notReadyToGate: results
            .filter((result) => !result.readyToGate)
            .map((result) => result.classification.key),
        results,
    };
}
