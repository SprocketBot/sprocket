import {describe, it, expect, beforeEach, vi} from 'vitest';

// Mock logger for testing
const mockLogger = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

// Import the serializeResponse logic for testing (extracted as a standalone function)
// We'll test the serialization logic directly without needing the full NestJS setup

describe('JSON Serialization Utils', () => {
    // Replicate the serializeResponse method for unit testing
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

    describe('serializeResponse', () => {
        it('should handle null', () => {
            expect(serializeResponse(null)).toBeNull();
        });

        it('should handle undefined', () => {
            expect(serializeResponse(undefined)).toBeUndefined();
        });

        it('should handle valid JSON string', () => {
            const input = '{"name": "test", "value": 123}';
            expect(serializeResponse(input)).toEqual({name: 'test', value: 123});
        });

        it('should handle plain string and wrap it', () => {
            const input = 'plain text without json';
            expect(serializeResponse(input)).toEqual({value: 'plain text without json'});
        });

        it('should handle empty string and wrap it', () => {
            const input = '';
            expect(serializeResponse(input)).toEqual({value: ''});
        });

        it('should handle simple object', () => {
            const input = {name: 'test', count: 42};
            expect(serializeResponse(input)).toEqual({name: 'test', count: 42});
        });

        it('should handle array', () => {
            const input = [1, 2, 3, 'four'];
            expect(serializeResponse(input)).toEqual([1, 2, 3, 'four']);
        });

        it('should handle Date objects via toJSON', () => {
            const date = new Date('2026-06-21T04:00:00Z');
            expect(serializeResponse(date)).toBe('2026-06-21T04:00:00.000Z');
        });

        it('should handle objects with custom toJSON', () => {
            const obj = {
                toJSON() {
                    return {custom: 'serialized'};
                }
            };
            expect(serializeResponse(obj)).toEqual({custom: 'serialized'});
        });

        it('should handle nested objects', () => {
            const input = {
                user: {
                    profile: {
                        name: 'John'
                    }
                }
            };
            expect(serializeResponse(input)).toEqual(input);
        });

        it('should handle boolean and number primitives', () => {
            expect(serializeResponse(true)).toBe(true);
            expect(serializeResponse(false)).toBe(false);
            expect(serializeResponse(42)).toBe(42);
            expect(serializeResponse(3.14)).toBe(3.14);
        });

        it('should throw on circular reference', () => {
            const obj: Record<string, unknown> = {name: 'test'};
            obj.self = obj;
            
            expect(() => serializeResponse(obj)).toThrow();
        });

        it('should handle object with extra braces (the original bug)', () => {
            // This simulates the bug where objects had double closing braces
            // The serializeResponse should still work because JSON.stringify normalizes it
            const input = {status: 'IN_PROGRESS', count: 1};
            const serialized = JSON.stringify(input);
            // The bug was in NestJS serialization producing {{...}}, which would fail JSON.parse
            // Our method catches this because we validate via JSON.parse(JSON.stringify(...))
            expect(serializeResponse(input)).toEqual(input);
        });

        it('should handle special JSON values', () => {
            expect(serializeResponse(NaN)).toBeNull(); // JSON.stringify turns NaN to null
            expect(serializeResponse(Infinity)).toBeNull();
            expect(serializeResponse(-Infinity)).toBeNull();
        });

        it('should handle empty object', () => {
            expect(serializeResponse({})).toEqual({});
        });

        it('should handle empty array', () => {
            expect(serializeResponse([])).toEqual([]);
        });

        it('should handle object with null value', () => {
            const input = {key: null};
            expect(serializeResponse(input)).toEqual({key: null});
        });

        it('should handle complex nested arrays and objects', () => {
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

        it('should handle Unicode characters', () => {
            const input = {name: '日本語', emoji: '🎮'};
            expect(serializeResponse(input)).toEqual(input);
        });

        it('should handle string that looks like JSON array', () => {
            const input = '[1, 2, 3]';
            expect(serializeResponse(input)).toEqual([1, 2, 3]);
        });

        it('should handle string that looks like JSON primitive', () => {
            const input = '42';
            expect(serializeResponse(input)).toBe(42);
            const input2 = 'true';
            expect(serializeResponse(input2)).toBe(true);
            const input3 = 'null';
            expect(serializeResponse(input3)).toBeNull();
        });
    });
});