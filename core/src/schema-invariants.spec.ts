import { readdirSync } from 'fs';
import { join, parse } from 'path';
import { describe, it, expect } from 'vitest';

describe('Schema Invariants', () => {
    const dbDir = join(__dirname, 'db');
    const gqlDir = join(__dirname, 'gql');

    function getFiles(dir: string, pattern: RegExp): string[] {
        const results: string[] = [];
        const list = readdirSync(dir, { withFileTypes: true });
        for (const file of list) {
            const fullPath = join(dir, file.name);
            if (file.isDirectory()) {
                results.push(...getFiles(fullPath, pattern));
            } else if (pattern.test(file.name)) {
                results.push(file.name);
            }
        }
        return results;
    }

    it('should have a GraphQL object for every DB entity', () => {
        const entityFiles = getFiles(dbDir, /\.entity\.ts$/);
        const objectFiles = getFiles(gqlDir, /\.object\.ts$/);

        // Filter out base classes or abstract entities if any
        const entities = entityFiles
            .filter(f => !['base.entity.ts'].includes(f))
            .map(f => parse(f).name.replace('.entity', ''));

        const objects = objectFiles
            .map(f => parse(f).name.replace('.object', ''));
        
        // Manual mapping or exceptions if naming convention differs
        // e.g. user_auth_account.entity -> user_auth_account.object
        // They should match snake_case

        const missingObjects = entities.filter(entity => !objects.includes(entity));

        // We expect mostly everything to be there. 
        // If there are legitimate exclusions, add them to a whitelist.
        const whitelist: string[] = [];
        
        const actuallyMissing = missingObjects.filter(x => !whitelist.includes(x));

        expect(actuallyMissing).toEqual([]);
    });
});
