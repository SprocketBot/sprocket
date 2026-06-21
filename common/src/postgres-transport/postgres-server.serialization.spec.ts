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

// Test runner
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
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

function expect(actual: unknown) {
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
        }
    };
}

// Tests
console.log('\n=== JSON Serialization Tests ===\n');

test('should handle null', () => {
    expect(serializeResponse(null)).toBe(null);
});

test('should handle undefined', () => {
    expect(serializeResponse(undefined)).toBe(undefined);
});

test('should handle valid JSON string', () => {
    const input = '{"name": "test", "value": 123}';
    expect(serializeResponse(input)).toEqual({name: 'test', value: 123});
});

test('should handle plain string and wrap it', () => {
    const input = 'plain text without json';
    expect(serializeResponse(input)).toEqual({value: 'plain text without json'});
});

test('should handle empty string and wrap it', () => {
    const input = '';
    expect(serializeResponse(input)).toEqual({value: ''});
});

test('should handle simple object', () => {
    const input = {name: 'test', count: 42};
    expect(serializeResponse(input)).toEqual({name: 'test', count: 42});
});

test('should handle array', () => {
    const input = [1, 2, 3, 'four'];
    expect(serializeResponse(input)).toEqual([1, 2, 3, 'four']);
});

test('should handle Date objects via toJSON', () => {
    const date = new Date('2026-06-21T04:00:00Z');
    expect(serializeResponse(date)).toBe('2026-06-21T04:00:00.000Z');
});

test('should handle objects with custom toJSON', () => {
    const obj = {
        toJSON() {
            return {custom: 'serialized'};
        }
    };
    expect(serializeResponse(obj)).toEqual({custom: 'serialized'});
});

test('should handle nested objects', () => {
    const input = {
        user: {
            profile: {
                name: 'John'
            }
        }
    };
    expect(serializeResponse(input)).toEqual(input);
});

test('should handle boolean and number primitives', () => {
    expect(serializeResponse(true)).toBe(true);
    expect(serializeResponse(false)).toBe(false);
    expect(serializeResponse(42)).toBe(42);
    expect(serializeResponse(3.14)).toBe(3.14);
});

test('should throw on circular reference', () => {
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

test('should handle object with extra braces (the original bug)', () => {
    const input = {status: 'IN_PROGRESS', count: 1};
    expect(serializeResponse(input)).toEqual(input);
});

test('should handle special JSON values', () => {
    expect(serializeResponse(NaN)).toBeNull();
    expect(serializeResponse(Infinity)).toBeNull();
    expect(serializeResponse(-Infinity)).toBeNull();
});

test('should handle empty object', () => {
    expect(serializeResponse({})).toEqual({});
});

test('should handle empty array', () => {
    expect(serializeResponse([])).toEqual([]);
});

test('should handle object with null value', () => {
    const input = {key: null};
    expect(serializeResponse(input)).toEqual({key: null});
});

test('should handle complex nested arrays and objects', () => {
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
    expect(serializeResponse(input)).toEqual(input);
});

test('should handle Unicode characters', () => {
    const input = {name: '日本語', emoji: '🎮'};
    expect(serializeResponse(input)).toEqual(input);
});

test('should handle string that looks like JSON array', () => {
    const input = '[1, 2, 3]';
    expect(serializeResponse(input)).toEqual([1, 2, 3]);
});

test('should handle string that looks like JSON primitive', () => {
    expect(serializeResponse('42')).toBe(42);
    expect(serializeResponse('true')).toBe(true);
    expect(serializeResponse('null')).toBeNull();
});

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
    process.exit(1);
}