import {
    assertMledbWriteCanBeGated,
    getMledbWriteClassification,
    getMledbWriteClassificationsByCategory,
    getMledbWritesBlockedFromGating,
    MLEDB_WRITE_CLASSIFICATIONS,
    MledbWriteReplacementReadiness,
    MledbWriteRetirementCategory,
} from "./mledb-write-classification";

describe("MLEDB write classification", () => {
    it("records a non-empty classification ledger with unique keys", () => {
        expect(MLEDB_WRITE_CLASSIFICATIONS.length).toBeGreaterThan(0);

        const keys = MLEDB_WRITE_CLASSIFICATIONS.map((classification) => classification.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("marks operational MLEDB mirrors as replacement-first before gating", () => {
        const blockedWrites = getMledbWritesBlockedFromGating();
        const blockedKeys = blockedWrites.map((classification) => classification.key);

        expect(blockedKeys).toEqual(expect.arrayContaining([
            "franchise.player.createPlayer.mledbBridge",
            "franchise.player.updateSkillGroupAndSalary.mledbMirror",
            "mledb.ncpTeamRoleUsage.writeMledbFirst",
            "scheduling.match.reportCardLegacyMirror",
        ]));

        for (const classification of blockedWrites) {
            expect(classification.replacementFirst).toBe(true);
            expect(classification.readiness).toBe(MledbWriteReplacementReadiness.ReplacementNeededBeforeGating);
            expect(classification.verification.length).toBeGreaterThan(0);
        }
    });

    it("allows read-only migration bootstrap writes to remain operator tooling", () => {
        const bootstrapWrites = getMledbWriteClassificationsByCategory(MledbWriteRetirementCategory.ReadOnlyMigrationBootstrap);

        expect(bootstrapWrites).toHaveLength(1);
        expect(bootstrapWrites[0].key).toBe("mledb.backfillBridge");
        expect(bootstrapWrites[0].replacementFirst).toBe(false);
        expect(bootstrapWrites[0].readiness).toBe(MledbWriteReplacementReadiness.NoRuntimeGateNeeded);
    });

    it("throws when a replacement-first write is gated before its replacement is ready", () => {
        expect(() => assertMledbWriteCanBeGated("mledb.ncpTeamRoleUsage.writeMledbFirst"))
            .toThrow("MLEDB write cannot be gated before replacement is ready: mledb.ncpTeamRoleUsage.writeMledbFirst");
    });

    it("does not throw for non-runtime bootstrap writes", () => {
        expect(() => assertMledbWriteCanBeGated("mledb.backfillBridge")).not.toThrow();
    });

    it("throws for unknown write classifications", () => {
        expect(getMledbWriteClassification("missing.write.path")).toBeUndefined();
        expect(() => assertMledbWriteCanBeGated("missing.write.path"))
            .toThrow("Unknown MLEDB write classification: missing.write.path");
    });
});
