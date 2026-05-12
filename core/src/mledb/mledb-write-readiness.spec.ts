import {
    evaluateMledbWriteReadinessByKey,
    MledbWriteEvidenceKind,
    summarizeMledbWriteReadiness,
} from "./mledb-write-readiness";

const replacementFirstKey = "mledb.ncpTeamRoleUsage.writeMledbFirst";

describe("MLEDB write readiness", () => {
    it("does not mark replacement-first writes ready without evidence", () => {
        const result = evaluateMledbWriteReadinessByKey(replacementFirstKey);

        expect(result.readyToGate).toBe(false);
        expect(result.missingVerification).toEqual([
            `Missing ${MledbWriteEvidenceKind.UnitTest} evidence for ${replacementFirstKey}`,
            `Missing ${MledbWriteEvidenceKind.ComparisonReport} evidence for ${replacementFirstKey}`,
            `Missing ${MledbWriteEvidenceKind.StaffAcceptance} evidence for ${replacementFirstKey}`,
        ]);
    });

    it("requires unit, comparison, and staff acceptance evidence before replacement-first gating", () => {
        const result = evaluateMledbWriteReadinessByKey(replacementFirstKey, [
            {
                kind: MledbWriteEvidenceKind.UnitTest,
                description: "Role usage writes are covered by canonical Sprocket unit tests.",
                reference: "core/src/mledb/example.spec.ts",
            },
            {
                kind: MledbWriteEvidenceKind.ComparisonReport,
                description: "MLEDB and Sprocket role usage rows match for active teams.",
                reference: "artifacts/migration/role-usage-comparison.csv",
            },
            {
                kind: MledbWriteEvidenceKind.StaffAcceptance,
                description: "Staff validated the NCP correction workflow in Sprocket.",
                reference: "staff-acceptance:ncp-role-usage:2026-04-28",
            },
        ]);

        expect(result.readyToGate).toBe(true);
        expect(result.missingVerification).toEqual([]);
    });

    it("allows migration bootstrap writes without runtime gating evidence", () => {
        const result = evaluateMledbWriteReadinessByKey("mledb.backfillBridge");

        expect(result.readyToGate).toBe(true);
        expect(result.missingVerification).toEqual([]);
    });

    it("summarizes ready and not-ready write paths", () => {
        const summary = summarizeMledbWriteReadiness();

        expect(summary.totalClassifications).toBeGreaterThan(0);
        expect(summary.blockedFromGating).toContain(replacementFirstKey);
        expect(summary.readyToGate).toContain("mledb.backfillBridge");
        expect(summary.notReadyToGate).toEqual(expect.arrayContaining([
            "franchise.player.createPlayer.mledbBridge",
            "franchise.player.updateSkillGroupAndSalary.mledbMirror",
            replacementFirstKey,
            "scheduling.match.reportCardLegacyMirror",
            "organization.memberRestriction.nativeSprocket",
        ]));
    });

    it("throws clearly for unknown write readiness records", () => {
        expect(() => evaluateMledbWriteReadinessByKey("missing.write.path"))
            .toThrow("Unknown MLEDB write classification: missing.write.path");
    });
});
