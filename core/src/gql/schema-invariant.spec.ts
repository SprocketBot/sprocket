import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Schema Invariant', () => {
    const dbDir = path.resolve(__dirname, '../../db');
    const gqlDir = path.resolve(__dirname, '../../gql');

    function getFiles(dir: string, suffix: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getFiles(filePath, suffix));
            } else {
                if (file.endsWith(suffix)) {
                    results.push(filePath);
                }
            }
        });
        return results;
    }

    const entities = getFiles(dbDir, '.entity.ts');
    const objects = getFiles(gqlDir, '.object.ts');

    const getEntityName = (filePath: string) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/class\s+(\w+)Entity/);
        return match ? match[1] : null;
    };

    const getObjectName = (filePath: string) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/class\s+(\w+)Object/);
        return match ? match[1] : null;
    };

    const entityNames = entities.map(getEntityName).filter((n): n is string => n !== null);
    const objectNames = objects.map(getObjectName).filter((n): n is string => n !== null);

    // Map of EntityName -> ObjectName (usually same stem)
    // We expect "MatchSubmission" -> "MatchSubmission"
    
    it('should have a GraphQL Object for every DB Entity', () => {
        const missingObjects: string[] = [];
        
        entityNames.forEach(entityName => {
            // Remove "Entity" suffix if present (it was captured by regex, but regex captured "MatchSubmission" from "MatchSubmissionEntity"?)
            // My regex was `class (\w+)Entity` -> capture group 1 is the name WITHOUT Entity? 
            // ex: `class MatchEntity` -> match[1] = "Match"
            // ex: `class MatchSubmissionEntity` -> match[1] = "MatchSubmission"
            // ex: `class ScrimQueueEntity` -> match[1] = "ScrimQueue"
            
            // Wait, some entities might not have "Entity" suffix in class name?
            // I should check.
            
            if (!objectNames.includes(entityName)) {
                // Try checking if it exists with a slightly different name?
                // For now, strict match.
                missingObjects.push(entityName);
            }
        });

        expect(missingObjects).toEqual([]);
    });
});
