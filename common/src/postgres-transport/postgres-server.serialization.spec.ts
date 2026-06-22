/**
 * JSONB parameter serialization smoke tests.
 *
 * Run with: npx ts-node common/src/postgres-transport/postgres-server.serialization.spec.ts
 */

import {toJsonbParam} from "./postgres-transport";

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void): void {
    try {
        fn();
        console.log(`PASS ${name}`);
        passed++;
    } catch (error) {
        console.error(`FAIL ${name}`);
        console.error(`  ${error}`);
        failed++;
    }
}

function expectJsonParam(value: unknown): {
    toBe(expected: unknown): void;
} {
    return {
        toBe(expected: unknown): void {
            const actual = value === null ? null : JSON.parse(String(value));
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },
    };
}

console.log("\n=== JSONB Parameter Serialization Tests ===\n");

runTest("serializes top-level arrays as JSON text", () => {
    const param = toJsonbParam([{id: "scrim-1"}, {id: "scrim-2"}]);
    if (param !== "[{\"id\":\"scrim-1\"},{\"id\":\"scrim-2\"}]") {
        throw new Error(`Expected JSON array text but got ${JSON.stringify(param)}`);
    }
    expectJsonParam(param).toBe([{id: "scrim-1"}, {id: "scrim-2"}]);
});

runTest("serializes objects as JSON text", () => {
    expectJsonParam(toJsonbParam({name: "test", value: 123})).toBe({name: "test", value: 123});
});

runTest("preserves valid JSON strings as their parsed JSON value", () => {
    expectJsonParam(toJsonbParam("[1,2,3]")).toBe([1, 2, 3]);
});

runTest("stores plain strings as JSON strings", () => {
    expectJsonParam(toJsonbParam("plain text")).toBe("plain text");
});

runTest("stores null and undefined as SQL null", () => {
    if (toJsonbParam(null) !== null) throw new Error("Expected null to become SQL null");
    if (toJsonbParam(undefined) !== null) throw new Error("Expected undefined to become SQL null");
});

runTest("throws on circular references", () => {
    const obj: Record<string, unknown> = {name: "test"};
    obj.self = obj;

    let threw = false;
    try {
        toJsonbParam(obj);
    } catch {
        threw = true;
    }
    if (!threw) throw new Error("Expected to throw on circular reference");
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) process.exit(1);
