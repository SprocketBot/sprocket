export enum MledbWriteRetirementCategory {
    RequiredCompatibilityMirror = "required_compatibility_mirror",
    ValidationOnlyMirror = "validation_only_mirror",
    RemovableLegacyWrite = "removable_legacy_write",
    ReadOnlyMigrationBootstrap = "read_only_migration_bootstrap",
    NativeSprocketMemberOrgBound = "native_sprocket_member_org_bound",
}

export enum MledbWriteReplacementReadiness {
    ReplacementReady = "replacement_ready",
    ReplacementNeededBeforeGating = "replacement_needed_before_gating",
    NoRuntimeGateNeeded = "no_runtime_gate_needed",
}

export interface MledbWriteClassification {
    readonly key: string;
    readonly category: MledbWriteRetirementCategory;
    readonly readiness: MledbWriteReplacementReadiness;
    readonly replacementFirst: boolean;
    readonly currentWritePath: string;
    readonly sprocketReplacement: string;
    readonly verification: readonly string[];
    readonly notes: string;
}

export const MLEDB_WRITE_CLASSIFICATIONS: readonly MledbWriteClassification[] = [
    {
        key: "franchise.player.createPlayer.mledbBridge",
        category: MledbWriteRetirementCategory.RequiredCompatibilityMirror,
        readiness: MledbWriteReplacementReadiness.ReplacementNeededBeforeGating,
        replacementFirst: true,
        currentWritePath: "PlayerService.createPlayer creates Sprocket player state and MLEDB bridge/account compatibility rows.",
        sprocketReplacement: "Canonical player plus platform account link write path that no longer needs an MLEDB player mirror.",
        verification: [
            "Unit test player creation without requiring MLEDB writes.",
            "Backfill comparison proves every active MLEDB player maps to one Sprocket player.",
            "Dataset player/account-link outputs have v2 API parity.",
        ],
        notes: "Do not gate until player identity/account-link replacements are live and dataset parity is proven.",
    },
    {
        key: "franchise.player.updateSkillGroupAndSalary.mledbMirror",
        category: MledbWriteRetirementCategory.RequiredCompatibilityMirror,
        readiness: MledbWriteReplacementReadiness.ReplacementNeededBeforeGating,
        replacementFirst: true,
        currentWritePath: "Sprocket player skill group and salary changes are mirrored to MLEDB for compatibility.",
        sprocketReplacement: "Canonical Sprocket/v2 player league participation, skill group, salary, and public dataset/API read model.",
        verification: [
            "Unit test skill group and salary update behavior against Sprocket state.",
            "Daily comparison between MLEDB exports and Sprocket/v2 read model.",
            "Public players/eligibility datasets match v2 API outputs before mirror removal.",
        ],
        notes: "This is operationally important because public exports and legacy tooling still consume MLEDB-shaped player data.",
    },
    {
        key: "mledb.ncpTeamRoleUsage.writeMledbFirst",
        category: MledbWriteRetirementCategory.RequiredCompatibilityMirror,
        readiness: MledbWriteReplacementReadiness.ReplacementNeededBeforeGating,
        replacementFirst: true,
        currentWritePath: "NCP team role usage resolver writes MLEDB first and updates Sprocket best-effort.",
        sprocketReplacement: "Canonical role assignment or roster role usage write path in Sprocket/v2, with MLEDB reduced to validation/export only.",
        verification: [
            "Unit test role usage writes against canonical Sprocket state.",
            "Comparison report for MLEDB team_role_usage versus Sprocket roster role usage.",
            "Staff acceptance test for NCP correction workflow in Sprocket UI/API.",
        ],
        notes: "This is a high-priority replacement because it writes legacy state before canonical Sprocket state today.",
    },
    {
        key: "scheduling.match.reportCardLegacyMirror",
        category: MledbWriteRetirementCategory.ValidationOnlyMirror,
        readiness: MledbWriteReplacementReadiness.ReplacementNeededBeforeGating,
        replacementFirst: true,
        currentWritePath: "Match/report-card workflows still mirror or correct MLEDB match/report-card state for legacy compatibility.",
        sprocketReplacement: "Canonical result submission plus replay evidence workflow, with report cards treated as derived or sunset artifacts.",
        verification: [
            "Result submission lifecycle tests cover reset/correction paths.",
            "Replay evidence and report-card comparison proves external outputs remain available.",
            "Staff smoke test validates disputed/incorrect result correction without MLEDB authority.",
        ],
        notes: "Do not remove while report cards or datasets still depend on legacy match/report-card state.",
    },
    {
        key: "mledb.backfillBridge",
        category: MledbWriteRetirementCategory.ReadOnlyMigrationBootstrap,
        readiness: MledbWriteReplacementReadiness.NoRuntimeGateNeeded,
        replacementFirst: false,
        currentWritePath: "Bridge backfill scripts write mapping rows that connect MLEDB identities to Sprocket identities.",
        sprocketReplacement: "Explicit migration mapping tables retained until all legacy ID references are retired.",
        verification: [
            "Backfill idempotency checks pass.",
            "Mapping count and orphan checks are clean.",
            "No production request path depends on running the backfill.",
        ],
        notes: "This should remain available as an operator tool, not a live operational write path.",
    },
    {
        key: "organization.memberRestriction.nativeSprocket",
        category: MledbWriteRetirementCategory.NativeSprocketMemberOrgBound,
        readiness: MledbWriteReplacementReadiness.ReplacementNeededBeforeGating,
        replacementFirst: true,
        currentWritePath: "Member restrictions are native Sprocket writes but still use organization/member abstractions.",
        sprocketReplacement: "Queue ban, eligibility status, or exception-ticket write path against player/account/role concepts.",
        verification: [
            "Restriction lifecycle tests cover create, expire, and authorization behavior.",
            "Migration comparison maps member restrictions to player/account-level restrictions.",
            "Staff smoke test validates restrictions without organization/member IDs.",
        ],
        notes: "Not an MLEDB write, but it must be replaced before the v2 model can fully remove organization/member.",
    },
];

export function getMledbWriteClassification(key: string): MledbWriteClassification | undefined {
    return MLEDB_WRITE_CLASSIFICATIONS.find((classification) => classification.key === key);
}

export function getMledbWriteClassificationsByCategory(category: MledbWriteRetirementCategory): readonly MledbWriteClassification[] {
    return MLEDB_WRITE_CLASSIFICATIONS.filter((classification) => classification.category === category);
}

export function getMledbWritesBlockedFromGating(): readonly MledbWriteClassification[] {
    return MLEDB_WRITE_CLASSIFICATIONS.filter((classification) => (
        classification.replacementFirst
        && classification.readiness === MledbWriteReplacementReadiness.ReplacementNeededBeforeGating
    ));
}

export function assertMledbWriteCanBeGated(key: string): void {
    const classification = getMledbWriteClassification(key);

    if (classification === undefined) {
        throw new Error(`Unknown MLEDB write classification: ${key}`);
    }

    if (classification.replacementFirst && classification.readiness === MledbWriteReplacementReadiness.ReplacementNeededBeforeGating) {
        throw new Error(`MLEDB write cannot be gated before replacement is ready: ${key}`);
    }
}
