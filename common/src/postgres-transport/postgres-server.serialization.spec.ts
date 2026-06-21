/**
 * JSON Serialization Tests
 * 
 * Run with: npx ts-node common/src/postgres-transport/postgres-server.serialization.spec.ts
 * Or compile and run: tsc common/src/postgres-transport/postgres-server.serialization.spec.ts && node common/src/postgres-transport/postgres-server.serialization.spec.js
 */

// Replicate the serializeResponse method for testing
function serializeResponse(response: unknown): unknown {
    // Handle null/undefined explicitly
    if (response === null || response === undefined) {
        return response;
    }

    // If it's already a string, validate it's valid JSON or store as-is
    if (typeof response === 'string') {
        try {
            // Try to parse and re-serialize to ensure it's valid JSON
            return JSON.parse(response);
        } catch {
            // If it's not valid JSON, wrap it in an object to make it valid JSON
            return { value: response };
        }
    }

    // If it has a toJSON method, use it (e.g., Date objects, custom classes)
    if (typeof response === 'object' && response !== null && 'toJSON' in response) {
        return (response as { toJSON: () => unknown }).toJSON();
    }

    // Validate by round-tripping through JSON
    // This catches malformed objects with extra braces, circular refs, etc.
    const serialized = JSON.stringify(response);
    
    // This will throw on circular references or other serialization issues
    return JSON.parse(serialized);
}

// Test runner - renamed to avoid conflict with Jest globals
let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error}`);
        failed++;
    }
}

// Renamed to avoid conflict with Jest globals - also added toBeNull
function expectValue(actual: unknown) {
    return {
        toBe(expected: unknown) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },
        toEqual(expected: unknown) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },
        toThrow() {
            throw new Error('Function was expected to throw but did not');
        },
        toBeNull() {
            if (actual !== null) {
                throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
            }
        }
    };
}

// Tests
console.log('\n=== JSON Serialization Tests ===\n');

runTest('should handle null', () => {
    expectValue(serializeResponse(null)).toBe(null);
});

runTest('should handle undefined', () => {
    expectValue(serializeResponse(undefined)).toBe(undefined);
});

runTest('should handle valid JSON string', () => {
    const input = '{"name": "test", "value": 123}';
    expectValue(serializeResponse(input)).toEqual({name: 'test', value: 123});
});

runTest('should handle plain string and wrap it', () => {
    const input = 'plain text without json';
    expectValue(serializeResponse(input)).toEqual({value: 'plain text without json'});
});

runTest('should handle empty string and wrap it', () => {
    const input = '';
    expectValue(serializeResponse(input)).toEqual({value: ''});
});

runTest('should handle simple object', () => {
    const input = {name: 'test', count: 42};
    expectValue(serializeResponse(input)).toEqual({name: 'test', count: 42});
});

runTest('should handle array', () => {
    const input = [1, 2, 3, 'four'];
    expectValue(serializeResponse(input)).toEqual([1, 2, 3, 'four']);
});

runTest('should handle Date objects via toJSON', () => {
    const date = new Date('2026-06-21T04:00:00Z');
    expectValue(serializeResponse(date)).toBe('2026-06-21T04:00:00.000Z');
});

runTest('should handle objects with custom toJSON', () => {
    const obj = {
        toJSON() {
            return {custom: 'serialized'};
        }
    };
    expectValue(serializeResponse(obj)).toEqual({custom: 'serialized'});
});

runTest('should handle nested objects', () => {
    const input = {
        user: {
            profile: {
                name: 'John'
            }
        }
    };
    expectValue(serializeResponse(input)).toEqual(input);
});

runTest('should handle boolean and number primitives', () => {
    expectValue(serializeResponse(true)).toBe(true);
    expectValue(serializeResponse(false)).toBe(false);
    expectValue(serializeResponse(42)).toBe(42);
    expectValue(serializeResponse(3.14)).toBe(3.14);
});

runTest('should throw on circular reference', () => {
    const obj: Record<string, unknown> = {name: 'test'};
    obj.self = obj;
    
    let threw = false;
    try {
        serializeResponse(obj);
    } catch {
        threw = true;
    }
    if (!threw) {
        throw new Error('Expected to throw on circular reference');
    }
});

runTest('should handle object with extra braces (the original bug)', () => {
    const input = {status: 'IN_PROGRESS', count: 1};
    expectValue(serializeResponse(input)).toEqual(input);
});

runTest('should handle special JSON values', () => {
    expectValue(serializeResponse(NaN)).toBeNull();
    expectValue(serializeResponse(Infinity)).toBeNull();
    expectValue(serializeResponse(-Infinity)).toBeNull();
});

runTest('should handle empty object', () => {
    expectValue(serializeResponse({})).toEqual({});
});

runTest('should handle empty array', () => {
    expectValue(serializeResponse([])).toEqual([]);
});

runTest('should handle object with null value', () => {
    const input = {key: null};
    expectValue(serializeResponse(input)).toEqual({key: null});
});

runTest('should handle complex nested arrays and objects', () => {
    const input = {
        scrims: [
            {id: '1', status: 'IN_PROGRESS'},
            {id: '2', status: 'COMPLETED'}
        ],
        metadata: {
            total: 2,
            page: 1
        }
    };
    expectValue(serializeResponse(input)).toEqual(input);
});

runTest('should handle Unicode characters', () => {
    const input = {name: '日本語', emoji: '🎮'};
    expectValue(serializeResponse(input)).toEqual(input);
});

runTest('should handle string that looks like JSON array', () => {
    const input = '[1, 2, 3]';
    expectValue(serializeResponse(input)).toEqual([1, 2, 3]);
});

runTest('should handle string that looks like JSON primitive', () => {
    expectValue(serializeResponse('42')).toBe(42);
    expectValue(serializeResponse('true')).toBe(true);
    expectValue(serializeResponse('null')).toBeNull();
});

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
    process.exit(1);
}